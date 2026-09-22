// supabase/functions/send-push/index.ts
//
// Edge Function que envia uma notificação push real ao browser do
// destinatário, usando o protocolo Web Push (VAPID) — sem depender do
// Firebase.
//
// Deploy:
//   supabase functions deploy send-push
// Segredos necessários (supabase secrets set):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (ex: mailto:suporte@mozservices.co.mz)
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (já disponíveis por omissão no runtime)
//
// Chamada a partir do frontend (ver src/lib/notificacoesPush.ts):
//   supabase.functions.invoke("send-push", {
//     body: { destinatarioId, tipoDestinatario, titulo, corpo, url }
//   })

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import webpush from "npm:web-push@3.6.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:suporte@mozservices.co.mz";

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

interface PedidoPush {
  destinatarioId: string;
  tipoDestinatario: "cliente" | "prestador";
  titulo: string;
  corpo: string;
  url?: string;
}

serve(async (req) => {
  try {
    const { destinatarioId, tipoDestinatario, titulo, corpo, url }: PedidoPush = await req.json();

    const tabela = tipoDestinatario === "cliente" ? "clientes" : "prestadores";
    const idColuna = tipoDestinatario === "cliente" ? "id_cliente" : "id_prestador";

    const { data: usuario, error } = await supabaseAdmin
      .from(tabela)
      .select("push_token")
      .eq(idColuna, destinatarioId)
      .single();

    if (error || !usuario?.push_token) {
      return new Response(JSON.stringify({ enviado: false, motivo: "sem_subscricao" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const subscription = JSON.parse(usuario.push_token);

    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title: titulo, body: corpo, url: url ?? "/" })
    );

    return new Response(JSON.stringify({ enviado: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ enviado: false, erro: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

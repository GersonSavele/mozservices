import { supabase } from "./supabaseClient";

interface EnviarPushParams {
  destinatarioId: string;
  tipoDestinatario: "cliente" | "prestador";
  titulo: string;
  corpo: string;
  url?: string;
}

/**
 * Dispara a Edge Function "send-push" para entregar uma notificação
 * push real ao destinatário. Falha em silêncio (apenas regista no
 * console) porque o push é um "extra" — a notificação já foi gravada
 * na tabela `notificacoes` e vai aparecer na app de qualquer forma.
 */
export async function enviarPush(params: EnviarPushParams) {
  try {
    await supabase.functions.invoke("send-push", { body: params });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Push não entregue:", err);
  }
}

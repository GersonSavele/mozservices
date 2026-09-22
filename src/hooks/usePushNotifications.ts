import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

/**
 * Regista o service worker e pede permissão de notificações push ao
 * utilizador. Guarda a subscrição (JSON) na coluna push_token de
 * clientes/prestadores, para a Edge Function "send-push" a usar depois.
 *
 * Requer VITE_VAPID_PUBLIC_KEY no .env — gerar par de chaves com:
 *   npx web-push generate-vapid-keys
 */
export function usePushNotifications() {
  const { session, perfil } = useAuth();
  const [permissao, setPermissao] = useState<NotificationPermission | "unsupported">(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );
  const [ativando, setAtivando] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* ambiente sem suporte a service worker (ex: preview em iframe) */
      });
    }
  }, []);

  const ativar = useCallback(async () => {
    if (!session?.user || !perfil) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPermissao("unsupported");
      return;
    }
    if (!VAPID_PUBLIC_KEY) {
      // eslint-disable-next-line no-console
      console.warn("VITE_VAPID_PUBLIC_KEY não configurado — push desativado.");
      return;
    }

    setAtivando(true);
    const permissaoResultado = await Notification.requestPermission();
    setPermissao(permissaoResultado);

    if (permissaoResultado === "granted") {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const tabela = perfil === "cliente" ? "clientes" : "prestadores";
      const idColuna = perfil === "cliente" ? "id_cliente" : "id_prestador";

      await supabase
        .from(tabela)
        .update({ push_token: JSON.stringify(subscription) })
        .eq(idColuna, session.user.id);
    }
    setAtivando(false);
  }, [session, perfil]);

  return { permissao, ativando, ativar };
}

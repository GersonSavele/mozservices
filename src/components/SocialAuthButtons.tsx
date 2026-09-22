import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.85.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}

function FacebookLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M18 9a9 9 0 1 0-10.4 8.89v-6.29H5.3V9h2.3V7c0-2.27 1.35-3.53 3.42-3.53.99 0 2.03.18 2.03.18v2.23h-1.14c-1.13 0-1.48.7-1.48 1.42V9h2.52l-.4 2.6h-2.12v6.29A9 9 0 0 0 18 9Z"
      />
    </svg>
  );
}

interface SocialAuthButtonsProps {
  labelSuffix?: string; // "Entrar" ou "Criar conta"
}

export default function SocialAuthButtons({ labelSuffix = "Continuar" }: SocialAuthButtonsProps) {
  const [carregando, setCarregando] = useState<"google" | "facebook" | null>(null);

  async function entrarCom(provider: "google" | "facebook") {
    setCarregando(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin + "/" },
    });
    if (error) {
      setCarregando(null);
      // eslint-disable-next-line no-alert
      alert(
        `Não foi possível iniciar sessão com ${provider === "google" ? "Google" : "Facebook"}: ${error.message}`
      );
    }
    // se não houver erro, o browser é redirecionado — não é preciso mais nada aqui
  }

  return (
    <div className="flex flex-col gap-2.5">
      <button
        type="button"
        onClick={() => entrarCom("google")}
        disabled={carregando !== null}
        className="w-full flex items-center justify-center gap-2.5 rounded-xl border-[1.5px] border-ink/12 bg-white py-3 text-sm font-semibold text-ink disabled:opacity-50 hover:bg-ink/[0.03]"
      >
        <GoogleLogo />
        {carregando === "google" ? "A abrir o Google…" : `${labelSuffix} com Google`}
      </button>
      <button
        type="button"
        onClick={() => entrarCom("facebook")}
        disabled={carregando !== null}
        className="w-full flex items-center justify-center gap-2.5 rounded-xl border-[1.5px] border-ink/12 bg-white py-3 text-sm font-semibold text-ink disabled:opacity-50 hover:bg-ink/[0.03]"
      >
        <FacebookLogo />
        {carregando === "facebook" ? "A abrir o Facebook…" : `${labelSuffix} com Facebook`}
      </button>
    </div>
  );
}

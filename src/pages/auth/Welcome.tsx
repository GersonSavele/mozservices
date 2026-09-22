import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SocialAuthButtons from "../../components/SocialAuthButtons";

export default function Welcome() {
  const navigate = useNavigate();
  const { session, perfil, loading, perfilLoading } = useAuth();

  // se já há sessão (ex: acabou de voltar do Google), manda logo para
  // o sítio certo em vez de mostrar este ecrã outra vez
  useEffect(() => {
    if (loading || perfilLoading || !session) return;
    if (perfil === "cliente") navigate("/inicio", { replace: true });
    else if (perfil === "prestador") navigate("/painel", { replace: true });
    else navigate("/completar-perfil", { replace: true });
  }, [session, perfil, loading, perfilLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-10 max-w-sm mx-auto relative overflow-hidden">
      <div
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-[0.08] pointer-events-none"
        style={{ background: "radial-gradient(circle, #BD5B28 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-32 -left-20 w-72 h-72 rounded-full opacity-[0.06] pointer-events-none"
        style={{ background: "radial-gradient(circle, #2B6249 0%, transparent 70%)" }}
      />

      <div className="text-center mb-9 relative">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="w-3 h-3 bg-rust rotate-45 inline-block" />
          <span className="font-display font-bold text-2xl">MozServices</span>
        </div>
        <p className="text-[13px] text-ink/55 leading-relaxed max-w-[260px] mx-auto">
          Contrata ou oferece serviços de confiança perto de ti
        </p>
      </div>

      <div className="flex flex-col gap-2.5 relative">
        <button
          onClick={() => navigate("/registo/cliente")}
          className="w-full bg-ink text-white font-semibold rounded-xl py-4 text-sm shadow-card hover:opacity-90 active:scale-[0.99]"
        >
          Sou Cliente — quero contratar
        </button>
        <button
          onClick={() => navigate("/registo/prestador")}
          className="w-full border-2 border-ink/15 rounded-xl py-4 text-sm font-semibold hover:bg-ink/[0.03] active:scale-[0.99]"
        >
          Sou Prestador — quero oferecer serviços
        </button>

        <div className="flex items-center gap-3 my-1 text-[11px] text-ink/40">
          <span className="flex-1 h-px bg-ink/10" />
          ou continua com
          <span className="flex-1 h-px bg-ink/10" />
        </div>

        <SocialAuthButtons labelSuffix="Continuar" />
      </div>

      <p className="text-center text-xs text-ink/60 mt-8 relative">
        Já tens conta?{" "}
        <button onClick={() => navigate("/entrar")} className="text-rust font-semibold">
          Entrar
        </button>
      </p>
    </div>
  );
}

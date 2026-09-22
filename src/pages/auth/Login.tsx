import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { Button, ErrorText, Input } from "../../components/UI";
import SocialAuthButtons from "../../components/SocialAuthButtons";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const { session, perfil, loading, perfilLoading } = useAuth();

  useEffect(() => {
    if (loading || perfilLoading || !session) return;
    if (perfil === "cliente") navigate("/inicio", { replace: true });
    else if (perfil === "prestador") navigate("/painel", { replace: true });
    else navigate("/completar-perfil", { replace: true });
  }, [session, perfil, loading, perfilLoading, navigate]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setCarregando(false);
    if (error) {
      setErro(error.message === "Invalid login credentials" ? "Email ou senha incorretos." : error.message);
      return;
    }
    navigate("/inicio");
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-10 max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-8">
        <span className="w-2.5 h-2.5 bg-rust rotate-45 inline-block" />
        <span className="font-display font-bold text-base">MozServices</span>
      </div>

      <h1 className="font-display text-xl font-semibold mb-1">Entrar</h1>
      <p className="text-xs text-ink/60 mb-6">Acede à tua conta para continuar</p>

      <form onSubmit={handleLogin}>
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
        />
        <Input
          label="Palavra-passe"
          type="password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="••••••••"
        />
        <div className="flex justify-end -mt-2 mb-5">
          <button
            type="button"
            onClick={() => navigate("/recuperar-senha")}
            className="text-xs text-rust font-semibold"
          >
            Esqueceste a senha?
          </button>
        </div>

        <ErrorText>{erro}</ErrorText>

        <Button type="submit" className="w-full" disabled={carregando}>
          {carregando ? "A entrar…" : "Entrar"}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6 text-[11px] text-ink/40">
        <span className="flex-1 h-px bg-ink/10" />
        ou
        <span className="flex-1 h-px bg-ink/10" />
      </div>

      <SocialAuthButtons labelSuffix="Entrar" />

      <p className="text-center text-xs text-ink/60 mt-8">
        Não tens conta?{" "}
        <button onClick={() => navigate("/")} className="text-rust font-semibold">
          Criar conta
        </button>
      </p>
    </div>
  );
}

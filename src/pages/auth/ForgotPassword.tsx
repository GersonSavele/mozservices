import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Button, ErrorText, Input, TopBar } from "../../components/UI";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setCarregando(false);
    if (error) {
      setErro(error.message);
      return;
    }
    setEnviado(true);
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-6 max-w-sm mx-auto">
      <TopBar title="Recuperar senha" onBack={() => navigate(-1)} />
      <div className="pt-6">
        {enviado ? (
          <p className="text-sm text-ink/70">
            Enviámos um link de recuperação para <strong>{email}</strong>. Verifique a sua caixa de
            entrada.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-xs text-ink/60 mb-5 leading-relaxed">
              Introduza o email associado à sua conta. Vamos enviar um link de recuperação.
            </p>
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <ErrorText>{erro}</ErrorText>
            <Button type="submit" className="w-full" disabled={carregando}>
              {carregando ? "A enviar…" : "Enviar link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

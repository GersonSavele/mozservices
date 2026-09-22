import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Button, ErrorText, Input, TopBar } from "../../components/UI";

export default function RegisterClient() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setErro("");
    if (senha.length < 8) {
      setErro("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }
    setCarregando(true);

    const { data, error } = await supabase.auth.signUp({ email, password: senha });
    if (error || !data.user) {
      setCarregando(false);
      setErro(error?.message ?? "Não foi possível criar a conta.");
      return;
    }

    const { error: insertError } = await supabase.from("clientes").insert({
      id_cliente: data.user.id,
      nome,
      email,
      telefone,
    });

    setCarregando(false);
    if (insertError) {
      setErro(insertError.message);
      return;
    }
    navigate("/inicio");
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-6 max-w-sm mx-auto">
      <TopBar title="Criar conta" onBack={() => navigate(-1)} />
      <form onSubmit={handleRegister} className="pt-6">
        <Input label="Nome completo" required value={nome} onChange={(e) => setNome(e.target.value)} />
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Telefone"
          type="tel"
          required
          placeholder="+258 84 xxx xxxx"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
        <Input
          label="Palavra-passe"
          type="password"
          required
          minLength={8}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <ErrorText>{erro}</ErrorText>
        <Button type="submit" className="w-full mt-1" disabled={carregando}>
          {carregando ? "A criar conta…" : "Criar conta"}
        </Button>
      </form>
      <p className="text-center text-xs text-ink/60 mt-8">
        Já tem conta?{" "}
        <button onClick={() => navigate("/entrar")} className="text-rust font-semibold">
          Entrar
        </button>
      </p>
    </div>
  );
}

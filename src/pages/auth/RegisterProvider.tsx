import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Button, ErrorText, Input, TopBar } from "../../components/UI";
import CategoryPicker from "../../components/CategoryPicker";
import type { Categoria } from "../../types/database.types";

export default function RegisterProvider() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [tituloServico, setTituloServico] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from("categorias")
      .select("*")
      .order("nome_categoria")
      .then(({ data }) => setCategorias(data ?? []));
  }, []);

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setErro("");
    if (senha.length < 8) {
      setErro("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }
    if (!idCategoria) {
      setErro("Selecione uma categoria.");
      return;
    }
    setCarregando(true);

    const { data, error } = await supabase.auth.signUp({ email, password: senha });
    if (error || !data.user) {
      setCarregando(false);
      setErro(error?.message ?? "Não foi possível criar a conta.");
      return;
    }

    const { error: insertError } = await supabase.from("prestadores").insert({
      id_prestador: data.user.id,
      nome,
      email,
      telefone,
      cidade,
      bairro,
    });

    if (insertError) {
      setCarregando(false);
      setErro(insertError.message);
      return;
    }

    // cria o primeiro serviço associado ao prestador
    const { error: servicoError } = await supabase.from("servicos").insert({
      id_prestador: data.user.id,
      id_categoria: idCategoria,
      titulo: tituloServico || "Serviço geral",
    });

    setCarregando(false);
    if (servicoError) {
      setErro(servicoError.message);
      return;
    }
    navigate("/painel");
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-6 max-w-sm mx-auto">
      <TopBar title="Criar conta de prestador" onBack={() => navigate(-1)} />
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
          label="Telefone (WhatsApp)"
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

        <CategoryPicker categorias={categorias} value={idCategoria} onChange={setIdCategoria} label="Categoria principal" />

        <Input
          label="Título do seu serviço"
          placeholder="Ex: Fabrico e reparação de móveis"
          value={tituloServico}
          onChange={(e) => setTituloServico(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Cidade" required value={cidade} onChange={(e) => setCidade(e.target.value)} />
          <Input label="Bairro" required value={bairro} onChange={(e) => setBairro(e.target.value)} />
        </div>

        <ErrorText>{erro}</ErrorText>
        <Button type="submit" className="w-full mt-1" disabled={carregando}>
          {carregando ? "A criar conta…" : "Criar conta"}
        </Button>
      </form>
    </div>
  );
}

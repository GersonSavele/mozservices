import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { Button, ErrorText, Input } from "../../components/UI";
import CategoryPicker from "../../components/CategoryPicker";
import type { Categoria } from "../../types/database.types";

type Papel = "cliente" | "prestador" | null;

export default function CompleteProfile() {
  const { session, perfil, loading, perfilLoading, refetchPerfil } = useAuth();
  const navigate = useNavigate();

  const [papel, setPapel] = useState<Papel>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [tituloServico, setTituloServico] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate("/entrar", { replace: true });
      return;
    }
    // se entretanto já tem perfil (ex: recarregou a página depois de
    // já ter concluído o registo), não faz sentido continuar aqui
    if (!perfilLoading && perfil) {
      navigate(perfil === "prestador" ? "/painel" : "/inicio", { replace: true });
    }
  }, [session, perfil, loading, perfilLoading, navigate]);

  useEffect(() => {
    // pré-preenche o nome com o que veio do Google/Facebook, se vier
    const nomeGoogle =
      (session?.user?.user_metadata?.full_name as string | undefined) ??
      (session?.user?.user_metadata?.name as string | undefined) ??
      "";
    setNome(nomeGoogle);
  }, [session]);

  useEffect(() => {
    if (papel === "prestador") {
      supabase
        .from("categorias")
        .select("*")
        .order("nome_categoria")
        .then(({ data }) => setCategorias(data ?? []));
    }
  }, [papel]);

  async function finalizar(e: FormEvent) {
    e.preventDefault();
    if (!session?.user) return;
    setErro("");

    if (!nome || !telefone) {
      setErro("Preenche pelo menos o nome e o telefone.");
      return;
    }
    if (papel === "prestador" && (!idCategoria || !cidade || !bairro)) {
      setErro("Como prestador, precisamos também da categoria, cidade e bairro.");
      return;
    }

    setEnviando(true);
    const email = session.user.email ?? "";

    if (papel === "cliente") {
      const { error } = await supabase.from("clientes").insert({
        id_cliente: session.user.id,
        nome,
        email,
        telefone,
        cidade: cidade || null,
        bairro: bairro || null,
      });
      setEnviando(false);
      if (error) {
        setErro(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("prestadores").insert({
        id_prestador: session.user.id,
        nome,
        email,
        telefone,
        cidade,
        bairro,
      });
      if (error) {
        setEnviando(false);
        setErro(error.message);
        return;
      }
      const { error: servicoError } = await supabase.from("servicos").insert({
        id_prestador: session.user.id,
        id_categoria: idCategoria,
        titulo: tituloServico || "Serviço geral",
      });
      setEnviando(false);
      if (servicoError) {
        setErro(servicoError.message);
        return;
      }
    }

    await refetchPerfil();
    navigate(papel === "prestador" ? "/painel" : "/inicio");
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-paper flex flex-col px-6 py-8 max-w-sm mx-auto">
      <div className="text-center mb-7">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 bg-rust rotate-45 inline-block" />
          <span className="font-display font-bold text-base">MozServices</span>
        </div>
        <h1 className="font-display text-xl font-semibold mt-3">Quase lá</h1>
        <p className="text-xs text-ink/60 mt-1.5 leading-relaxed">
          Entraste com {session.user.app_metadata?.provider === "facebook" ? "Facebook" : "Google"}.
          Falta só dizer-nos quem és.
        </p>
      </div>

      {papel === null ? (
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => setPapel("cliente")}
            className="w-full bg-ink text-white font-semibold rounded-xl py-4 text-sm"
          >
            Sou Cliente — quero contratar
          </button>
          <button
            onClick={() => setPapel("prestador")}
            className="w-full border-2 border-ink/15 rounded-xl py-4 text-sm font-semibold"
          >
            Sou Prestador — quero oferecer serviços
          </button>
        </div>
      ) : (
        <form onSubmit={finalizar}>
          <Input label="Nome completo" required value={nome} onChange={(e) => setNome(e.target.value)} />
          <Input
            label="Telefone"
            type="tel"
            required
            placeholder="+258 84 xxx xxxx"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />

          {papel === "prestador" && (
            <>
              <CategoryPicker categorias={categorias} value={idCategoria} onChange={setIdCategoria} label="Categoria principal" />
              <Input
                label="Título do seu serviço"
                placeholder="Ex: Fabrico e reparação de móveis"
                value={tituloServico}
                onChange={(e) => setTituloServico(e.target.value)}
              />
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Cidade"
              required={papel === "prestador"}
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            />
            <Input
              label="Bairro"
              required={papel === "prestador"}
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
            />
          </div>

          <ErrorText>{erro}</ErrorText>

          <div className="flex gap-2.5">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setPapel(null)}>
              Voltar
            </Button>
            <Button type="submit" className="flex-1" disabled={enviando}>
              {enviando ? "A concluir…" : "Concluir"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

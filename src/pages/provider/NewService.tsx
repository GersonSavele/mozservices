import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { Button, ErrorText, Input, Textarea, TopBar } from "../../components/UI";
import CategoryPicker from "../../components/CategoryPicker";
import type { Categoria } from "../../types/database.types";

export default function NewService() {
  const { prestador } = useAuth();
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    supabase.from("categorias").select("*").order("nome_categoria").then(({ data }) => setCategorias(data ?? []));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!prestador || !idCategoria) {
      setErro("Selecione uma categoria.");
      return;
    }
    setEnviando(true);
    const { error } = await supabase.from("servicos").insert({
      id_prestador: prestador.id_prestador,
      id_categoria: idCategoria,
      titulo,
      descricao,
      preco_estimado: preco ? Number(preco) : null,
    });
    setEnviando(false);
    if (error) {
      setErro(error.message);
      return;
    }
    navigate("/painel");
  }

  return (
    <div className="min-h-screen bg-paper max-w-md mx-auto flex flex-col">
      <TopBar title="Novo serviço" onBack={() => navigate(-1)} />
      <form onSubmit={handleSubmit} className="p-4">
        <Input label="Título do serviço" required value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <CategoryPicker categorias={categorias} value={idCategoria} onChange={setIdCategoria} />
        <Textarea
          label="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descreva o que está incluído no serviço"
        />
        <Input
          label="Preço estimado (MZN, opcional)"
          type="number"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />
        <ErrorText>{erro}</ErrorText>
        <Button type="submit" className="w-full" disabled={enviando}>
          {enviando ? "A guardar…" : "Publicar serviço"}
        </Button>
      </form>
    </div>
  );
}

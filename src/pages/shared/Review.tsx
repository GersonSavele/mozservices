import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { Button, ErrorText, TopBar } from "../../components/UI";
import { StarRating } from "../../components/UI";

export default function Review() {
  const { idSolicitacao } = useParams();
  const { cliente } = useAuth();
  const navigate = useNavigate();
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");
  const [prestadorNome, setPrestadorNome] = useState("");
  const [idPrestador, setIdPrestador] = useState("");
  const [servicoTitulo, setServicoTitulo] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    async function carregar() {
      if (!idSolicitacao) return;
      const { data } = await supabase
        .from("solicitacoes")
        .select("id_prestador, prestadores(nome), servicos(titulo)")
        .eq("id_solicitacao", idSolicitacao)
        .single();
      if (data) {
        setIdPrestador(data.id_prestador as string);
        setPrestadorNome((data as any).prestadores?.nome ?? "");
        setServicoTitulo((data as any).servicos?.titulo ?? "");
      }
    }
    carregar();
  }, [idSolicitacao]);

  async function enviarAvaliacao() {
    if (!cliente || !idSolicitacao || !idPrestador) return;
    setEnviando(true);
    setErro("");
    const { error } = await supabase.from("avaliacoes").insert({
      id_solicitacao: idSolicitacao,
      id_cliente: cliente.id_cliente,
      id_prestador: idPrestador,
      nota,
      comentario,
    });
    setEnviando(false);
    if (error) {
      setErro(error.message);
      return;
    }
    navigate("/minhas-solicitacoes");
  }

  return (
    <div className="min-h-screen bg-paper max-w-sm mx-auto flex flex-col">
      <TopBar title="Avaliar serviço" onBack={() => navigate(-1)} />
      <div className="flex-1 flex flex-col items-center text-center px-6 pt-8">
        <div className="w-16 h-16 rounded-full bg-steel text-white flex items-center justify-center font-display font-bold text-lg mb-4 shadow-card">
          {prestadorNome.slice(0, 2).toUpperCase()}
        </div>
        <h1 className="font-display text-lg font-semibold">Como foi o serviço?</h1>
        <p className="text-xs text-ink/50 mb-4">
          {prestadorNome} · {servicoTitulo}
        </p>
        <StarRating value={nota} onChange={setNota} />

        <label className="block w-full text-left mt-5">
          <span className="block text-xs font-semibold text-ink/70 mb-1.5">Comentário</span>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="w-full rounded-xl border-[1.5px] border-ink/12 bg-white px-3.5 py-3 text-sm outline-none focus:border-rust focus:shadow-[0_0_0_3px_rgba(189,91,40,0.12)] min-h-[80px]"
            placeholder="Conte como foi a experiência…"
          />
        </label>
        <ErrorText>{erro}</ErrorText>
        <Button className="w-full mt-2" onClick={enviarAvaliacao} disabled={enviando}>
          {enviando ? "A enviar…" : "Enviar avaliação"}
        </Button>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { Card, ErrorText, TopBar } from "../../components/UI";
import ImageUploader from "../../components/ImageUploader";
import type { ImagemServico, Servico } from "../../types/database.types";

export default function ServiceImages() {
  const { idServico } = useParams();
  const { prestador } = useAuth();
  const navigate = useNavigate();
  const [servico, setServico] = useState<Servico | null>(null);
  const [imagens, setImagens] = useState<ImagemServico[]>([]);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    if (!idServico) return;
    supabase.from("servicos").select("*").eq("id_servico", idServico).single().then(({ data }) => setServico(data));
    supabase
      .from("solicitacoes")
      .select("id_solicitacao", { count: "exact", head: true })
      .eq("id_servico", idServico)
      .then(({ count }) => setTotalPedidos(count ?? 0));
    carregarImagens();
  }, [idServico]);

  async function carregarImagens() {
    if (!idServico) return;
    const { data, error } = await supabase
      .from("imagens_servico")
      .select("*")
      .eq("id_servico", idServico)
      .order("ordem");
    if (error) {
      setErro("Não foi possível carregar as fotos: " + error.message);
      return;
    }
    setImagens(data ?? []);
  }

  async function adicionarImagem(url: string) {
    if (!idServico) return;
    setErro("");
    const { error } = await supabase.from("imagens_servico").insert({
      id_servico: idServico,
      url_imagem: url,
      ordem: imagens.length,
    });
    if (error) {
      setErro(
        "A foto foi enviada mas não ficou guardada no serviço: " +
          error.message +
          ". Verifica se aplicaste fix_imagens_servico_rls.sql no Supabase."
      );
      return;
    }
    setAviso("Foto guardada ✓");
    setTimeout(() => setAviso(""), 2500);
    carregarImagens();
  }

  async function removerImagem(idImagem: string, urlImagem: string) {
    const { error } = await supabase.from("imagens_servico").delete().eq("id_imagem", idImagem);
    if (error) {
      setErro("Não foi possível remover a foto: " + error.message);
      return;
    }
    // extrai o path dentro do bucket a partir do public URL para apagar o ficheiro também
    const marker = "/portfolio/";
    const idx = urlImagem.indexOf(marker);
    if (idx !== -1) {
      const path = urlImagem.slice(idx + marker.length);
      await supabase.storage.from("portfolio").remove([path]);
    }
    carregarImagens();
  }

  async function eliminarServico() {
    if (!idServico || !servico) return;

    const aviso =
      totalPedidos > 0
        ? `Este serviço tem ${totalPedidos} solicitação(ões) associada(s), que também serão apagadas. Esta ação não pode ser desfeita. Queres continuar?`
        : "Esta ação não pode ser desfeita. Queres eliminar este serviço?";
    if (!window.confirm(`Eliminar "${servico.titulo}"?\n\n${aviso}`)) return;

    setEliminando(true);
    setErro("");

    // limpa primeiro os ficheiros no Storage (best-effort — se falhar,
    // não impede a eliminação do serviço, só deixa ficheiros órfãos)
    const paths = imagens
      .map((img) => {
        const marker = "/portfolio/";
        const idx = img.url_imagem.indexOf(marker);
        return idx !== -1 ? img.url_imagem.slice(idx + marker.length) : null;
      })
      .filter((p): p is string => !!p);
    if (paths.length > 0) {
      await supabase.storage.from("portfolio").remove(paths);
    }

    // apagar o serviço cria cascata para imagens_servico, solicitacoes,
    // agendamentos, avaliacoes e notificacoes ligadas a ele (ver schema)
    const { error } = await supabase.from("servicos").delete().eq("id_servico", idServico);

    setEliminando(false);
    if (error) {
      setErro("Não foi possível eliminar o serviço: " + error.message);
      return;
    }
    navigate("/painel", { replace: true });
  }

  if (!servico || !prestador) return <div className="p-6 text-sm text-ink/50">A carregar…</div>;

  return (
    <div className="min-h-screen bg-paper max-w-sm mx-auto flex flex-col">
      <TopBar title={servico.titulo} onBack={() => navigate(-1)} />
      <div className="p-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-ink/70 tracking-wide uppercase">Fotos do trabalho</h4>
            {aviso && <span className="text-[11px] text-green font-medium">{aviso}</span>}
          </div>
          <div className="grid grid-cols-3 gap-2 mb-1">
            {imagens.map((img) => (
              <div key={img.id_imagem} className="relative aspect-square rounded-lg overflow-hidden group">
                <img src={img.url_imagem} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removerImagem(img.id_imagem, img.url_imagem)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/75"
                >
                  <X className="w-3 h-3" strokeWidth={2.5} />
                </button>
              </div>
            ))}
            {imagens.length < 9 && (
              <ImageUploader
                bucket="portfolio"
                folder={prestador.id_prestador}
                compact
                onUploaded={(url) => adicionarImagem(url)}
              />
            )}
          </div>
          <ErrorText>{erro}</ErrorText>
          <p className="text-[11px] text-ink/45 mt-1">
            Até 9 fotos. Cada foto é guardada assim que a escolhes — não é preciso confirmar em mais lado
            nenhum.
          </p>
        </Card>

        <button
          onClick={eliminarServico}
          disabled={eliminando}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-red-500/25 text-red-600 py-3 text-sm font-semibold mt-4 hover:bg-red-500/[0.04] disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" strokeWidth={1.75} />
          {eliminando ? "A eliminar…" : "Eliminar serviço"}
        </button>
      </div>
    </div>
  );
}

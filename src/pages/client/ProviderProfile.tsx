import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BadgeCheck, Phone, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { enviarPush } from "../../lib/notificacoesPush";
import { useAuth } from "../../context/AuthContext";
import { Button, Card, ErrorText, StarRatingDisplay } from "../../components/UI";
import CategoryIcon from "../../components/CategoryIcon";
import type { ImagemServico, Prestador, Servico } from "../../types/database.types";

interface ServicoComCategoria extends Servico {
  categorias: { icone: string | null; nome_categoria: string } | null;
}

export default function ProviderProfile() {
  const { idServico } = useParams();
  const navigate = useNavigate();
  const { cliente } = useAuth();

  const [servico, setServico] = useState<ServicoComCategoria | null>(null);
  const [prestador, setPrestador] = useState<Prestador | null>(null);
  const [imagens, setImagens] = useState<ImagemServico[]>([]);
  const [mensagem, setMensagem] = useState(
    "Olá! Gostaria de solicitar o seu serviço. Pode me dizer disponibilidade e preço?"
  );
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      if (!idServico) return;
      const { data: s } = await supabase
        .from("servicos")
        .select("*, categorias(icone, nome_categoria)")
        .eq("id_servico", idServico)
        .single();
      setServico(s as unknown as ServicoComCategoria);
      if (s) {
        const { data: p } = await supabase
          .from("prestadores")
          .select("*")
          .eq("id_prestador", s.id_prestador)
          .single();
        setPrestador(p);
        const { data: img } = await supabase
          .from("imagens_servico")
          .select("*")
          .eq("id_servico", s.id_servico)
          .order("ordem");
        setImagens(img ?? []);
      }
    }
    carregar();
  }, [idServico]);

  async function enviarSolicitacao() {
    if (!cliente || !servico || !prestador) return;
    setEnviando(true);
    setErro("");
    const { data, error } = await supabase
      .from("solicitacoes")
      .insert({
        id_cliente: cliente.id_cliente,
        id_servico: servico.id_servico,
        id_prestador: prestador.id_prestador,
        mensagem_cliente: mensagem,
      })
      .select()
      .single();
    setEnviando(false);
    if (error) {
      setErro(error.message);
      return;
    }
    // notificação já foi criada na base de dados por um trigger (ver schema);
    // aqui só disparamos o push real para o telemóvel do prestador
    enviarPush({
      destinatarioId: prestador.id_prestador,
      tipoDestinatario: "prestador",
      titulo: "Nova solicitação",
      corpo: `${cliente.nome} quer contratar "${servico.titulo}"`,
      url: `/solicitacao/${data.id_solicitacao}`,
    });
    navigate(`/pedido-enviado/${data.id_solicitacao}`);
  }

  if (!servico || !prestador) {
    return <div className="p-6 text-sm text-ink/50">A carregar…</div>;
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col max-w-md mx-auto">
      <div className="h-32 bg-gradient-to-br from-rust to-rustdark relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/25 text-white flex items-center justify-center hover:bg-black/35"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      <Card className="-mt-8 mx-4 p-4 relative z-[1]">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-steel text-white flex items-center justify-center font-display font-bold text-base flex-shrink-0 overflow-hidden">
            {prestador.foto_perfil_url ? (
              <img src={prestador.foto_perfil_url} alt="" className="w-full h-full object-cover" />
            ) : (
              prestador.nome.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-display text-[16px] font-semibold truncate">{prestador.nome}</p>
              {prestador.verificado && (
                <BadgeCheck className="w-4 h-4 text-green flex-shrink-0" strokeWidth={2} />
              )}
            </div>
            <p className="text-[11.5px] text-ink/50 mt-0.5 flex items-center gap-1">
              <CategoryIcon slug={servico.categorias?.icone} className="w-3.5 h-3.5" />
              {servico.titulo} · {prestador.bairro}, {prestador.cidade}
            </p>
            <p className="text-xs font-semibold mt-1.5 flex items-center gap-1.5">
              <StarRatingDisplay value={prestador.media_avaliacao ?? 0} size={13} />
              {prestador.media_avaliacao?.toFixed(1) ?? "—"}
              <span className="text-ink/45 font-normal ml-0.5">
                ({prestador.total_avaliacoes} avaliações)
              </span>
            </p>
          </div>
        </div>
      </Card>

      <div className="p-4 flex-1">
        {imagens.length > 0 && (
          <>
            <h4 className="text-xs font-semibold text-ink/70 tracking-wide uppercase mb-2">
              Trabalhos recentes
            </h4>
            <div className="grid grid-cols-3 gap-1.5 mb-5">
              {imagens.slice(0, 3).map((img) => (
                <img
                  key={img.id_imagem}
                  src={img.url_imagem}
                  alt={img.legenda ?? ""}
                  className="aspect-square rounded-lg object-cover"
                />
              ))}
            </div>
          </>
        )}

        <h4 className="text-xs font-semibold text-ink/70 tracking-wide uppercase mb-2">Descrição</h4>
        <p className="text-[13px] text-ink/70 leading-relaxed mb-5">
          {servico.descricao ?? prestador.bio ?? "Sem descrição disponível."}
        </p>

        <h4 className="text-xs font-semibold text-ink/70 tracking-wide uppercase mb-2">Enviar pedido</h4>
        <textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          className="w-full rounded-xl border-[1.5px] border-ink/12 bg-white p-3.5 text-[13px] leading-relaxed outline-none focus:border-rust focus:shadow-[0_0_0_3px_rgba(189,91,40,0.12)] min-h-[90px]"
        />
        <div className="mt-2">
          <ErrorText>{erro}</ErrorText>
        </div>
      </div>

      <div className="border-t border-ink/8 bg-white/95 backdrop-blur p-4 flex gap-2.5 sticky bottom-0">
        <a
          href={`tel:${prestador.telefone}`}
          className="w-12 h-12 flex-shrink-0 rounded-xl border-[1.5px] border-ink/12 flex items-center justify-center hover:bg-ink/[0.03]"
        >
          <Phone className="w-4.5 h-4.5" strokeWidth={1.75} />
        </a>
        <Button className="flex-1" onClick={enviarSolicitacao} disabled={enviando}>
          {enviando ? "A enviar…" : "Enviar solicitação"}
        </Button>
      </div>
    </div>
  );
}

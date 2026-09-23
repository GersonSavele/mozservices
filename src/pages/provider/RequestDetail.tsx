import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarDays, Clock, MessageSquare, Briefcase, Phone, MessageCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { enviarPush } from "../../lib/notificacoesPush";
import { useAuth } from "../../context/AuthContext";
import { Button, Card, ErrorText, StarRatingDisplay, StatusBadge, TopBar } from "../../components/UI";
import type { StatusSolicitacao } from "../../types/database.types";

interface Detalhe {
  id_solicitacao: string;
  id_cliente: string;
  id_prestador: string;
  mensagem_cliente: string | null;
  status: StatusSolicitacao;
  clientes: { nome: string; bairro: string | null; telefone: string };
  prestadores: { nome: string; telefone: string };
  servicos: { titulo: string };
}

interface AgendamentoInfo {
  data_servico: string;
  hora_servico: string;
}

export default function RequestDetail() {
  const { idSolicitacao } = useParams();
  const { perfil } = useAuth();
  const navigate = useNavigate();

  const [pedido, setPedido] = useState<Detalhe | null>(null);
  const [agendamento, setAgendamento] = useState<AgendamentoInfo | null>(null);
  const [avaliacao, setAvaliacao] = useState<{ nota: number; comentario: string | null } | null>(null);
  const [dataProposta, setDataProposta] = useState("");
  const [horaProposta, setHoraProposta] = useState("");
  const [processando, setProcessando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarTudo();
  }, [idSolicitacao]);

  async function carregarTudo() {
    if (!idSolicitacao) return;
    setCarregando(true);

    const { data } = await supabase
      .from("solicitacoes")
      .select(
        "id_solicitacao, id_cliente, id_prestador, mensagem_cliente, status, clientes(nome, bairro, telefone), prestadores(nome, telefone), servicos(titulo)"
      )
      .eq("id_solicitacao", idSolicitacao)
      .single();
    setPedido(data as unknown as Detalhe);

    const { data: ag } = await supabase
      .from("agendamentos")
      .select("data_servico, hora_servico")
      .eq("id_solicitacao", idSolicitacao)
      .maybeSingle();
    setAgendamento(ag);

    const { data: av } = await supabase
      .from("avaliacoes")
      .select("nota, comentario")
      .eq("id_solicitacao", idSolicitacao)
      .maybeSingle();
    setAvaliacao(av);

    setCarregando(false);
  }

  async function atualizarStatus(novoStatus: StatusSolicitacao) {
    if (!idSolicitacao || !pedido) return;
    setProcessando(true);
    setErro("");

    // .select().single() é de propósito: sem isto, uma atualização
    // bloqueada pelo RLS (ou por qualquer outro motivo) não dá erro
    // nenhum — só devolve 0 linhas em silêncio, e o ecrã fica preso
    // no estado antigo sem explicação nenhuma.
    const { data: linhaAtualizada, error } = await supabase
      .from("solicitacoes")
      .update({ status: novoStatus })
      .eq("id_solicitacao", idSolicitacao)
      .select()
      .single();

    if (error || !linhaAtualizada) {
      setProcessando(false);
      setErro(
        error?.message ??
          "A atualização não foi aplicada (0 linhas alteradas). Verifica as políticas de RLS da tabela solicitacoes."
      );
      return;
    }

    if (novoStatus === "aceite" && dataProposta && horaProposta) {
      const { error: agendamentoError } = await supabase.from("agendamentos").upsert(
        { id_solicitacao: idSolicitacao, data_servico: dataProposta, hora_servico: horaProposta },
        { onConflict: "id_solicitacao" }
      );
      if (agendamentoError) {
        setErro("Pedido aceite, mas não foi possível guardar a data: " + agendamentoError.message);
      }
    }

    const destinoCliente = perfil === "prestador";
    const mensagensPorStatus: Record<string, { titulo: string; corpo: string }> = {
      aceite: {
        titulo: "Pedido aceite!",
        corpo: `O prestador aceitou o seu pedido de "${pedido.servicos?.titulo}"`,
      },
      recusada: {
        titulo: "Pedido recusado",
        corpo: `O prestador não pôde aceitar o seu pedido de "${pedido.servicos?.titulo}"`,
      },
      concluida: {
        titulo: "Serviço concluído",
        corpo: `O serviço "${pedido.servicos?.titulo}" foi marcado como concluído. Avalie a experiência!`,
      },
    };
    if (destinoCliente && mensagensPorStatus[novoStatus]) {
      enviarPush({
        destinatarioId: pedido.id_cliente,
        tipoDestinatario: "cliente",
        ...mensagensPorStatus[novoStatus],
        url: `/solicitacao/${idSolicitacao}`,
      });
    }

    setProcessando(false);
    await carregarTudo();
  }

  async function cancelarComoCliente() {
    await atualizarStatus("cancelada");
    navigate("/minhas-solicitacoes");
  }

  if (carregando || !pedido) return <div className="p-6 text-sm text-ink/50">A carregar…</div>;

  const outraParte = perfil === "prestador" ? pedido.clientes : pedido.prestadores;

  return (
    <div className="min-h-screen bg-paper max-w-md mx-auto flex flex-col">
      <TopBar title="Solicitação" onBack={() => navigate(-1)} />
      <div className="p-4 flex-1">
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-lg bg-steel text-white flex items-center justify-center font-display font-bold text-sm">
                {outraParte?.nome?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-[13.5px] font-semibold">{outraParte?.nome}</p>
                <p className="text-[11px] text-ink/50">
                  {perfil === "prestador" ? pedido.clientes?.bairro : pedido.prestadores?.telefone}
                </p>
              </div>
            </div>
            <StatusBadge status={pedido.status} />
          </div>

          <div className="flex items-start gap-2 mb-3">
            <Briefcase className="w-3.5 h-3.5 text-ink/40 mt-0.5 flex-shrink-0" strokeWidth={1.75} />
            <p className="text-[13px] text-ink/80">{pedido.servicos?.titulo}</p>
          </div>

          <div className="flex items-start gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-ink/40 mt-0.5 flex-shrink-0" strokeWidth={1.75} />
            <p className="text-[13px] text-ink/70 leading-relaxed">{pedido.mensagem_cliente}</p>
          </div>

          {agendamento && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-ink/8">
              <span className="flex items-center gap-1.5 text-[12.5px] text-ink/70 font-medium">
                <CalendarDays className="w-3.5 h-3.5 text-rust" strokeWidth={1.75} />
                {new Date(agendamento.data_servico).toLocaleDateString("pt-MZ", {
                  day: "2-digit",
                  month: "long",
                })}
              </span>
              <span className="flex items-center gap-1.5 text-[12.5px] text-ink/70 font-medium">
                <Clock className="w-3.5 h-3.5 text-rust" strokeWidth={1.75} />
                {agendamento.hora_servico?.slice(0, 5)}
              </span>
            </div>
          )}

          {/* Assim que o pedido é aceite, cada parte vê como contactar a outra diretamente */}
          {(pedido.status === "aceite" || pedido.status === "concluida") && outraParte?.telefone && (
            <div className="flex gap-2.5 mt-3 pt-3 border-t border-ink/8">
              <a
                href={`tel:${outraParte.telefone}`}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-ink/12 py-2.5 text-xs font-semibold hover:bg-ink/[0.03]"
              >
                <Phone className="w-3.5 h-3.5" strokeWidth={1.75} />
                Ligar
              </a>
              <a
                href={`https://wa.me/${outraParte.telefone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-green/30 bg-green/8 text-green py-2.5 text-xs font-semibold hover:bg-green/15"
              >
                <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.75} />
                Enviar mensagem
              </a>
            </div>
          )}
        </Card>

        <div className="mb-4">
          <ErrorText>{erro}</ErrorText>
        </div>

        {/* Prestador: pedido pendente — aceitar/recusar com data proposta */}
        {perfil === "prestador" && pedido.status === "pendente" && (
          <Card className="p-4 mb-4">
            <h4 className="text-xs font-semibold text-ink/70 tracking-wide uppercase mb-2.5">
              Propor data para o serviço
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="date"
                value={dataProposta}
                onChange={(e) => setDataProposta(e.target.value)}
                className="border-[1.5px] border-ink/12 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-rust"
              />
              <input
                type="time"
                value={horaProposta}
                onChange={(e) => setHoraProposta(e.target.value)}
                className="border-[1.5px] border-ink/12 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-rust"
              />
            </div>
          </Card>
        )}

        {/* Cliente: pedido aceite — pode editar/cancelar o agendamento */}
        {perfil === "cliente" && pedido.status === "aceite" && (
          <Button
            variant="outline"
            className="w-full mb-4"
            onClick={() => navigate(`/agendamento/${idSolicitacao}`)}
          >
            {agendamento ? "Editar agendamento" : "Marcar data com o prestador"}
          </Button>
        )}

        {/* Avaliação já existente — visível para ambas as partes */}
        {avaliacao && (
          <Card className="p-4 mb-4">
            <h4 className="text-xs font-semibold text-ink/70 tracking-wide uppercase mb-2">Avaliação</h4>
            <div className="mb-1.5">
              <StarRatingDisplay value={avaliacao.nota} size={16} />
            </div>
            {avaliacao.comentario && (
              <p className="text-[13px] text-ink/70 leading-relaxed">{avaliacao.comentario}</p>
            )}
          </Card>
        )}

        {/* Cliente: serviço concluído — avaliar (uma única vez) */}
        {perfil === "cliente" && pedido.status === "concluida" && !avaliacao && (
          <Button className="w-full" onClick={() => navigate(`/avaliar/${idSolicitacao}`)}>
            Avaliar serviço
          </Button>
        )}
      </div>

      {/* Prestador: aceitar/recusar */}
      {perfil === "prestador" && pedido.status === "pendente" && (
        <div className="border-t border-ink/8 bg-white/95 backdrop-blur p-4 flex gap-2.5 sticky bottom-0">
          <Button
            variant="outline"
            className="flex-1"
            disabled={processando}
            onClick={() => atualizarStatus("recusada")}
          >
            Recusar
          </Button>
          <Button
            className="flex-1 bg-green hover:bg-green"
            disabled={processando}
            onClick={() => atualizarStatus("aceite")}
          >
            Aceitar pedido
          </Button>
        </div>
      )}

      {/* Prestador: marcar como concluído depois de aceite */}
      {perfil === "prestador" && pedido.status === "aceite" && (
        <div className="border-t border-ink/8 bg-white/95 backdrop-blur p-4 sticky bottom-0">
          <Button className="w-full bg-green hover:bg-green" disabled={processando} onClick={() => atualizarStatus("concluida")}>
            Marcar serviço como concluído
          </Button>
        </div>
      )}

      {/* Cliente: pode cancelar enquanto ainda não foi concluído */}
      {perfil === "cliente" && (pedido.status === "pendente" || pedido.status === "aceite") && (
        <div className="border-t border-ink/8 bg-white/95 backdrop-blur p-4 sticky bottom-0">
          <Button
            variant="outline"
            className="w-full !text-red-600 !border-red-600"
            disabled={processando}
            onClick={cancelarComoCliente}
          >
            Cancelar solicitação
          </Button>
        </div>
      )}
    </div>
  );
}

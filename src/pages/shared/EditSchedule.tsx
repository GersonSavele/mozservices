import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Button, Card, ErrorText, TopBar } from "../../components/UI";

export default function EditSchedule() {
  const { idSolicitacao } = useParams();
  const navigate = useNavigate();
  const [servicoTitulo, setServicoTitulo] = useState("");
  const [prestadorNome, setPrestadorNome] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [erro, setErro] = useState("");
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    async function carregar() {
      if (!idSolicitacao) return;
      const { data: sol } = await supabase
        .from("solicitacoes")
        .select("servicos(titulo), prestadores(nome)")
        .eq("id_solicitacao", idSolicitacao)
        .single();
      setServicoTitulo((sol as any)?.servicos?.titulo ?? "");
      setPrestadorNome((sol as any)?.prestadores?.nome ?? "");

      const { data: ag } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("id_solicitacao", idSolicitacao)
        .maybeSingle();
      if (ag) {
        setData(ag.data_servico);
        setHora(ag.hora_servico);
      }
    }
    carregar();
  }, [idSolicitacao]);

  async function guardar() {
    if (!idSolicitacao) return;
    setProcessando(true);
    setErro("");
    const { error } = await supabase
      .from("agendamentos")
      .upsert(
        { id_solicitacao: idSolicitacao, data_servico: data, hora_servico: hora, atualizado_em: new Date().toISOString() },
        { onConflict: "id_solicitacao" }
      );
    setProcessando(false);
    if (error) {
      setErro(error.message);
      return;
    }
    navigate(-1);
  }

  async function cancelar() {
    if (!idSolicitacao) return;
    setProcessando(true);
    const { error } = await supabase
      .from("solicitacoes")
      .update({ status: "cancelada" })
      .eq("id_solicitacao", idSolicitacao);
    setProcessando(false);
    if (error) {
      setErro(error.message);
      return;
    }
    navigate("/minhas-solicitacoes");
  }

  return (
    <div className="min-h-screen bg-paper max-w-sm mx-auto flex flex-col">
      <TopBar title="Editar agendamento" onBack={() => navigate(-1)} />
      <div className="p-4 flex-1">
        <Card className="p-4">
          <h4 className="text-xs font-semibold text-ink/70 tracking-wide uppercase mb-1.5">Serviço</h4>
          <p className="text-[13px] text-ink/70 mb-4">
            {servicoTitulo} — {prestadorNome}
          </p>

          <h4 className="text-xs font-semibold text-ink/70 tracking-wide uppercase mb-1.5">Nova data</h4>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full border-[1.5px] border-ink/12 rounded-xl px-3 py-3 text-sm outline-none focus:border-rust mb-4"
          />

          <h4 className="text-xs font-semibold text-ink/70 tracking-wide uppercase mb-1.5">Nova hora</h4>
          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="w-full border-[1.5px] border-ink/12 rounded-xl px-3 py-3 text-sm outline-none focus:border-rust"
          />
          <div className="mt-3">
            <ErrorText>{erro}</ErrorText>
          </div>
        </Card>
      </div>
      <div className="border-t border-ink/8 bg-white/95 backdrop-blur p-4 flex gap-2.5 sticky bottom-0">
        <Button
          variant="outline"
          className="flex-1 !text-red-600 !border-red-600"
          disabled={processando}
          onClick={cancelar}
        >
          Cancelar serviço
        </Button>
        <Button className="flex-1" disabled={processando} onClick={guardar}>
          Guardar alteração
        </Button>
      </div>
    </div>
  );
}

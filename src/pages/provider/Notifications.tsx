import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, CheckCircle2, XCircle, CalendarClock, Trophy, Star, Bell } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { Card, Screen } from "../../components/UI";
import BottomNav from "../../components/BottomNav";
import type { Notificacao } from "../../types/database.types";

const ICONS: Record<string, { Icon: typeof Bell; bg: string; fg: string }> = {
  nova_solicitacao: { Icon: Mail, bg: "bg-rust/12", fg: "text-rust" },
  solicitacao_aceite: { Icon: CheckCircle2, bg: "bg-green/12", fg: "text-green" },
  solicitacao_recusada: { Icon: XCircle, bg: "bg-red-500/10", fg: "text-red-600" },
  agendamento_alterado: { Icon: CalendarClock, bg: "bg-steel/10", fg: "text-steel" },
  servico_concluido: { Icon: Trophy, bg: "bg-green/12", fg: "text-green" },
  nova_avaliacao: { Icon: Star, bg: "bg-ochre/15", fg: "text-[#9C6C1E]" },
  lembrete: { Icon: Bell, bg: "bg-steel/10", fg: "text-steel" },
};

export default function Notifications() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);

  useEffect(() => {
    if (!session?.user) return;

    async function carregar() {
      const { data } = await supabase
        .from("notificacoes")
        .select("*")
        .eq("id_destinatario", session!.user.id)
        .order("data_envio", { ascending: false });
      setNotificacoes(data ?? []);
    }
    carregar();

    const canal = supabase
      .channel("notificacoes-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notificacoes", filter: `id_destinatario=eq.${session.user.id}` },
        (payload) => setNotificacoes((prev) => [payload.new as Notificacao, ...prev])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [session]);

  async function abrir(n: Notificacao) {
    if (!n.visualizado) {
      await supabase.from("notificacoes").update({ visualizado: true }).eq("id_notificacao", n.id_notificacao);
      setNotificacoes((prev) =>
        prev.map((x) => (x.id_notificacao === n.id_notificacao ? { ...x, visualizado: true } : x))
      );
    }
    if (n.id_solicitacao) navigate(`/solicitacao/${n.id_solicitacao}`);
  }

  return (
    <Screen>
      <div className="px-5 pt-6 pb-4 bg-white border-b border-ink/8">
        <h1 className="font-display text-lg font-semibold">Notificações</h1>
      </div>
      <div className="flex-1 px-4 py-4 flex flex-col gap-2">
        {notificacoes.length === 0 && (
          <Card className="p-6 text-center mt-2">
            <p className="text-xs text-ink/50">Sem notificações por enquanto.</p>
          </Card>
        )}
        {notificacoes.map((n) => {
          const cfg = ICONS[n.tipo] ?? { Icon: Bell, bg: "bg-ink/8", fg: "text-ink/60" };
          const { Icon } = cfg;
          return (
            <Card
              key={n.id_notificacao}
              className={`p-0 overflow-hidden ${!n.visualizado ? "border-rust/25" : ""}`}
            >
              <button onClick={() => abrir(n)} className="flex gap-3 p-3.5 w-full text-left items-start">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <Icon className={`w-4 h-4 ${cfg.fg}`} strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12.5px] font-semibold leading-snug">{n.mensagem}</p>
                    {!n.visualizado && (
                      <span className="w-2 h-2 rounded-full bg-rust flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-[10.5px] text-ink/40 mt-1">
                    {new Date(n.data_envio).toLocaleString("pt-MZ", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </button>
            </Card>
          );
        })}
      </div>
      <BottomNav />
    </Screen>
  );
}

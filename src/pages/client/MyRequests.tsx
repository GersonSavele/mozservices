import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { Card, Screen, StatusBadge } from "../../components/UI";
import CategoryIcon from "../../components/CategoryIcon";
import BottomNav from "../../components/BottomNav";
import type { StatusSolicitacao } from "../../types/database.types";

interface PedidoResumo {
  id_solicitacao: string;
  status: StatusSolicitacao;
  data_solicitacao: string;
  nome_prestador: string;
  foto_prestador: string | null;
  titulo_servico: string;
  icone_categoria: string | null;
}

export default function MyRequests() {
  const { cliente } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<PedidoResumo[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!cliente) return;

    async function carregar() {
      const { data, error } = await supabase
        .from("solicitacoes")
        .select(
          "id_solicitacao, status, data_solicitacao, prestadores(nome, foto_perfil_url), servicos(titulo, categorias(icone))"
        )
        .eq("id_cliente", cliente!.id_cliente)
        .order("data_solicitacao", { ascending: false });

      if (!error && data) {
        setPedidos(
          data.map((d: any) => ({
            id_solicitacao: d.id_solicitacao,
            status: d.status,
            data_solicitacao: d.data_solicitacao,
            nome_prestador: d.prestadores?.nome ?? "",
            foto_prestador: d.prestadores?.foto_perfil_url ?? null,
            titulo_servico: d.servicos?.titulo ?? "",
            icone_categoria: d.servicos?.categorias?.icone ?? null,
          }))
        );
      }
      setCarregando(false);
    }
    carregar();
  }, [cliente]);

  return (
    <Screen>
      <div className="px-5 pt-6 pb-4 bg-white border-b border-ink/8">
        <h1 className="font-display text-lg font-semibold">Minhas solicitações</h1>
      </div>
      <div className="flex-1 px-4 py-4 flex flex-col gap-2.5">
        {carregando && <p className="text-xs text-ink/50 px-2">A carregar…</p>}
        {!carregando && pedidos.length === 0 && (
          <Card className="p-6 text-center mt-2">
            <p className="text-xs text-ink/50 mb-1">Ainda não enviaste nenhum pedido.</p>
            <p className="text-[11px] text-ink/40">Busca um prestador no início para começares.</p>
          </Card>
        )}
        {pedidos.map((p) => (
          <Card key={p.id_solicitacao} className="p-0 overflow-hidden hover:border-ink/20">
            <button
              onClick={() => navigate(`/solicitacao/${p.id_solicitacao}`)}
              className="flex items-center gap-3 p-3.5 w-full text-left"
            >
              <div className="w-11 h-11 rounded-lg bg-steel text-white flex items-center justify-center font-display font-bold text-sm flex-shrink-0 overflow-hidden">
                {p.foto_prestador ? (
                  <img src={p.foto_prestador} alt="" className="w-full h-full object-cover" />
                ) : (
                  p.nome_prestador.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <span className="text-[13px] font-semibold truncate">{p.nome_prestador}</span>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-[11.5px] text-ink/60 flex items-center gap-1.5">
                  <CategoryIcon slug={p.icone_categoria} className="w-3.5 h-3.5 text-ink/40" />
                  {p.titulo_servico}
                </p>
                <p className="text-[10px] text-ink/40 mt-1">
                  {new Date(p.data_solicitacao).toLocaleDateString("pt-MZ", {
                    day: "2-digit",
                    month: "short",
                  })}
                </p>
              </div>
            </button>
          </Card>
        ))}
      </div>
      <BottomNav />
    </Screen>
  );
}

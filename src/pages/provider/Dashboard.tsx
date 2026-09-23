import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { Card, Screen } from "../../components/UI";
import CategoryIcon from "../../components/CategoryIcon";
import BottomNav from "../../components/BottomNav";
import type { Servico } from "../../types/database.types";

interface ServicoComCategoria extends Servico {
  categorias: { icone: string | null; nome_categoria: string } | null;
}

export default function Dashboard() {
  const { prestador } = useAuth();
  const navigate = useNavigate();
  const [servicos, setServicos] = useState<ServicoComCategoria[]>([]);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [fotosPorServico, setFotosPorServico] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!prestador) return;
    supabase
      .from("servicos")
      .select("*, categorias(icone, nome_categoria)")
      .eq("id_prestador", prestador.id_prestador)
      .then(async ({ data }) => {
        const lista = (data as unknown as ServicoComCategoria[]) ?? [];
        setServicos(lista);

        if (lista.length > 0) {
          const { data: imagens } = await supabase
            .from("imagens_servico")
            .select("id_servico")
            .in(
              "id_servico",
              lista.map((s) => s.id_servico)
            );
          const contagem: Record<string, number> = {};
          (imagens ?? []).forEach((img: { id_servico: string }) => {
            contagem[img.id_servico] = (contagem[img.id_servico] ?? 0) + 1;
          });
          setFotosPorServico(contagem);
        }
      });

    supabase
      .from("solicitacoes")
      .select("id_solicitacao", { count: "exact", head: true })
      .eq("id_prestador", prestador.id_prestador)
      .then(({ count }) => setTotalPedidos(count ?? 0));
  }, [prestador]);

  return (
    <Screen>
      <div className="bg-steel text-paper px-5 pt-6 pb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/12 flex items-center justify-center font-display font-bold text-[15px] overflow-hidden flex-shrink-0">
            {prestador?.foto_perfil_url ? (
              <img src={prestador.foto_perfil_url} alt="" className="w-full h-full object-cover" />
            ) : (
              prestador?.nome?.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-[11px] opacity-70 mb-0.5">Painel</p>
            <p className="font-display text-[17px] font-semibold leading-tight">{prestador?.nome}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 px-4 -mt-5 relative z-[1]">
        <Card className="py-3 text-center">
          <p className="font-display text-xl font-bold">{totalPedidos}</p>
          <p className="text-[9.5px] text-ink/50 mt-0.5 tracking-wide uppercase">Pedidos</p>
        </Card>
        <Card className="py-3 text-center">
          <p className="font-display text-xl font-bold">{prestador?.media_avaliacao?.toFixed(1) ?? "—"}</p>
          <p className="text-[9.5px] text-ink/50 mt-0.5 tracking-wide uppercase">Avaliação</p>
        </Card>
        <Card className="py-3 text-center">
          <p className="font-display text-xl font-bold">{servicos.length}</p>
          <p className="text-[9.5px] text-ink/50 mt-0.5 tracking-wide uppercase">Serviços</p>
        </Card>
      </div>

      <div className="px-4 pt-6 pb-4 flex-1 relative">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-ink/70 tracking-wide uppercase">Meus serviços</h4>
          <button
            onClick={() => navigate("/painel/novo-servico")}
            className="text-[11px] font-semibold text-rust"
          >
            + Novo serviço
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {servicos.map((s) => {
            const numFotos = fotosPorServico[s.id_servico] ?? 0;
            return (
              <Card
                key={s.id_servico}
                className="p-0 overflow-hidden hover:border-ink/20 transition-colors"
              >
                <button
                  onClick={() => navigate(`/painel/servico/${s.id_servico}/fotos`)}
                  className="flex items-center gap-3 px-3.5 py-3 w-full text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-paper flex items-center justify-center flex-shrink-0 text-ink/70">
                    <CategoryIcon slug={s.categorias?.icone} className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate">{s.titulo}</p>
                    <p className="text-[10.5px] text-ink/45 mt-0.5">
                      {s.categorias?.nome_categoria} · {s.ativo ? "Ativo" : "Inativo"}
                    </p>
                  </div>
                  {numFotos === 0 ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-rust px-3 py-1.5 rounded-full flex-shrink-0 shadow-card">
                      <Camera className="w-3.5 h-3.5" strokeWidth={2.25} />
                      Adicionar fotos
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-ink/60 bg-ink/6 px-3 py-1.5 rounded-full flex-shrink-0">
                      <Camera className="w-3.5 h-3.5" strokeWidth={2} />
                      {numFotos} {numFotos === 1 ? "foto" : "fotos"}
                    </span>
                  )}
                  <span className="text-ink/25 text-lg">›</span>
                </button>
              </Card>
            );
          })}

          {servicos.length === 0 && (
            <Card className="p-6 text-center">
              <p className="text-xs text-ink/50 mb-1">Ainda não tens serviços publicados.</p>
              <p className="text-[11px] text-ink/40">
                Toca em "+ Novo serviço" para começares a receber pedidos.
              </p>
            </Card>
          )}
        </div>
      </div>
      <BottomNav />
    </Screen>
  );
}

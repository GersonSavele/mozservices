import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { Screen, StarRatingDisplay } from "../../components/UI";
import CategoryIcon from "../../components/CategoryIcon";
import BottomNav from "../../components/BottomNav";
import type { Categoria } from "../../types/database.types";

interface ServicoComPrestador {
  id_servico: string;
  titulo: string;
  id_prestador: string;
  categorias: { icone: string | null } | null;
  prestadores: {
    nome: string;
    bairro: string | null;
    cidade: string | null;
    foto_perfil_url: string | null;
    media_avaliacao: number;
    total_avaliacoes: number;
    disponivel: boolean;
  };
}

export default function Home() {
  const { cliente } = useAuth();
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<ServicoComPrestador[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase
      .from("categorias")
      .select("*")
      .order("nome_categoria")
      .then(({ data }) => setCategorias(data ?? []));
  }, []);

  useEffect(() => {
    async function buscar() {
      setCarregando(true);
      let query = supabase
        .from("servicos")
        .select(
          "id_servico, titulo, id_prestador, categorias(icone), prestadores(nome, bairro, cidade, foto_perfil_url, media_avaliacao, total_avaliacoes, disponivel)"
        )
        .eq("ativo", true)
        .limit(30);

      if (categoriaAtiva) query = query.eq("id_categoria", categoriaAtiva);
      if (busca.trim()) query = query.ilike("titulo", `%${busca.trim()}%`);

      const { data } = await query;
      setResultados((data as unknown as ServicoComPrestador[]) ?? []);
      setCarregando(false);
    }
    buscar();
  }, [categoriaAtiva, busca]);

  return (
    <Screen>
      <div className="bg-steel text-paper px-5 pt-5 pb-5">
        <p className="text-xs opacity-75 mb-1">Boa tarde, {cliente?.nome?.split(" ")[0] ?? ""}</p>
        <p className="font-display text-lg font-semibold mb-3">
          {cliente?.cidade ?? "Moçambique"}
          {cliente?.bairro ? `, ${cliente.bairro}` : ""}
        </p>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="🔍 Carpinteiro, serralheiro…"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/60 outline-none"
        />
      </div>

      <div className="flex gap-2 px-5 py-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setCategoriaAtiva(null)}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border whitespace-nowrap ${
            !categoriaAtiva ? "bg-rust border-rust text-white" : "border-ink/15 text-ink/70"
          }`}
        >
          Todos
        </button>
        {categorias.map((c) => (
          <button
            key={c.id_categoria}
            onClick={() => setCategoriaAtiva(c.id_categoria)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border whitespace-nowrap ${
              categoriaAtiva === c.id_categoria
                ? "bg-rust border-rust text-white"
                : "border-ink/15 text-ink/70"
            }`}
          >
            <CategoryIcon slug={c.icone} className="w-3.5 h-3.5" />
            {c.nome_categoria}
          </button>
        ))}
      </div>

      <div className="flex-1 px-5 pb-4 flex flex-col gap-2.5">
        {carregando && <p className="text-xs text-ink/50 mt-4">A procurar prestadores…</p>}
        {!carregando && resultados.length === 0 && (
          <p className="text-xs text-ink/50 mt-4">Nenhum prestador encontrado para essa busca.</p>
        )}
        {resultados.map((s) => (
          <button
            key={s.id_servico}
            onClick={() => navigate(`/servico/${s.id_servico}`)}
            className="border border-ink/10 rounded-xl p-3.5 flex gap-3.5 items-center bg-white text-left hover:border-ink/20 transition-colors"
          >
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-xl bg-steel text-white flex items-center justify-center font-display font-bold text-base overflow-hidden">
                {s.prestadores?.foto_perfil_url ? (
                  <img
                    src={s.prestadores.foto_perfil_url}
                    alt={s.prestadores.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  s.prestadores?.nome?.slice(0, 2).toUpperCase()
                )}
              </div>
              {s.prestadores?.disponivel && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green border-2 border-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold truncate">{s.prestadores?.nome}</p>
              <p className="text-[12.5px] text-ink/55 mt-0.5 flex items-center gap-1.5">
                <CategoryIcon slug={s.categorias?.icone} className="w-3.5 h-3.5 text-rust flex-shrink-0" />
                <span className="truncate">{s.titulo}</span>
              </p>
              <p className="text-[12px] text-ink/60 mt-1.5 flex items-center gap-2.5">
                <span className="flex items-center gap-1.5 font-medium">
                  <StarRatingDisplay value={s.prestadores?.media_avaliacao ?? 0} size={12} />
                  {s.prestadores?.media_avaliacao?.toFixed(1) ?? "—"}
                  <span className="text-ink/40 font-normal">({s.prestadores?.total_avaliacoes ?? 0})</span>
                </span>
                {s.prestadores?.bairro && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-steel" />
                    {s.prestadores.bairro}
                  </span>
                )}
              </p>
            </div>
          </button>
        ))}
      </div>
      <BottomNav />
    </Screen>
  );
}

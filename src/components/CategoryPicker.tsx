import CategoryIcon from "./CategoryIcon";
import type { Categoria } from "../types/database.types";

export default function CategoryPicker({
  categorias,
  value,
  onChange,
  label = "Categoria",
}: {
  categorias: Categoria[];
  value: string;
  onChange: (idCategoria: string) => void;
  label?: string;
}) {
  return (
    <div className="mb-4">
      <span className="block text-xs font-semibold text-ink/70 mb-2">{label}</span>
      <div className="grid grid-cols-3 gap-2">
        {categorias.map((c) => {
          const ativo = value === c.id_categoria;
          return (
            <button
              key={c.id_categoria}
              type="button"
              onClick={() => onChange(c.id_categoria)}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-[1.5px] px-2 py-3 text-center transition-colors ${
                ativo
                  ? "border-rust bg-rust/8 text-rust"
                  : "border-ink/12 text-ink/60 hover:border-ink/25"
              }`}
            >
              <CategoryIcon slug={c.icone} className="w-5 h-5" />
              <span className="text-[10.5px] font-medium leading-tight">{c.nome_categoria}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

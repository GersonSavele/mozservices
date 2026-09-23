import { useState } from "react";
import { MapPin, LoaderCircle, CheckCircle2 } from "lucide-react";
import { obterLocalizacaoAtual } from "../lib/geo";

export default function LocationCaptureButton({
  jaDefinida,
  onCapturada,
  descricao = "Isto permite que clientes te encontrem por proximidade. A tua localização exata nunca é mostrada — só a distância aproximada.",
}: {
  jaDefinida: boolean;
  onCapturada: (lat: number, lng: number) => void;
  descricao?: string;
}) {
  const [aObter, setAObter] = useState(false);
  const [erro, setErro] = useState("");

  async function capturar() {
    setAObter(true);
    setErro("");
    try {
      const { latitude, longitude } = await obterLocalizacaoAtual();
      onCapturada(latitude, longitude);
    } catch (err: any) {
      setErro(err.message ?? "Não foi possível obter a localização.");
    }
    setAObter(false);
  }

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={capturar}
        disabled={aObter}
        className={`w-full flex items-center justify-center gap-2 rounded-xl border-[1.5px] py-3 text-sm font-semibold disabled:opacity-60 ${
          jaDefinida ? "border-green/30 bg-green/8 text-green" : "border-ink/12 text-ink hover:bg-ink/[0.03]"
        }`}
      >
        {aObter ? (
          <>
            <LoaderCircle className="w-4 h-4 animate-spin" strokeWidth={2} />
            A obter localização…
          </>
        ) : jaDefinida ? (
          <>
            <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
            Localização definida — tocar para atualizar
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4" strokeWidth={2} />
            Usar a minha localização atual
          </>
        )}
      </button>
      {erro && <p className="text-[11px] text-red-600 mt-1.5">{erro}</p>}
      <p className="text-[10.5px] text-ink/40 mt-1.5 leading-relaxed">{descricao}</p>
    </div>
  );
}

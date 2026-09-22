import { useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface ImageUploaderProps {
  bucket: "avatares" | "portfolio";
  folder: string; // normalmente o id do utilizador ou do prestador
  onUploaded: (publicUrl: string, path: string) => void;
  currentUrl?: string | null;
  shape?: "circle" | "square";
  compact?: boolean; // usado em grelhas (ex: portfólio) — vira um azulejo quadrado pequeno
}

export default function ImageUploader({
  bucket,
  folder,
  onUploaded,
  currentUrl,
  shape = "square",
  compact = false,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErro("Imagem demasiado grande (máx. 5MB).");
      return;
    }

    setErro("");
    setEnviando(true);
    const previewLocal = URL.createObjectURL(file);
    setPreview(previewLocal);

    try {
      const ext = file.name.split(".").pop();
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const path = `${folder}/${id}.${ext}`;

      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) throw error;

      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
      onUploaded(publicData.publicUrl, path);
      if (compact) setPreview(null); // volta a ficar um "+" para adicionar a próxima foto
    } catch (err: any) {
      setErro(
        "Falha ao enviar imagem: " +
          (err?.message ?? "erro desconhecido. Verifica se os buckets do Storage foram criados.")
      );
      setPreview(compact ? null : currentUrl ?? null);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`relative overflow-hidden border-2 border-dashed border-ink/20 bg-paper flex items-center justify-center text-ink/40 text-xs ${
          compact
            ? "aspect-square w-full rounded-lg text-[10px]"
            : shape === "circle"
            ? "w-20 h-20 rounded-full"
            : "w-full h-28 rounded-xl"
        }`}
      >
        {preview ? (
          <img src={preview} alt="Pré-visualização" className="w-full h-full object-cover" />
        ) : enviando ? (
          "A enviar…"
        ) : (
          "+ Adicionar foto"
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      {erro && <p className="text-[11px] text-red-600 mt-1.5">{erro}</p>}
    </div>
  );
}

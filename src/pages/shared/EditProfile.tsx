import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { Button, ErrorText, Input, Textarea, TopBar } from "../../components/UI";
import ImageUploader from "../../components/ImageUploader";

export default function EditProfile() {
  const { perfil, cliente, prestador, session, refetchPerfil } = useAuth();
  const navigate = useNavigate();
  const usuario = perfil === "cliente" ? cliente : prestador;

  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [telefone, setTelefone] = useState(usuario?.telefone ?? "");
  const [cidade, setCidade] = useState(usuario?.cidade ?? "");
  const [bairro, setBairro] = useState(usuario?.bairro ?? "");
  const [bio, setBio] = useState(prestador?.bio ?? "");
  const [fotoUrl, setFotoUrl] = useState<string | null>(usuario?.foto_perfil_url ?? null);
  const [disponivel, setDisponivel] = useState(prestador?.disponivel ?? true);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!session?.user) return;
    setSalvando(true);
    setErro("");

    const tabela = perfil === "cliente" ? "clientes" : "prestadores";
    const idColuna = perfil === "cliente" ? "id_cliente" : "id_prestador";

    const payload: Record<string, unknown> = {
      nome,
      telefone,
      cidade,
      bairro,
      foto_perfil_url: fotoUrl,
    };
    if (perfil === "prestador") {
      payload.bio = bio;
      payload.disponivel = disponivel;
    }

    // .select().single() confirma que a linha foi mesmo alterada —
    // sem isto, um update bloqueado (RLS ou outro motivo) não dá
    // erro nenhum, só devolve 0 linhas em silêncio, e o formulário
    // parece "guardar" sem nada mudar de verdade.
    const { data: linhaAtualizada, error } = await supabase
      .from(tabela)
      .update(payload)
      .eq(idColuna, session.user.id)
      .select()
      .single();

    setSalvando(false);
    if (error || !linhaAtualizada) {
      setErro(
        error?.message ??
          "A atualização não foi aplicada (0 linhas alteradas). Verifica as políticas de RLS."
      );
      return;
    }
    await refetchPerfil();
    navigate("/perfil");
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-paper max-w-sm mx-auto flex flex-col">
      <TopBar title="Editar perfil" onBack={() => navigate(-1)} />
      <form onSubmit={handleSubmit} className="p-4 flex-1">
        <div className="flex justify-center mb-5">
          <ImageUploader
            bucket="avatares"
            folder={session.user.id}
            shape="circle"
            currentUrl={fotoUrl}
            onUploaded={(url) => setFotoUrl(url)}
          />
        </div>

        <Input label="Nome completo" required value={nome} onChange={(e) => setNome(e.target.value)} />
        <Input label="Telefone" required value={telefone} onChange={(e) => setTelefone(e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
          <Input label="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
        </div>

        {perfil === "prestador" && (
          <>
            <Textarea
              label="Sobre você / experiência"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Fale sobre a sua experiência e especialidade…"
            />
            <label className="flex items-center gap-2.5 mb-4 text-xs font-medium">
              <input
                type="checkbox"
                checked={disponivel}
                onChange={(e) => setDisponivel(e.target.checked)}
                className="w-4 h-4 accent-rust"
              />
              Disponível para novos pedidos
            </label>
          </>
        )}

        <ErrorText>{erro}</ErrorText>
        <Button type="submit" className="w-full" disabled={salvando}>
          {salvando ? "A guardar…" : "Guardar alterações"}
        </Button>
      </form>
    </div>
  );
}

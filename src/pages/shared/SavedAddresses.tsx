import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Trash2, Plus } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { Button, Card, ErrorText, Input, TopBar } from "../../components/UI";
import type { Endereco } from "../../types/database.types";

export default function SavedAddresses() {
  const { session, perfil } = useAuth();
  const navigate = useNavigate();
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aBater, setABater] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const [nomeEndereco, setNomeEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [referencia, setReferencia] = useState("");

  useEffect(() => {
    carregar();
  }, [session]);

  async function carregar() {
    if (!session?.user) return;
    setCarregando(true);
    const { data, error } = await supabase
      .from("enderecos")
      .select("*")
      .eq("id_usuario", session.user.id)
      .order("data_criacao", { ascending: false });
    if (error) setErro(error.message);
    setEnderecos(data ?? []);
    setCarregando(false);
  }

  async function adicionar(e: FormEvent) {
    e.preventDefault();
    if (!session?.user || !perfil) return;
    setErro("");
    setEnviando(true);

    const { data, error } = await supabase
      .from("enderecos")
      .insert({
        id_usuario: session.user.id,
        tipo_usuario: perfil,
        nome_endereco: nomeEndereco,
        cidade,
        bairro,
        referencia: referencia || null,
      })
      .select()
      .single();

    setEnviando(false);
    if (error || !data) {
      setErro(error?.message ?? "Não foi possível guardar o endereço.");
      return;
    }

    setEnderecos((prev) => [data, ...prev]);
    setNomeEndereco("");
    setCidade("");
    setBairro("");
    setReferencia("");
    setABater(false);
  }

  async function remover(id: string) {
    const { error } = await supabase.from("enderecos").delete().eq("id_endereco", id);
    if (error) {
      setErro(error.message);
      return;
    }
    setEnderecos((prev) => prev.filter((e) => e.id_endereco !== id));
  }

  return (
    <div className="min-h-screen bg-paper max-w-sm mx-auto flex flex-col">
      <TopBar title="Endereços salvos" onBack={() => navigate(-1)} />
      <div className="p-4 flex-1">
        <ErrorText>{erro}</ErrorText>

        {carregando && <p className="text-xs text-ink/50">A carregar…</p>}

        {!carregando && enderecos.length === 0 && !aBater && (
          <Card className="p-6 text-center mb-4">
            <MapPin className="w-6 h-6 text-ink/30 mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-xs text-ink/50">Ainda não tens endereços guardados.</p>
          </Card>
        )}

        <div className="flex flex-col gap-2 mb-4">
          {enderecos.map((end) => (
            <Card key={end.id_endereco} className="p-3.5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-paper flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-ink/60" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold">{end.nome_endereco}</p>
                <p className="text-[11.5px] text-ink/60 mt-0.5">
                  {end.bairro}, {end.cidade}
                </p>
                {end.referencia && (
                  <p className="text-[11px] text-ink/40 mt-0.5">{end.referencia}</p>
                )}
              </div>
              <button
                onClick={() => remover(end.id_endereco)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-ink/30 hover:text-red-600 hover:bg-red-500/8 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </Card>
          ))}
        </div>

        {aBater ? (
          <Card className="p-4">
            <form onSubmit={adicionar}>
              <Input
                label="Nome do endereço"
                required
                placeholder="Ex: Casa, Trabalho"
                value={nomeEndereco}
                onChange={(e) => setNomeEndereco(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Cidade" required value={cidade} onChange={(e) => setCidade(e.target.value)} />
                <Input label="Bairro" required value={bairro} onChange={(e) => setBairro(e.target.value)} />
              </div>
              <Input
                label="Referência (opcional)"
                placeholder="Ex: perto do mercado central"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
              />
              <div className="flex gap-2.5">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setABater(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={enviando}>
                  {enviando ? "A guardar…" : "Guardar"}
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Button variant="outline" className="w-full flex items-center justify-center gap-1.5" onClick={() => setABater(true)}>
            <Plus className="w-4 h-4" strokeWidth={2} />
            Adicionar endereço
          </Button>
        )}
      </div>
    </div>
  );
}

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import type { Cliente, Prestador } from "../types/database.types";

export type Perfil = "cliente" | "prestador" | null;

interface AuthContextValue {
  session: Session | null;
  perfil: Perfil;
  cliente: Cliente | null;
  prestador: Prestador | null;
  loading: boolean; // sessão ainda a ser lida (só acontece uma vez, ao abrir a app)
  perfilLoading: boolean; // perfil (cliente/prestador) ainda a ser lido da base de dados
  refetchPerfil: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [prestador, setPrestador] = useState<Prestador | null>(null);
  const [loading, setLoading] = useState(true);
  const [perfilLoading, setPerfilLoading] = useState(false);

  async function carregarPerfil(userId: string) {
    setPerfilLoading(true);
    const { data: c } = await supabase
      .from("clientes")
      .select("*")
      .eq("id_cliente", userId)
      .maybeSingle();
    if (c) {
      setCliente(c);
      setPrestador(null);
      setPerfil("cliente");
      setPerfilLoading(false);
      return;
    }
    const { data: p } = await supabase
      .from("prestadores")
      .select("*")
      .eq("id_prestador", userId)
      .maybeSingle();
    if (p) {
      setPrestador(p);
      setCliente(null);
      setPerfil("prestador");
      setPerfilLoading(false);
      return;
    }
    setPerfil(null);
    setPerfilLoading(false);
  }

  async function refetchPerfil() {
    if (session?.user) await carregarPerfil(session.user.id);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) carregarPerfil(data.session.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        carregarPerfil(newSession.user.id);
      } else {
        setCliente(null);
        setPrestador(null);
        setPerfil(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{ session, perfil, cliente, prestador, loading, perfilLoading, refetchPerfil, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}

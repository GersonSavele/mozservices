import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
  somente,
}: {
  children: ReactNode;
  somente?: "cliente" | "prestador";
}) {
  const { session, perfil, loading, perfilLoading } = useAuth();

  if (loading || (session && perfilLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-ink/50">
        A carregar…
      </div>
    );
  }
  if (!session) return <Navigate to="/entrar" replace />;

  // sessão existe mas não há linha em clientes/prestadores ainda —
  // acontece logo após o primeiro login social (Google/Facebook)
  if (perfil === null) return <Navigate to="/completar-perfil" replace />;

  if (somente && perfil !== somente) {
    // manda para a área correspondente ao perfil real, nunca para um
    // destino fixo — evita loops quando um prestador cai numa rota
    // de cliente (ou vice-versa)
    const destino = perfil === "prestador" ? "/painel" : "/inicio";
    return <Navigate to={destino} replace />;
  }

  return <>{children}</>;
}

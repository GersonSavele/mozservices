import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function BottomNav() {
  const { perfil } = useAuth();

  const clienteLinks = [
    { to: "/inicio", label: "Buscar", icon: "🔍" },
    { to: "/minhas-solicitacoes", label: "Pedidos", icon: "📋" },
    { to: "/perfil", label: "Perfil", icon: "👤" },
  ];
  const prestadorLinks = [
    { to: "/painel", label: "Painel", icon: "📊" },
    { to: "/notificacoes", label: "Pedidos", icon: "🔔" },
    { to: "/perfil", label: "Perfil", icon: "👤" },
  ];

  const links = perfil === "prestador" ? prestadorLinks : clienteLinks;

  return (
    <nav className="sticky bottom-0 bg-white border-t border-ink/10 flex justify-around py-2.5 pb-[calc(env(safe-area-inset-bottom,0px)+8px)]">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[11px] px-3 ${
              isActive ? "text-rust font-semibold" : "text-ink/50"
            }`
          }
        >
          <span className="text-lg leading-none">{l.icon}</span>
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
}

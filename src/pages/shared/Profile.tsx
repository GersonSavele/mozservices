import { useNavigate } from "react-router-dom";
import { User, MapPin, ShieldCheck, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Card, Screen } from "../../components/UI";
import BottomNav from "../../components/BottomNav";

export default function Profile() {
  const { cliente, prestador, perfil, signOut } = useAuth();
  const navigate = useNavigate();
  const usuario = perfil === "cliente" ? cliente : prestador;

  const items: { icon: typeof User; label: string; to: string }[] = [
    { icon: User, label: "Editar perfil", to: "/perfil/editar" },
    { icon: MapPin, label: "Endereços salvos", to: "/perfil/enderecos" },
    { icon: ShieldCheck, label: "Privacidade e segurança", to: "/perfil/privacidade" },
    { icon: HelpCircle, label: "Ajuda e suporte", to: "/perfil/ajuda" },
  ];

  return (
    <Screen>
      <div className="bg-steel text-paper px-5 pt-6 pb-8">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center font-display font-bold text-base overflow-hidden">
            {usuario?.foto_perfil_url ? (
              <img src={usuario.foto_perfil_url} alt={usuario.nome} className="w-full h-full object-cover" />
            ) : (
              usuario?.nome?.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <p className="font-display font-semibold text-[15px]">{usuario?.nome}</p>
            <p className="text-[11px] opacity-70 mt-0.5">{usuario?.email}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 -mt-4 relative z-[1] pb-4">
        <Card className="overflow-hidden divide-y divide-ink/8">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className="flex justify-between items-center py-3.5 px-4 text-sm w-full text-left hover:bg-ink/[0.02]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-paper flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-ink/70" strokeWidth={1.75} />
                </div>
                {item.label}
              </div>
              <ChevronRight className="w-4 h-4 text-ink/25" />
            </button>
          ))}
        </Card>

        <Card className="mt-3 overflow-hidden">
          <button
            onClick={signOut}
            className="flex items-center gap-3 py-3.5 px-4 text-sm text-red-600 w-full text-left hover:bg-red-500/[0.04]"
          >
            <div className="w-8 h-8 rounded-lg bg-red-500/8 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-4 h-4" strokeWidth={1.75} />
            </div>
            Terminar sessão
          </button>
        </Card>
      </div>
      <BottomNav />
    </Screen>
  );
}

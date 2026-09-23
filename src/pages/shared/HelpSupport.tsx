import { useNavigate } from "react-router-dom";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { Card, TopBar } from "../../components/UI";

export default function HelpSupport() {
  const navigate = useNavigate();
  const telefone = "+258846495241";
  const telefoneExibicao = "84 649 5241";
  const email = "gersonsavele005@gmail.com";

  return (
    <div className="min-h-screen bg-paper max-w-sm mx-auto flex flex-col">
      <TopBar title="Ajuda e suporte" onBack={() => navigate(-1)} />
      <div className="p-4">
        <p className="text-[12px] text-ink/50 leading-relaxed mb-4 px-1">
          Esta é uma versão piloto do MozServices. Encontraste um problema, tens uma sugestão ou
          precisas de ajuda com a tua conta? Fala diretamente comigo por qualquer um destes meios.
        </p>

        <div className="flex flex-col gap-2.5">
          <a href={`mailto:${email}`}>
            <Card className="p-4 flex items-center gap-3 hover:border-ink/20">
              <div className="w-10 h-10 rounded-lg bg-rust/10 text-rust flex items-center justify-center flex-shrink-0">
                <Mail className="w-4.5 h-4.5" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[13px] font-semibold">Email</p>
                <p className="text-[12px] text-ink/60">{email}</p>
              </div>
            </Card>
          </a>

          <a href={`tel:${telefone}`}>
            <Card className="p-4 flex items-center gap-3 hover:border-ink/20">
              <div className="w-10 h-10 rounded-lg bg-steel/10 text-steel flex items-center justify-center flex-shrink-0">
                <Phone className="w-4.5 h-4.5" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[13px] font-semibold">Telefone</p>
                <p className="text-[12px] text-ink/60">{telefoneExibicao}</p>
              </div>
            </Card>
          </a>

          <a href={`https://wa.me/${telefone.replace("+", "")}`} target="_blank" rel="noopener noreferrer">
            <Card className="p-4 flex items-center gap-3 hover:border-ink/20">
              <div className="w-10 h-10 rounded-lg bg-green/10 text-green flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4.5 h-4.5" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[13px] font-semibold">WhatsApp</p>
                <p className="text-[12px] text-ink/60">{telefoneExibicao}</p>
              </div>
            </Card>
          </a>
        </div>
      </div>
    </div>
  );
}

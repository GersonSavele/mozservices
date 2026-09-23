import { useNavigate } from "react-router-dom";
import { Lock, Database, Eye, ShieldCheck, Trash2 } from "lucide-react";
import { Card, TopBar } from "../../components/UI";

const SECOES = [
  {
    icon: Lock,
    titulo: "Como protegemos a tua conta",
    texto:
      "A tua palavra-passe nunca é guardada em texto simples — é encriptada pelo sistema de autenticação (Supabase Auth). Se entraste com Google ou Facebook, nós nunca vemos nem guardamos a tua palavra-passe dessas contas.",
  },
  {
    icon: Database,
    titulo: "Que dados guardamos",
    texto:
      "Nome, telefone, email, cidade/bairro e, se fores prestador, os serviços que ofereces e as fotos do teu portfólio. Guardamos também o histórico de solicitações e avaliações para o funcionamento da app.",
  },
  {
    icon: Eye,
    titulo: "Quem vê os teus dados",
    texto:
      "O teu nome, foto e avaliações de prestador são públicos (aparecem na busca). O teu telefone só é partilhado com a outra pessoa depois de um pedido ser aceite — nunca antes disso.",
  },
  {
    icon: ShieldCheck,
    titulo: "Segurança na base de dados",
    texto:
      "Usamos Row Level Security (RLS): cada pessoa só consegue aceder aos seus próprios dados e aos dados públicos de prestadores. Isto é aplicado ao nível da base de dados, não só na aparência da app.",
  },
  {
    icon: Trash2,
    titulo: "Apagar a tua conta ou dados",
    texto:
      "Esta é uma versão piloto e ainda não tem um botão de autoatendimento para apagar a conta. Se quiseres remover os teus dados, contacta-nos em Ajuda e Suporte e tratamos disso manualmente.",
  },
];

export default function PrivacySecurity() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-paper max-w-sm mx-auto flex flex-col">
      <TopBar title="Privacidade e segurança" onBack={() => navigate(-1)} />
      <div className="p-4 flex flex-col gap-2.5">
        <p className="text-[12px] text-ink/50 leading-relaxed mb-1 px-1">
          O MozServices está em fase piloto. Este resumo explica, de forma simples, como tratamos os
          teus dados.
        </p>
        {SECOES.map((s) => (
          <Card key={s.titulo} className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-paper flex items-center justify-center flex-shrink-0">
                <s.icon className="w-4 h-4 text-ink/60" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[13px] font-semibold mb-1">{s.titulo}</p>
                <p className="text-[12px] text-ink/60 leading-relaxed">{s.texto}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

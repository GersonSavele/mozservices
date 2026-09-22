import { useNavigate } from "react-router-dom";
import { Button } from "../../components/UI";

export default function RequestSent() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-8 max-w-sm mx-auto">
      <div className="w-16 h-16 rounded-full bg-green text-white flex items-center justify-center text-2xl mb-5">
        ✓
      </div>
      <h1 className="font-display text-xl font-semibold mb-2">Pedido enviado!</h1>
      <p className="text-xs text-ink/60 leading-relaxed mb-7">
        O prestador vai receber a sua solicitação e responder em breve pela aplicação ou WhatsApp.
      </p>
      <Button variant="outline" className="w-full mb-2.5" onClick={() => navigate("/minhas-solicitacoes")}>
        Ver minhas solicitações
      </Button>
      <Button className="w-full bg-ink" onClick={() => navigate("/inicio")}>
        Voltar ao início
      </Button>
    </div>
  );
}

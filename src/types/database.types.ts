export type StatusSolicitacao =
  | "pendente"
  | "aceite"
  | "recusada"
  | "concluida"
  | "cancelada";

export type TipoNotificacao =
  | "nova_solicitacao"
  | "solicitacao_aceite"
  | "solicitacao_recusada"
  | "agendamento_alterado"
  | "servico_concluido"
  | "nova_avaliacao"
  | "lembrete";

export interface Cliente {
  id_cliente: string;
  nome: string;
  email: string;
  telefone: string;
  foto_perfil_url: string | null;
  cidade: string | null;
  bairro: string | null;
  latitude: number | null;
  longitude: number | null;
  push_token: string | null;
  data_registo: string;
}

export interface Prestador {
  id_prestador: string;
  nome: string;
  email: string;
  telefone: string;
  foto_perfil_url: string | null;
  bio: string | null;
  cidade: string | null;
  bairro: string | null;
  latitude: number | null;
  longitude: number | null;
  verificado: boolean;
  media_avaliacao: number;
  total_avaliacoes: number;
  disponivel: boolean;
  push_token: string | null;
  data_registo: string;
}

export interface Categoria {
  id_categoria: string;
  nome_categoria: string;
  icone: string | null;
}

export interface Servico {
  id_servico: string;
  id_prestador: string;
  id_categoria: string;
  titulo: string;
  descricao: string | null;
  preco_estimado: number | null;
  ativo: boolean;
  data_criacao: string;
}

export interface ImagemServico {
  id_imagem: string;
  id_servico: string;
  url_imagem: string;
  legenda: string | null;
  ordem: number;
  data_upload: string;
}

export interface Solicitacao {
  id_solicitacao: string;
  id_cliente: string;
  id_servico: string;
  id_prestador: string;
  mensagem_cliente: string | null;
  status: StatusSolicitacao;
  data_solicitacao: string;
  data_atualizacao: string;
}

export interface Agendamento {
  id_agendamento: string;
  id_solicitacao: string;
  data_servico: string;
  hora_servico: string;
  observacoes: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface Avaliacao {
  id_avaliacao: string;
  id_solicitacao: string;
  id_cliente: string;
  id_prestador: string;
  nota: number;
  comentario: string | null;
  data_avaliacao: string;
}

export interface Endereco {
  id_endereco: string;
  id_usuario: string;
  tipo_usuario: "cliente" | "prestador";
  nome_endereco: string;
  cidade: string;
  bairro: string;
  referencia: string | null;
  latitude: number | null;
  longitude: number | null;
  data_criacao: string;
}

export interface Notificacao {
  id_notificacao: string;
  id_solicitacao: string | null;
  id_destinatario: string;
  tipo_destinatario: "cliente" | "prestador";
  tipo: TipoNotificacao;
  mensagem: string;
  visualizado: boolean;
  data_envio: string;
}

export interface SolicitacaoDetalhe {
  id_solicitacao: string;
  status: StatusSolicitacao;
  mensagem_cliente: string | null;
  data_solicitacao: string;
  nome_cliente: string;
  telefone_cliente: string;
  nome_prestador: string;
  telefone_prestador: string;
  titulo_servico: string;
  nome_categoria: string;
  data_servico: string | null;
  hora_servico: string | null;
}

// Minimal Supabase Database typing (extend with `supabase gen types typescript` in real use)
export interface Database {
  public: {
    Tables: {
      clientes: { Row: Cliente; Insert: Partial<Cliente>; Update: Partial<Cliente> };
      prestadores: { Row: Prestador; Insert: Partial<Prestador>; Update: Partial<Prestador> };
      categorias: { Row: Categoria; Insert: Partial<Categoria>; Update: Partial<Categoria> };
      servicos: { Row: Servico; Insert: Partial<Servico>; Update: Partial<Servico> };
      imagens_servico: {
        Row: ImagemServico;
        Insert: Partial<ImagemServico>;
        Update: Partial<ImagemServico>;
      };
      solicitacoes: {
        Row: Solicitacao;
        Insert: Partial<Solicitacao>;
        Update: Partial<Solicitacao>;
      };
      agendamentos: {
        Row: Agendamento;
        Insert: Partial<Agendamento>;
        Update: Partial<Agendamento>;
      };
      avaliacoes: { Row: Avaliacao; Insert: Partial<Avaliacao>; Update: Partial<Avaliacao> };
      notificacoes: {
        Row: Notificacao;
        Insert: Partial<Notificacao>;
        Update: Partial<Notificacao>;
      };
    };
    Views: {
      vw_solicitacoes_detalhe: { Row: SolicitacaoDetalhe };
    };
  };
}
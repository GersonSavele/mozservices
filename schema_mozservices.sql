-- ============================================================
-- MozServices — Schema completo Supabase (PostgreSQL)
-- Baseado nos ER diagrams originais + campos adicionados para
-- o sistema ficar funcional: status de solicitação, agendamento,
-- avaliações, localização, verificação e notificações push.
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------
create type status_solicitacao as enum (
  'pendente',    -- cliente enviou, prestador ainda não respondeu
  'aceite',      -- prestador aceitou, aguarda execução
  'recusada',    -- prestador recusou
  'concluida',   -- serviço realizado
  'cancelada'    -- cancelada por qualquer uma das partes
);

create type tipo_notificacao as enum (
  'nova_solicitacao',
  'solicitacao_aceite',
  'solicitacao_recusada',
  'agendamento_alterado',
  'servico_concluido',
  'nova_avaliacao',
  'lembrete'
);

-- ------------------------------------------------------------
-- PRESTADORES
-- id_prestador referencia auth.users.id (Supabase Auth)
-- ------------------------------------------------------------
create table prestadores (
  id_prestador uuid primary key references auth.users(id) on delete cascade,
  nome varchar(100) not null,
  email varchar(100) unique not null,
  telefone varchar(20) not null,
  foto_perfil_url varchar(255),
  bio text,
  cidade varchar(100),
  bairro varchar(100),
  latitude double precision,
  longitude double precision,
  verificado boolean default false,          -- selo de confiança (doc validado)
  media_avaliacao numeric(2,1) default 0,    -- cache calculada por trigger
  total_avaliacoes int default 0,
  disponivel boolean default true,           -- aceita novos pedidos?
  push_token varchar(255),                   -- token para notificações push
  data_registo timestamptz default now()
);

-- ------------------------------------------------------------
-- CLIENTES
-- id_cliente referencia auth.users.id
-- ------------------------------------------------------------
create table clientes (
  id_cliente uuid primary key references auth.users(id) on delete cascade,
  nome varchar(100) not null,
  email varchar(100) unique not null,
  telefone varchar(20) not null,
  foto_perfil_url varchar(255),
  cidade varchar(100),
  bairro varchar(100),
  latitude double precision,
  longitude double precision,
  push_token varchar(255),
  data_registo timestamptz default now()
);

-- ------------------------------------------------------------
-- CATEGORIAS
-- ------------------------------------------------------------
create table categorias (
  id_categoria uuid primary key default uuid_generate_v4(),
  nome_categoria varchar(100) not null unique,
  icone varchar(50)             -- nome/emoji do ícone para a UI
);

insert into categorias (nome_categoria, icone) values
  ('Carpintaria', '🪚'),
  ('Serralharia', '🔧'),
  ('Canalização', '🚰'),
  ('Electricidade', '💡'),
  ('Pintura', '🎨'),
  ('Alvenaria', '🧱'),
  ('Jardinagem', '🌿'),
  ('Limpeza', '🧹');

-- ------------------------------------------------------------
-- SERVICOS (o que cada prestador oferece)
-- ------------------------------------------------------------
create table servicos (
  id_servico uuid primary key default uuid_generate_v4(),
  id_prestador uuid not null references prestadores(id_prestador) on delete cascade,
  id_categoria uuid not null references categorias(id_categoria),
  titulo varchar(100) not null,
  descricao text,
  preco_estimado numeric(10,2),     -- opcional, em MZN
  ativo boolean default true,
  data_criacao timestamptz default now()
);

create index idx_servicos_categoria on servicos(id_categoria);
create index idx_servicos_prestador on servicos(id_prestador);

-- ------------------------------------------------------------
-- IMAGENS DO SERVIÇO (portfólio)
-- ------------------------------------------------------------
create table imagens_servico (
  id_imagem uuid primary key default uuid_generate_v4(),
  id_servico uuid not null references servicos(id_servico) on delete cascade,
  url_imagem varchar(255) not null,
  legenda varchar(255),
  ordem int default 0,
  data_upload timestamptz default now()
);

-- ------------------------------------------------------------
-- SOLICITACOES (pedido do cliente ao prestador)
-- ------------------------------------------------------------
create table solicitacoes (
  id_solicitacao uuid primary key default uuid_generate_v4(),
  id_cliente uuid not null references clientes(id_cliente) on delete cascade,
  id_servico uuid not null references servicos(id_servico) on delete cascade,
  id_prestador uuid not null references prestadores(id_prestador) on delete cascade,
  mensagem_cliente text,
  status status_solicitacao not null default 'pendente',
  data_solicitacao timestamptz default now(),
  data_atualizacao timestamptz default now()
);

create index idx_solicitacoes_cliente on solicitacoes(id_cliente);
create index idx_solicitacoes_prestador on solicitacoes(id_prestador);
create index idx_solicitacoes_status on solicitacoes(status);

-- ------------------------------------------------------------
-- AGENDAMENTOS (RF04 — data/hora do serviço, editável)
-- separado de solicitacoes para permitir histórico de alterações
-- ------------------------------------------------------------
create table agendamentos (
  id_agendamento uuid primary key default uuid_generate_v4(),
  id_solicitacao uuid not null references solicitacoes(id_solicitacao) on delete cascade,
  data_servico date not null,
  hora_servico time not null,
  observacoes text,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

create unique index idx_agendamento_unico on agendamentos(id_solicitacao);

-- ------------------------------------------------------------
-- AVALIACOES (RF04 — feedback pós-serviço)
-- ------------------------------------------------------------
create table avaliacoes (
  id_avaliacao uuid primary key default uuid_generate_v4(),
  id_solicitacao uuid not null references solicitacoes(id_solicitacao) on delete cascade,
  id_cliente uuid not null references clientes(id_cliente) on delete cascade,
  id_prestador uuid not null references prestadores(id_prestador) on delete cascade,
  nota int not null check (nota between 1 and 5),
  comentario text,
  data_avaliacao timestamptz default now(),
  unique (id_solicitacao)   -- 1 avaliação por solicitação concluída
);

create index idx_avaliacoes_prestador on avaliacoes(id_prestador);

-- ------------------------------------------------------------
-- NOTIFICACOES
-- ------------------------------------------------------------
create table notificacoes (
  id_notificacao uuid primary key default uuid_generate_v4(),
  id_solicitacao uuid references solicitacoes(id_solicitacao) on delete cascade,
  id_destinatario uuid not null,        -- id_cliente OU id_prestador (ver tipo abaixo)
  tipo_destinatario varchar(10) not null check (tipo_destinatario in ('cliente','prestador')),
  tipo tipo_notificacao not null,
  mensagem text not null,
  visualizado boolean default false,
  data_envio timestamptz default now()
);

create index idx_notif_destinatario on notificacoes(id_destinatario, visualizado);

-- ============================================================
-- TRIGGERS / FUNÇÕES — mantêm o sistema consistente sozinho
-- ============================================================

-- 1) Recalcula média de avaliação do prestador sempre que uma
--    avaliação é inserida
create or replace function atualizar_media_avaliacao()
returns trigger as $$
begin
  update prestadores
  set media_avaliacao = (
        select round(avg(nota)::numeric, 1) from avaliacoes where id_prestador = new.id_prestador
      ),
      total_avaliacoes = (
        select count(*) from avaliacoes where id_prestador = new.id_prestador
      )
  where id_prestador = new.id_prestador;
  return new;
end;
$$ language plpgsql;

create trigger trg_atualizar_media
after insert on avaliacoes
for each row execute function atualizar_media_avaliacao();

-- 2) Cria notificação automática para o prestador quando chega
--    uma nova solicitação
create or replace function notificar_nova_solicitacao()
returns trigger as $$
begin
  insert into notificacoes (id_solicitacao, id_destinatario, tipo_destinatario, tipo, mensagem)
  values (new.id_solicitacao, new.id_prestador, 'prestador', 'nova_solicitacao',
          'Nova solicitação recebida.');
  return new;
end;
$$ language plpgsql;

create trigger trg_notificar_solicitacao
after insert on solicitacoes
for each row execute function notificar_nova_solicitacao();

-- 3) Notifica o cliente quando o status da solicitação muda
create or replace function notificar_mudanca_status()
returns trigger as $$
begin
  if new.status <> old.status then
    insert into notificacoes (id_solicitacao, id_destinatario, tipo_destinatario, tipo, mensagem)
    values (
      new.id_solicitacao,
      new.id_cliente,
      'cliente',
      case new.status
        when 'aceite' then 'solicitacao_aceite'
        when 'recusada' then 'solicitacao_recusada'
        when 'concluida' then 'servico_concluido'
        else 'lembrete'
      end,
      'O estado da sua solicitação mudou para: ' || new.status
    );
    new.data_atualizacao = now();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_notificar_status
before update on solicitacoes
for each row execute function notificar_mudanca_status();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — cada utilizador só vê o que é seu
-- ============================================================

alter table clientes enable row level security;
alter table prestadores enable row level security;
alter table servicos enable row level security;
alter table imagens_servico enable row level security;
alter table solicitacoes enable row level security;
alter table agendamentos enable row level security;
alter table avaliacoes enable row level security;
alter table notificacoes enable row level security;
alter table categorias enable row level security;

-- categorias e servicos/imagens são públicos para leitura (busca)
create policy "categorias_publicas" on categorias for select using (true);
create policy "servicos_publicos" on servicos for select using (ativo = true);
create policy "imagens_publicas" on imagens_servico for select using (true);

-- prestador gere os próprios serviços
create policy "prestador_cria_servico" on servicos for insert with check (auth.uid() = id_prestador);
create policy "prestador_edita_servico" on servicos for update using (auth.uid() = id_prestador);
create policy "prestador_apaga_servico" on servicos for delete using (auth.uid() = id_prestador);

-- clientes e prestadores só editam o próprio perfil
create policy "cliente_ve_proprio" on clientes for select using (auth.uid() = id_cliente);
create policy "cliente_edita_proprio" on clientes for update using (auth.uid() = id_cliente);
create policy "cliente_cria_proprio" on clientes for insert with check (auth.uid() = id_cliente);

create policy "prestador_ve_proprio" on prestadores for select using (true); -- perfil público (busca)
create policy "prestador_edita_proprio" on prestadores for update using (auth.uid() = id_prestador);
create policy "prestador_cria_proprio" on prestadores for insert with check (auth.uid() = id_prestador);

-- solicitações: só cliente e prestador envolvidos veem
create policy "ver_propria_solicitacao" on solicitacoes for select
  using (auth.uid() = id_cliente or auth.uid() = id_prestador);
create policy "cliente_cria_solicitacao" on solicitacoes for insert
  with check (auth.uid() = id_cliente);
create policy "prestador_atualiza_solicitacao" on solicitacoes for update
  using (auth.uid() = id_prestador or auth.uid() = id_cliente);

-- agendamentos: visível para quem participa na solicitação
create policy "ver_agendamento" on agendamentos for select
  using (exists (
    select 1 from solicitacoes s
    where s.id_solicitacao = agendamentos.id_solicitacao
    and (auth.uid() = s.id_cliente or auth.uid() = s.id_prestador)
  ));
create policy "editar_agendamento" on agendamentos for all
  using (exists (
    select 1 from solicitacoes s
    where s.id_solicitacao = agendamentos.id_solicitacao
    and (auth.uid() = s.id_cliente or auth.uid() = s.id_prestador)
  ));

-- avaliações: qualquer pessoa pode ler (perfil público), só o
-- cliente da solicitação pode criar
create policy "avaliacoes_publicas" on avaliacoes for select using (true);
create policy "cliente_cria_avaliacao" on avaliacoes for insert
  with check (auth.uid() = id_cliente);

-- notificações: só o destinatário vê e marca como lida
create policy "ver_propria_notificacao" on notificacoes for select
  using (auth.uid() = id_destinatario);
create policy "marcar_lida" on notificacoes for update
  using (auth.uid() = id_destinatario);

-- ============================================================
-- VIEW auxiliar — solicitações com dados já unidos, útil para
-- popular "Minhas solicitações" e "Detalhe" sem múltiplos joins
-- no frontend
-- ============================================================
create view vw_solicitacoes_detalhe as
select
  s.id_solicitacao,
  s.status,
  s.mensagem_cliente,
  s.data_solicitacao,
  c.nome as nome_cliente,
  c.telefone as telefone_cliente,
  p.nome as nome_prestador,
  p.telefone as telefone_prestador,
  sv.titulo as titulo_servico,
  cat.nome_categoria,
  a.data_servico,
  a.hora_servico
from solicitacoes s
join clientes c on c.id_cliente = s.id_cliente
join prestadores p on p.id_prestador = s.id_prestador
join servicos sv on sv.id_servico = s.id_servico
join categorias cat on cat.id_categoria = sv.id_categoria
left join agendamentos a on a.id_solicitacao = s.id_solicitacao;

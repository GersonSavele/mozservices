-- ============================================================
-- MozServices — Correção: triggers não conseguiam inserir em
-- "notificacoes" porque corriam com a permissão do utilizador
-- (sujeitos ao RLS), e não existia política de INSERT para essa
-- tabela. SECURITY DEFINER faz o trigger correr com a permissão
-- de quem criou a função (o "dono"), que ignora o RLS.
-- ============================================================

create or replace function notificar_nova_solicitacao()
returns trigger
security definer
set search_path = public
as $$
begin
  insert into notificacoes (id_solicitacao, id_destinatario, tipo_destinatario, tipo, mensagem)
  values (new.id_solicitacao, new.id_prestador, 'prestador', 'nova_solicitacao',
          'Nova solicitação recebida.');
  return new;
end;
$$ language plpgsql;

create or replace function notificar_mudanca_status()
returns trigger
security definer
set search_path = public
as $$
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

-- mesmo problema no trigger que recalcula a média de avaliação
create or replace function atualizar_media_avaliacao()
returns trigger
security definer
set search_path = public
as $$
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

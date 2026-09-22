-- ============================================================
-- MozServices — Correção: políticas de INSERT/UPDATE/DELETE em
-- "imagens_servico" (idempotente — podes correr isto quantas
-- vezes quiseres, nunca dá erro de "já existe").
-- ============================================================

drop policy if exists "prestador_insere_imagem" on imagens_servico;
create policy "prestador_insere_imagem"
on imagens_servico for insert
with check (
  exists (
    select 1 from servicos s
    where s.id_servico = imagens_servico.id_servico
    and s.id_prestador = auth.uid()
  )
);

drop policy if exists "prestador_apaga_imagem" on imagens_servico;
create policy "prestador_apaga_imagem"
on imagens_servico for delete
using (
  exists (
    select 1 from servicos s
    where s.id_servico = imagens_servico.id_servico
    and s.id_prestador = auth.uid()
  )
);

drop policy if exists "prestador_atualiza_imagem" on imagens_servico;
create policy "prestador_atualiza_imagem"
on imagens_servico for update
using (
  exists (
    select 1 from servicos s
    where s.id_servico = imagens_servico.id_servico
    and s.id_prestador = auth.uid()
  )
);

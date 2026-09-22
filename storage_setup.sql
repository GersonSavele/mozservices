-- ============================================================
-- MozServices — Configuração do Supabase Storage
-- Corre isto depois do schema_mozservices.sql
-- Dois buckets: "avatares" (fotos de perfil) e "portfolio"
-- (imagens de trabalhos dos prestadores, ligadas a imagens_servico)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('avatares', 'avatares', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

-- Leitura pública (as fotos de perfil e portfólio aparecem na busca,
-- sem precisar de login)
create policy "avatares_leitura_publica"
on storage.objects for select
using (bucket_id = 'avatares');

create policy "portfolio_leitura_publica"
on storage.objects for select
using (bucket_id = 'portfolio');

-- Upload: cada utilizador só pode escrever dentro de uma pasta com o
-- seu próprio id (ex: avatares/<uid>/foto.jpg), assim évita que um
-- prestador sobrescreva a foto de outro
create policy "avatares_upload_proprio"
on storage.objects for insert
with check (
  bucket_id = 'avatares'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "avatares_update_proprio"
on storage.objects for update
using (
  bucket_id = 'avatares'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "avatares_delete_proprio"
on storage.objects for delete
using (
  bucket_id = 'avatares'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "portfolio_upload_proprio"
on storage.objects for insert
with check (
  bucket_id = 'portfolio'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "portfolio_delete_proprio"
on storage.objects for delete
using (
  bucket_id = 'portfolio'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Estrutura de pastas esperada pelo frontend:
--   avatares/<id_utilizador>/perfil.jpg
--   portfolio/<id_prestador>/<uuid>.jpg

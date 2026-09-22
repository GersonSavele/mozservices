-- ============================================================
-- MozServices — Expandir categorias + trocar emoji por slugs de
-- ícone SVG (o frontend mapeia cada slug para um ícone Lucide
-- profissional via src/components/CategoryIcon.tsx)
-- ============================================================

-- Atualiza as categorias existentes: de emoji para slug
update categorias set icone = 'hammer'     where nome_categoria = 'Carpintaria';
update categorias set icone = 'wrench'     where nome_categoria = 'Serralharia';
update categorias set icone = 'droplets'   where nome_categoria = 'Canalização';
update categorias set icone = 'zap'        where nome_categoria = 'Electricidade';
update categorias set icone = 'paintbrush' where nome_categoria = 'Pintura';
update categorias set icone = 'building2'  where nome_categoria = 'Alvenaria';
update categorias set icone = 'leaf'       where nome_categoria = 'Jardinagem';
update categorias set icone = 'sparkles'   where nome_categoria = 'Limpeza';

-- Novas categorias (idempotente — nome_categoria é único, por isso
-- podes correr isto de novo sem duplicar)
insert into categorias (nome_categoria, icone) values
  ('Salão de cabeleireiro', 'scissors'),
  ('Manicure e pedicure', 'hand'),
  ('Mecânica auto', 'car'),
  ('Costura e alfaiataria', 'shirt'),
  ('Ar condicionado e refrigeração', 'wind'),
  ('Informática e eletrónica', 'laptop'),
  ('Motorista / TVDE', 'navigation'),
  ('Mudanças e transporte', 'truck'),
  ('Segurança e guarda', 'shield'),
  ('Culinária e catering', 'chefhat')
on conflict (nome_categoria) do update set icone = excluded.icone;

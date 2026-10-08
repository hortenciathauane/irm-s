-- ==============================================================================
-- RESTAURANTE DAS IRMÃS - ESQUEMA DE BANCO DE DADOS & POLÍTICAS DE ARMAZENAMENTO
-- Inclui: Estoque, Recepção de Pedidos e Armazenamento de Imagens
-- ==============================================================================

-- 1. EXTENSÕES NECESSÁRIAS
create extension if not exists "uuid-ossp";

-- 2. TRIGGER REUTILIZÁVEL PARA 'updated_at'
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- ==============================================================================
-- 3. TABELA DE ITENS DO ESTOQUE (PRATOS, BEBIDAS E SOBREMESAS)
-- ==============================================================================
create table if not exists public.itens_estoque (
    id text primary key default ('item_' || gen_random_uuid()::text),
    name text not null,
    category text not null check (category in ('prato', 'bebida', 'sobremesa')),
    quantity integer not null default 0 check (quantity >= 0),
    unit text not null default 'porções',
    price numeric(10, 2) not null default 0.00 check (price >= 0),
    min_stock_alert integer not null default 5 check (min_stock_alert >= 0),
    description text,
    image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_itens_estoque_category on public.itens_estoque(category);
create index if not exists idx_itens_estoque_name on public.itens_estoque(name);

drop trigger if exists trigger_itens_estoque_updated_at on public.itens_estoque;
create trigger trigger_itens_estoque_updated_at
    before update on public.itens_estoque
    for each row
    execute function public.handle_updated_at();

alter table public.itens_estoque enable row level security;

-- Políticas RLS Estoque
drop policy if exists "Permitir leitura dos itens do estoque" on public.itens_estoque;
create policy "Permitir leitura dos itens do estoque"
    on public.itens_estoque for select to public using (true);

drop policy if exists "Permitir inclusão no estoque" on public.itens_estoque;
create policy "Permitir inclusão no estoque"
    on public.itens_estoque for insert to public with check (true);

drop policy if exists "Permitir alteração no estoque" on public.itens_estoque;
create policy "Permitir alteração no estoque"
    on public.itens_estoque for update to public using (true) with check (true);

drop policy if exists "Permitir exclusão no estoque" on public.itens_estoque;
create policy "Permitir exclusão no estoque"
    on public.itens_estoque for delete to public using (true);


-- ==============================================================================
-- 4. TABELAS DE RECEPÇÃO DE PEDIDOS (INTEGRAÇÃO COM O APP DO CLIENTE)
-- ==============================================================================
create table if not exists public.pedidos (
    id text primary key default ('PED-' || floor(random() * 9000 + 1000)::text),
    order_number serial,
    customer_name text not null,
    customer_phone text,
    order_type text not null check (order_type in ('delivery', 'retirada', 'salao')),
    delivery_address text,
    table_number text,
    subtotal numeric(10, 2) not null default 0.00,
    delivery_fee numeric(10, 2) not null default 0.00,
    total numeric(10, 2) not null default 0.00,
    payment_method text not null check (payment_method in ('pix', 'cartao_credito', 'cartao_debito', 'dinheiro')),
    payment_status text not null default 'pago' check (payment_status in ('pago', 'pendente_na_entrega')),
    notes text,
    status text not null default 'pendente' check (status in ('pendente', 'em_preparo', 'saiu_entrega', 'concluido', 'cancelado')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_pedidos_status on public.pedidos(status);
create index if not exists idx_pedidos_created_at on public.pedidos(created_at desc);

drop trigger if exists trigger_pedidos_updated_at on public.pedidos;
create trigger trigger_pedidos_updated_at
    before update on public.pedidos
    for each row
    execute function public.handle_updated_at();

-- Tabela de Itens de cada Pedido
create table if not exists public.itens_pedido (
    id text primary key default ('item_ped_' || gen_random_uuid()::text),
    pedido_id text not null references public.pedidos(id) on delete cascade,
    item_id text,
    item_name text not null,
    category text default 'prato',
    quantity integer not null check (quantity > 0),
    unit_price numeric(10, 2) not null default 0.00,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_itens_pedido_pedido_id on public.itens_pedido(pedido_id);

-- Políticas RLS para Pedidos (Permite que o App do Cliente insira e a Cozinha gerencie)
alter table public.pedidos enable row level security;
alter table public.itens_pedido enable row level security;

-- Políticas de Pedidos
drop policy if exists "Permitir leitura de pedidos" on public.pedidos;
create policy "Permitir leitura de pedidos"
    on public.pedidos for select to public using (true);

drop policy if exists "Permitir criação de novos pedidos" on public.pedidos;
create policy "Permitir criação de novos pedidos"
    on public.pedidos for insert to public with check (true);

drop policy if exists "Permitir atualização de status do pedido" on public.pedidos;
create policy "Permitir atualização de status do pedido"
    on public.pedidos for update to public using (true) with check (true);

drop policy if exists "Permitir cancelamento/exclusão de pedido" on public.pedidos;
create policy "Permitir cancelamento/exclusão de pedido"
    on public.pedidos for delete to public using (true);

-- Políticas de Itens do Pedido
drop policy if exists "Permitir leitura dos itens do pedido" on public.itens_pedido;
create policy "Permitir leitura dos itens do pedido"
    on public.itens_pedido for select to public using (true);

drop policy if exists "Permitir inclusão de itens no pedido" on public.itens_pedido;
create policy "Permitir inclusão de itens no pedido"
    on public.itens_pedido for insert to public with check (true);

drop policy if exists "Permitir exclusão dos itens do pedido" on public.itens_pedido;
create policy "Permitir exclusão dos itens do pedido"
    on public.itens_pedido for delete to public using (true);


-- ==============================================================================
-- 5. BUCKET & POLÍTICAS DE ARMAZENAMENTO DE ARQUIVOS (STORAGE / FOTOS)
-- ==============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'pratos-restaurante',
    'pratos-restaurante',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Políticas Storage
drop policy if exists "Imagens do restaurante são públicas para visualização" on storage.objects;
create policy "Imagens do restaurante são públicas para visualização"
    on storage.objects for select to public using (bucket_id = 'pratos-restaurante');

drop policy if exists "Permitir envio de imagens de pratos" on storage.objects;
create policy "Permitir envio de imagens de pratos"
    on storage.objects for insert to public with check (bucket_id = 'pratos-restaurante');

drop policy if exists "Permitir alteração de imagens de pratos" on storage.objects;
create policy "Permitir alteração de imagens de pratos"
    on storage.objects for update to public using (bucket_id = 'pratos-restaurante') with check (bucket_id = 'pratos-restaurante');

drop policy if exists "Permitir remoção de imagens de pratos" on storage.objects;
create policy "Permitir remoção de imagens de pratos"
    on storage.objects for delete to public using (bucket_id = 'pratos-restaurante');


-- ==============================================================================
-- 6. DADOS INICIAIS DO CARDÁPIO DAS IRMÃS
-- ==============================================================================
insert into public.itens_estoque (id, name, category, quantity, unit, price, min_stock_alert, description)
values
    ('prato-1', 'Moqueca Baiana com Peixe Fresco & Camarão', 'prato', 14, 'porções', 68.00, 5, 'Receita de família com leite de coco artesanal, azeite de dendê e coentro fresco.'),
    ('prato-2', 'Nhoque da Nona com Ragu de Costela Desfiada', 'prato', 18, 'porções', 54.00, 6, 'Massa artesanal de batata que derrete na boca, molho de tomate cozido lentamente.'),
    ('prato-3', 'Frango Caipira com Quiabo & Polenta Cremosa', 'prato', 9, 'porções', 49.00, 4, 'Frango marinado em ervas frescas do nosso canteiro, acompanhado de polenta no tacho.'),
    ('prato-4', 'Escondidinho de Carne Seca com Purê de Mandioca', 'prato', 3, 'porções', 46.00, 5, 'Carne seca artesanal puxada na manteiga de garrafa e gratinada com queijo coalho.'),
    ('prato-5', 'Lasanha Quatro Queijos das Irmãs', 'prato', 0, 'porções', 52.00, 4, 'Massa fresca intercalada com parmesão curado, gorgonzola, provolone e muçarela.'),
    ('bebida-1', 'Suco Natural de Maracujá com Capim-Santo (Jarra 750ml)', 'bebida', 12, 'jarras', 22.00, 5, 'Refrescância pura, colhido na nossa horta e batido na hora do pedido.'),
    ('bebida-2', 'Limonada Suíça com Hortelã Fresca', 'bebida', 20, 'copos', 14.00, 8, 'Feita com limões taiti selecionados, leite condensado e folhas de hortelã.'),
    ('bebida-3', 'Cerveja Artesanal das Irmãs (Pilsen 600ml)', 'bebida', 28, 'garrafas', 26.00, 10, 'Produção local com maltes nobres e notas florais delicadas.'),
    ('bebida-4', 'Água Mineral com Gás (500ml)', 'bebida', 42, 'garrafas', 7.00, 15, 'Água pura da serra, servida bem gelada com fatia de limão.'),
    ('sobremesa-1', 'Pudim de Leite Condensado com Calda Dourada', 'sobremesa', 11, 'fatias', 18.00, 4, 'Textura aveludada sem furinhos, receita secreta da nossa avó.'),
    ('sobremesa-2', 'Torta de Maçã Quentinha com Canela & Especiarias', 'sobremesa', 2, 'fatias', 21.00, 4, 'Massa crocante folhada, recheada com maçãs caramelizadas na canela.')
on conflict (id) do nothing;

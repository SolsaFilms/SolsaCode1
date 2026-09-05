-- SolsaFilms — esquema de administración
-- Ejecutar en Supabase: SQL Editor → New query → Run

create extension if not exists "pgcrypto";

-- ========== USUARIOS DEL SISTEMA ==========
create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null unique,
  password_hash text not null,
  rol text not null default 'empleado' check (rol in ('admin', 'empleado')),
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== CLIENTES ==========
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text unique,
  telefono text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== PELÍCULAS ==========
create table if not exists public.peliculas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  director text,
  genero text,
  anio integer,
  duracion_min integer,
  clasificacion text,
  sinopsis text,
  existencias integer not null default 0 check (existencias >= 0),
  precio numeric(10, 2) not null default 0,
  activa boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== RENTAS ==========
create table if not exists public.rentas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete restrict,
  pelicula_id uuid not null references public.peliculas (id) on delete restrict,
  usuario_id uuid references public.usuarios (id) on delete set null,
  fecha_renta timestamptz not null default now(),
  fecha_devolucion timestamptz,
  estado text not null default 'activa' check (estado in ('activa', 'devuelta', 'atrasada')),
  total numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_usuarios_email on public.usuarios (email);
create index if not exists idx_rentas_cliente on public.rentas (cliente_id);
create index if not exists idx_rentas_pelicula on public.rentas (pelicula_id);
create index if not exists idx_rentas_estado on public.rentas (estado);

-- El backend Node usa la service_role key (omite RLS).
-- Aun así se activa RLS para que la anon key no exponga datos.
alter table public.usuarios enable row level security;
alter table public.clientes enable row level security;
alter table public.peliculas enable row level security;
alter table public.rentas enable row level security;

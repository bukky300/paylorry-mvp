create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  telegram_chat_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.bank_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mono_account_id text not null,
  account_name text not null,
  account_number text not null,
  bank_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reference text not null unique,
  base_amount bigint not null,
  unique_amount bigint not null,
  note text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'expired')),
  expires_at timestamptz not null,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  payment_request_id uuid references public.payment_requests(id) on delete set null,
  mono_transaction_id text not null unique,
  amount bigint not null,
  description text,
  sender_name text,
  transaction_time timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_payment_requests_status on public.payment_requests(status);
create index if not exists idx_payment_requests_reference on public.payment_requests(reference);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
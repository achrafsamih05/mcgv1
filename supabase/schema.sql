-- ============================================================================
--  MCG GLOBAL — Production PostgreSQL Schema (Single Source of Truth)
--  Run this verbatim in the Supabase SQL Editor (or via `supabase db push`).
--
--  This script is MONOLITHIC and IDEMPOTENT: it may be executed any number of
--  times against the same database without raising duplicate-object errors and
--  without mutating data that already conforms.
--
--  Layers:
--    1. Extensions
--    2. Custom enum types          (platform_role, verification_status,
--                                    deal_status, vehicle_type)
--    3. Relational tables          (profiles + 6 domain tables, strict FKs)
--    4. Auth → profile mirroring    (SECURITY DEFINER trigger)
--    5. Deal acceptance RPC         (SECURITY DEFINER, atomic)
--    6. Row Level Security          (per-table, Super Admin authority,
--                                    APPROVED-only public visibility)
--    7. Realtime publication        (postgres_changes for Loop C)
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";


-- ---------------------------------------------------------------------------
-- 2. Custom enum types
--    Each guarded by a catalog check so re-execution is a no-op (Req 1.5).
--    Values and ordering are exact and case-sensitive (Req 1.1–1.4).
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'platform_role') then
    create type public.platform_role as enum (
      'BUYER', 'SUPPLIER', 'DRIVER', 'WAREHOUSE_HOST', 'SUPER_ADMIN'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'verification_status') then
    create type public.verification_status as enum (
      'PENDING', 'APPROVED', 'REJECTED'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'deal_status') then
    create type public.deal_status as enum (
      'OPEN', 'NEGOTIATION', 'CONTRACTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'vehicle_type') then
    create type public.vehicle_type as enum (
      'TRUCK', 'VAN', 'CAR', 'MOTORCYCLE'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'rfq_status') then
    create type public.rfq_status as enum (
      'OPEN', 'QUOTED', 'CLOSED'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'quotation_status') then
    create type public.quotation_status as enum (
      'PENDING', 'ACCEPTED', 'REJECTED'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'vehicle_status') then
    create type public.vehicle_status as enum (
      'AVAILABLE', 'ON_TRIP', 'MAINTENANCE'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'dispute_status') then
    create type public.dispute_status as enum (
      'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'
    );
  end if;
end$$;


-- ---------------------------------------------------------------------------
-- 3. Relational tables
-- ---------------------------------------------------------------------------

-- 3.1 profiles — 1:1 extension of auth.users (Req 2)
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  full_name     text,
  company_name  text,
  phone_number  text,
  role          public.platform_role        not null default 'BUYER',
  status        public.verification_status  not null default 'PENDING',
  -- Importer (Buyer) corporate onboarding fields.
  import_license_number text,
  country_source        text,
  created_at    timestamptz                 not null default now()
);
comment on table public.profiles is
  'Platform identity, role and verification status, mirrored 1:1 from auth.users.';

-- Idempotent column backfill for databases provisioned before the Importer
-- onboarding fields existed.
alter table public.profiles add column if not exists import_license_number text;
alter table public.profiles add column if not exists country_source text;
-- Supplier (Manufacturer) onboarding field — primary product categories.
alter table public.profiles add column if not exists supplier_category text;

-- 3.2 products — owned by a SUPPLIER profile (Req 3.1)
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  supplier_id  uuid not null references public.profiles (id) on delete cascade,
  title        text not null,
  description  text,
  price_range  text,
  moq          integer,
  lead_time    text,
  images       text[] not null default '{}',
  created_at   timestamptz not null default now()
);

-- 3.3 warehouses — owned by a WAREHOUSE_HOST profile (Req 3.2)
create table if not exists public.warehouses (
  id                    uuid primary key default gen_random_uuid(),
  host_id               uuid not null references public.profiles (id) on delete cascade,
  title                 text not null,
  city                  text,
  total_area_m2         numeric,
  available_area_m2     numeric,
  price_per_m2_monthly  numeric,
  created_at            timestamptz not null default now()
);

-- 3.3 supplier_products — supplier catalog (Supplier persona)
create table if not exists public.supplier_products (
  id           uuid primary key default gen_random_uuid(),
  supplier_id  uuid not null references public.profiles (id) on delete cascade,
  name         text not null,
  description  text,
  moq          integer,
  price_range  text,
  image_url    text,
  created_at   timestamptz not null default now()
);

-- 3.4 drivers_metadata — id is BOTH PK and FK to a DRIVER profile (Req 3.3)
create table if not exists public.drivers_metadata (
  id                     uuid primary key references public.profiles (id) on delete cascade,
  license_number         text,
  vehicle                public.vehicle_type,
  max_weight_capacity_kg numeric,
  created_at             timestamptz not null default now()
);

-- 3.5 rfqs — created by a BUYER profile (Req 3.4)
create table if not exists public.rfqs (
  id             uuid primary key default gen_random_uuid(),
  buyer_id       uuid not null references public.profiles (id) on delete cascade,
  product_title  text not null,
  category       text,
  specifications text,
  target_budget  text,
  quantity       integer,
  status         public.rfq_status not null default 'OPEN',
  created_at     timestamptz not null default now()
);

-- Idempotent column backfill for pre-existing rfqs tables.
alter table public.rfqs add column if not exists category text;
alter table public.rfqs add column if not exists status public.rfq_status not null default 'OPEN';

-- 3.6 quotations — a SUPPLIER's offer against an RFQ (Req 3.5)
create table if not exists public.quotations (
  id                uuid primary key default gen_random_uuid(),
  rfq_id            uuid not null references public.rfqs (id) on delete cascade,
  supplier_id       uuid not null references public.profiles (id) on delete cascade,
  offered_price     numeric,
  dynamic_lead_time text,
  invoice_url       text,
  created_at        timestamptz not null default now()
);

-- Idempotent column backfill — canonical Supplier-bidding columns. Kept
-- alongside the legacy offered_price/dynamic_lead_time for the deal RPC.
alter table public.quotations add column if not exists unit_price numeric;
alter table public.quotations add column if not exists shipping_lead_time integer;
alter table public.quotations add column if not exists notes text;
alter table public.quotations add column if not exists status public.quotation_status not null default 'PENDING';

-- 3.7 deals — contracted transaction binding buyer/supplier/quote (Req 3.6–3.8)
create table if not exists public.deals (
  id              uuid primary key default gen_random_uuid(),
  buyer_id        uuid not null references public.profiles (id)         on delete cascade,
  supplier_id     uuid not null references public.profiles (id)         on delete cascade,
  quote_id        uuid not null references public.quotations (id)       on delete cascade,
  warehouse_id    uuid     references public.warehouses (id)            on delete set null,
  driver_id       uuid     references public.drivers_metadata (id)      on delete set null,
  gross_valuation numeric,
  status          public.deal_status not null default 'OPEN',
  created_at      timestamptz not null default now(),
  -- One deal per accepted quotation (Req 12.9).
  constraint deals_quote_id_unique unique (quote_id)
);

-- 3.8 vehicles — carrier fleet (Logistics persona)
create table if not exists public.vehicles (
  id                  uuid primary key default gen_random_uuid(),
  carrier_id          uuid not null references public.profiles (id) on delete cascade,
  plate_number        text,
  vehicle_type        text,
  max_weight_capacity numeric,
  current_status      public.vehicle_status not null default 'AVAILABLE',
  created_at          timestamptz not null default now()
);

-- 3.9 shipments — 8-stage supply-chain tracking (Logistics persona)
create table if not exists public.shipments (
  id            uuid primary key default gen_random_uuid(),
  deal_id       uuid references public.deals (id)            on delete set null,
  carrier_id    uuid references public.profiles (id)         on delete set null,
  vehicle_id    uuid references public.vehicles (id)         on delete set null,
  origin        text,
  destination   text,
  current_stage integer not null default 1
                  constraint shipments_stage_range check (current_stage between 1 and 8),
  status_notes  text,
  updated_at    timestamptz not null default now()
);

-- 3.10 notifications — admin/global alerts + broadcast engine feed
create table if not exists public.notifications (
  id            uuid primary key default gen_random_uuid(),
  recipient_id  uuid references public.profiles (id) on delete cascade,
  is_global     boolean not null default false,
  category      text not null default 'system',
  title         text not null,
  body          text,
  is_read       boolean not null default false,
  created_at    timestamptz not null default now()
);

-- 3.11 disputes — tri-party dispute resolution (Trust & Safety)
create table if not exists public.disputes (
  id             uuid primary key default gen_random_uuid(),
  creator_id     uuid references public.profiles (id) on delete set null,
  target_id      uuid references public.profiles (id) on delete set null,
  deal_id        uuid references public.deals (id)    on delete set null,
  subject        text not null,
  description    text,
  amount         numeric,
  status         public.dispute_status not null default 'OPEN',
  admin_verdict  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- 3.12 reviews — 1–5 star feedback on suppliers / drivers / warehouses
create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid references public.profiles (id) on delete set null,
  target_id    uuid references public.profiles (id) on delete set null,
  rating       integer not null
                 constraint reviews_rating_range check (rating between 1 and 5),
  comment      text,
  is_flagged   boolean not null default false,
  created_at   timestamptz not null default now()
);

-- 3.13 system_logs — immutable admin audit trail
create table if not exists public.system_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles (id) on delete set null,
  actor_name  text,
  action      text not null,
  details     jsonb,
  created_at  timestamptz not null default now()
);

-- 3.14 wallets — per-profile balance + escrow ledger
create table if not exists public.wallets (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid unique references public.profiles (id) on delete cascade,
  current_balance numeric(15, 2) not null default 0.00 check (current_balance >= 0),
  pending_escrow  numeric(15, 2) not null default 0.00 check (pending_escrow >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 3.15 cms_content — editable public landing copy (keyed by slug)
create table if not exists public.cms_content (
  id          text primary key,
  content     text not null,
  updated_by  uuid references public.profiles (id) on delete set null,
  updated_at  timestamptz not null default now()
);

-- 3.16 moderation_flags — flagged chat messages queue
create table if not exists public.moderation_flags (
  id              uuid primary key default gen_random_uuid(),
  chat_message_id uuid not null,
  sender_id       uuid references public.profiles (id) on delete cascade,
  reporter_id     uuid references public.profiles (id) on delete cascade,
  flag_reason     text not null,
  is_resolved     boolean not null default false,
  created_at      timestamptz not null default now()
);

-- 3.17 platform_settings — global numeric controls (commission %, etc.)
create table if not exists public.platform_settings (
  key         text primary key,
  value       numeric(5, 2) not null,
  updated_at  timestamptz not null default now()
);

-- Seed the default commission structure (idempotent).
insert into public.platform_settings (key, value) values
  ('supplier_commission', 5.00),
  ('transit_commission', 3.00),
  ('warehouse_commission', 2.00)
on conflict (key) do nothing;

-- Helpful indexes for the live feeds and pipeline joins.
create index if not exists idx_products_supplier   on public.products (supplier_id);
create index if not exists idx_supplier_products    on public.supplier_products (supplier_id);
create index if not exists idx_warehouses_host      on public.warehouses (host_id);
create index if not exists idx_rfqs_buyer           on public.rfqs (buyer_id);
create index if not exists idx_quotations_rfq       on public.quotations (rfq_id);
create index if not exists idx_quotations_supplier  on public.quotations (supplier_id);
create index if not exists idx_deals_buyer          on public.deals (buyer_id);
create index if not exists idx_deals_supplier       on public.deals (supplier_id);
create index if not exists idx_vehicles_carrier     on public.vehicles (carrier_id);
create index if not exists idx_shipments_carrier    on public.shipments (carrier_id);
create index if not exists idx_shipments_deal       on public.shipments (deal_id);
create index if not exists idx_notifications_recipient on public.notifications (recipient_id);
create index if not exists idx_notifications_global  on public.notifications (is_global);
create index if not exists idx_disputes_status      on public.disputes (status);
create index if not exists idx_disputes_creator     on public.disputes (creator_id);
create index if not exists idx_reviews_target       on public.reviews (target_id);
create index if not exists idx_system_logs_created  on public.system_logs (created_at);
create index if not exists idx_profiles_status      on public.profiles (status);


-- ---------------------------------------------------------------------------
-- 4. Auth → profile mirroring trigger (Req 4)
--    SECURITY DEFINER + fixed search_path so it can always write to
--    public.profiles regardless of the caller's privileges.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role     text := new.raw_user_meta_data ->> 'role';
  resolved_role public.platform_role;
  resolved_status public.verification_status;
begin
  -- Coerce the supplied role; any invalid/absent value falls back to BUYER.
  begin
    resolved_role := meta_role::public.platform_role;
  exception when others then
    resolved_role := 'BUYER';
  end;

  -- Buyers are auto-approved; commercial accounts await admin review.
  if resolved_role = 'BUYER' then
    resolved_status := 'APPROVED';
  else
    resolved_status := 'PENDING';
  end if;

  insert into public.profiles (id, full_name, company_name, phone_number, role, status)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'company_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone_number', ''),
    resolved_role,
    resolved_status
  )
  on conflict (id) do nothing;  -- Req 4.7: never disturb an existing profile.

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------------
-- 5. Helper: is the current caller a Super Admin?
--    SECURITY DEFINER so the lookup itself is not subject to the profiles RLS
--    policy (avoids infinite policy recursion).
-- ---------------------------------------------------------------------------
create or replace function public.is_super_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role::text in ('SUPER_ADMIN', 'ADMIN')
  );
$$;


-- ---------------------------------------------------------------------------
-- 6. Deal acceptance RPC (Req 12) — atomic accept-quote → create-deal.
--    SECURITY DEFINER so it can read the RFQ/quotation regardless of the
--    caller's row visibility, while still enforcing buyer ownership manually.
-- ---------------------------------------------------------------------------
create or replace function public.accept_deal(p_quote_id uuid)
returns public.deals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quote     public.quotations%rowtype;
  v_buyer_id  uuid;
  v_caller    uuid := auth.uid();
  v_deal      public.deals%rowtype;
  v_price     numeric;
begin
  -- Resolve the quotation.
  select * into v_quote from public.quotations where id = p_quote_id;
  if not found then
    raise exception 'Quotation % not found', p_quote_id using errcode = 'no_data_found';
  end if;

  -- Resolve the owning buyer via the RFQ.
  select buyer_id into v_buyer_id from public.rfqs where id = v_quote.rfq_id;
  if v_buyer_id is null then
    raise exception 'Parent RFQ for quotation % not found', p_quote_id;
  end if;

  -- Req 12.8: only the buyer who owns the RFQ (or a Super Admin) may accept.
  if v_caller <> v_buyer_id and not public.is_super_admin() then
    raise exception 'Not authorized to accept this quotation' using errcode = 'insufficient_privilege';
  end if;

  -- Resolve the effective price (canonical unit_price falls back to legacy
  -- offered_price) so the RPC works for both Supplier-side and Importer-side
  -- quotation shapes.
  v_price := coalesce(v_quote.unit_price, v_quote.offered_price);

  -- Req 12.4: offered price must be a valid monetary amount.
  if v_price is null
     or v_price < 0.01
     or v_price > 999999999.99 then
    raise exception 'Quotation has an invalid offered price' using errcode = 'check_violation';
  end if;

  -- Req 12.9: reject a second deal for the same quotation.
  if exists (select 1 from public.deals where quote_id = p_quote_id) then
    raise exception 'A deal already exists for quotation %', p_quote_id using errcode = 'unique_violation';
  end if;

  -- Req 12.2/12.3/12.5: create the deal atomically. Mark the quotation ACCEPTED.
  insert into public.deals (buyer_id, supplier_id, quote_id, gross_valuation, status)
  values (v_buyer_id, v_quote.supplier_id, p_quote_id, v_price, 'OPEN')
  returning * into v_deal;

  update public.quotations set status = 'ACCEPTED' where id = p_quote_id;
  update public.rfqs set status = 'CLOSED' where id = v_quote.rfq_id;

  return v_deal;
end;
$$;

grant execute on function public.accept_deal(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 6b. Dispute settlement RPC — ACID escrow adjustment on a verdict.
--     SECURITY DEFINER so it can move wallet balances regardless of the
--     caller's row privileges, while restricting invocation to admins.
--     Uses the live supplier_commission rate from platform_settings.
-- ---------------------------------------------------------------------------
create or replace function public.process_dispute_settlement(
  target_dispute_id uuid,
  verdict_status    text,
  explanation       text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deal_id     uuid;
  v_amount      numeric(15, 2);
  v_buyer_id    uuid;
  v_supplier_id uuid;
  v_commission  numeric(15, 2);
  v_payout      numeric(15, 2);
  v_rate        numeric(5, 2);
  v_status      public.dispute_status;
begin
  -- Only admins may settle disputes.
  if not public.is_super_admin() then
    raise exception 'Not authorized to settle disputes' using errcode = 'insufficient_privilege';
  end if;

  select deal_id, creator_id, target_id, amount, status
    into v_deal_id, v_buyer_id, v_supplier_id, v_amount, v_status
  from public.disputes
  where id = target_dispute_id;

  if not found then
    raise exception 'Dispute % not found', target_dispute_id using errcode = 'no_data_found';
  end if;

  -- Guard against double-settlement (only OPEN / UNDER_REVIEW can be ruled).
  if v_status not in ('OPEN', 'UNDER_REVIEW') then
    raise exception 'Dispute is already settled';
  end if;

  -- Resolve the live supplier commission rate (default 5%).
  select value into v_rate from public.platform_settings where key = 'supplier_commission';
  v_rate := coalesce(v_rate, 5.00);

  if verdict_status = 'RESOLVED' then
    -- Rule for the supplier: release escrow minus commission to their wallet.
    v_commission := coalesce(v_amount, 0) * (v_rate / 100.0);
    v_payout := coalesce(v_amount, 0) - v_commission;
    if v_supplier_id is not null then
      update public.wallets
        set pending_escrow = greatest(pending_escrow - coalesce(v_amount, 0), 0),
            current_balance = current_balance + v_payout,
            updated_at = now()
      where profile_id = v_supplier_id;
    end if;
    if v_deal_id is not null then
      update public.deals set status = 'COMPLETED' where id = v_deal_id;
    end if;

  elsif verdict_status = 'DISMISSED' then
    -- Rule for the buyer: refund the full escrow back to their wallet.
    if v_buyer_id is not null then
      update public.wallets
        set pending_escrow = greatest(pending_escrow - coalesce(v_amount, 0), 0),
            current_balance = current_balance + coalesce(v_amount, 0),
            updated_at = now()
      where profile_id = v_buyer_id;
    end if;
    if v_deal_id is not null then
      update public.deals set status = 'CANCELLED' where id = v_deal_id;
    end if;
  else
    raise exception 'Invalid verdict status %', verdict_status using errcode = 'check_violation';
  end if;

  update public.disputes
    set status = case when verdict_status = 'RESOLVED' then 'RESOLVED'::public.dispute_status
                      else 'DISMISSED'::public.dispute_status end,
        admin_verdict = explanation,
        updated_at = now()
  where id = target_dispute_id;
end;
$$;

grant execute on function public.process_dispute_settlement(uuid, text, text) to authenticated;


-- ---------------------------------------------------------------------------
-- 7. Row Level Security (Req 5, 6)
--    Enable on every table, then (re)create policies idempotently.
-- ---------------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.products         enable row level security;
alter table public.supplier_products enable row level security;
alter table public.warehouses       enable row level security;
alter table public.drivers_metadata enable row level security;
alter table public.rfqs             enable row level security;
alter table public.quotations       enable row level security;
alter table public.deals            enable row level security;
alter table public.vehicles         enable row level security;
alter table public.shipments        enable row level security;
alter table public.notifications    enable row level security;
alter table public.disputes         enable row level security;
alter table public.reviews          enable row level security;
alter table public.system_logs      enable row level security;
alter table public.wallets          enable row level security;
alter table public.cms_content      enable row level security;
alter table public.moderation_flags enable row level security;
alter table public.platform_settings enable row level security;

-- 7.1 profiles -------------------------------------------------------------
-- Read: APPROVED rows are public; owners and Super Admins see everything.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select
  using (
    status = 'APPROVED'
    or id = auth.uid()
    or public.is_super_admin()
  );

-- Insert: a user may create only their own profile (trigger covers the rest).
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert
  with check (id = auth.uid() or public.is_super_admin());

-- Update: owners may edit their own row; Super Admins may edit any row
-- (this is what powers the approve/reject funnel).
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update
  using (id = auth.uid() or public.is_super_admin())
  with check (id = auth.uid() or public.is_super_admin());

-- Delete: Super Admin only.
drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles
  for delete
  using (public.is_super_admin());

-- 7.2 products -------------------------------------------------------------
drop policy if exists products_select on public.products;
create policy products_select on public.products
  for select
  using (
    public.is_super_admin()
    or supplier_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = products.supplier_id and p.status = 'APPROVED'
    )
  );

drop policy if exists products_write on public.products;
create policy products_write on public.products
  for all
  using (supplier_id = auth.uid() or public.is_super_admin())
  with check (supplier_id = auth.uid() or public.is_super_admin());

-- 7.2b supplier_products ---------------------------------------------------
-- Catalog rows are publicly readable when the owning supplier is APPROVED;
-- owners and admins always see their own. Owners have full write control.
drop policy if exists supplier_products_select on public.supplier_products;
create policy supplier_products_select on public.supplier_products
  for select
  using (
    public.is_super_admin()
    or supplier_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = supplier_products.supplier_id and p.status = 'APPROVED'
    )
  );

drop policy if exists supplier_products_write on public.supplier_products;
create policy supplier_products_write on public.supplier_products
  for all
  using (supplier_id = auth.uid() or public.is_super_admin())
  with check (supplier_id = auth.uid() or public.is_super_admin());

-- 7.3 warehouses -----------------------------------------------------------
drop policy if exists warehouses_select on public.warehouses;
create policy warehouses_select on public.warehouses
  for select
  using (
    public.is_super_admin()
    or host_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = warehouses.host_id and p.status = 'APPROVED'
    )
  );

drop policy if exists warehouses_write on public.warehouses;
create policy warehouses_write on public.warehouses
  for all
  using (host_id = auth.uid() or public.is_super_admin())
  with check (host_id = auth.uid() or public.is_super_admin());

-- 7.4 drivers_metadata -----------------------------------------------------
drop policy if exists drivers_select on public.drivers_metadata;
create policy drivers_select on public.drivers_metadata
  for select
  using (
    public.is_super_admin()
    or id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = drivers_metadata.id and p.status = 'APPROVED'
    )
  );

drop policy if exists drivers_write on public.drivers_metadata;
create policy drivers_write on public.drivers_metadata
  for all
  using (id = auth.uid() or public.is_super_admin())
  with check (id = auth.uid() or public.is_super_admin());

-- 7.5 rfqs -----------------------------------------------------------------
-- Buyers see their own RFQs; suppliers (approved) and admins see the pipeline.
drop policy if exists rfqs_select on public.rfqs;
create policy rfqs_select on public.rfqs
  for select
  using (
    public.is_super_admin()
    or buyer_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'SUPPLIER' and p.status = 'APPROVED'
    )
  );

drop policy if exists rfqs_insert on public.rfqs;
create policy rfqs_insert on public.rfqs
  for insert
  with check (buyer_id = auth.uid() or public.is_super_admin());

drop policy if exists rfqs_modify on public.rfqs;
create policy rfqs_modify on public.rfqs
  for update
  using (buyer_id = auth.uid() or public.is_super_admin())
  with check (buyer_id = auth.uid() or public.is_super_admin());

drop policy if exists rfqs_delete on public.rfqs;
create policy rfqs_delete on public.rfqs
  for delete
  using (buyer_id = auth.uid() or public.is_super_admin());

-- 7.6 quotations -----------------------------------------------------------
-- Visible to the submitting supplier, the owning buyer, and admins.
drop policy if exists quotations_select on public.quotations;
create policy quotations_select on public.quotations
  for select
  using (
    public.is_super_admin()
    or supplier_id = auth.uid()
    or exists (
      select 1 from public.rfqs r
      where r.id = quotations.rfq_id and r.buyer_id = auth.uid()
    )
  );

drop policy if exists quotations_insert on public.quotations;
create policy quotations_insert on public.quotations
  for insert
  with check (supplier_id = auth.uid() or public.is_super_admin());

drop policy if exists quotations_modify on public.quotations;
create policy quotations_modify on public.quotations
  for update
  using (supplier_id = auth.uid() or public.is_super_admin())
  with check (supplier_id = auth.uid() or public.is_super_admin());

-- 7.7 deals ----------------------------------------------------------------
-- Visible to the buyer, the supplier, and admins.
drop policy if exists deals_select on public.deals;
create policy deals_select on public.deals
  for select
  using (
    public.is_super_admin()
    or buyer_id = auth.uid()
    or supplier_id = auth.uid()
  );

-- Direct writes are reserved for admins; buyers create deals via accept_deal()
-- (SECURITY DEFINER), and status transitions go through controlled updates.
drop policy if exists deals_modify on public.deals;
create policy deals_modify on public.deals
  for update
  using (
    public.is_super_admin()
    or buyer_id = auth.uid()
    or supplier_id = auth.uid()
  )
  with check (
    public.is_super_admin()
    or buyer_id = auth.uid()
    or supplier_id = auth.uid()
  );

drop policy if exists deals_admin_insert on public.deals;
create policy deals_admin_insert on public.deals
  for insert
  with check (public.is_super_admin());

-- 7.8 vehicles -------------------------------------------------------------
-- Carriers manage only their own fleet; approved carriers' vehicles are
-- publicly readable for assignment discovery; admins see all.
drop policy if exists vehicles_select on public.vehicles;
create policy vehicles_select on public.vehicles
  for select
  using (
    public.is_super_admin()
    or carrier_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = vehicles.carrier_id and p.status = 'APPROVED'
    )
  );

drop policy if exists vehicles_write on public.vehicles;
create policy vehicles_write on public.vehicles
  for all
  using (carrier_id = auth.uid() or public.is_super_admin())
  with check (carrier_id = auth.uid() or public.is_super_admin());

-- 7.9 shipments ------------------------------------------------------------
-- Assigned carriers may read and update their shipments; the linked buyer and
-- supplier may read (for tracking); admins have full control.
drop policy if exists shipments_select on public.shipments;
create policy shipments_select on public.shipments
  for select
  using (
    public.is_super_admin()
    or carrier_id = auth.uid()
    or exists (
      select 1 from public.deals d
      where d.id = shipments.deal_id
        and (d.buyer_id = auth.uid() or d.supplier_id = auth.uid())
    )
  );

drop policy if exists shipments_update on public.shipments;
create policy shipments_update on public.shipments
  for update
  using (carrier_id = auth.uid() or public.is_super_admin())
  with check (carrier_id = auth.uid() or public.is_super_admin());

drop policy if exists shipments_admin_insert on public.shipments;
create policy shipments_admin_insert on public.shipments
  for insert
  with check (public.is_super_admin() or carrier_id = auth.uid());

-- 7.10 notifications -------------------------------------------------------
-- A user sees their own notifications and any global broadcast; admins see all.
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select
  using (
    public.is_super_admin()
    or is_global = true
    or recipient_id = auth.uid()
  );

-- Recipients may mark their own as read; admins may update any.
drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
  for update
  using (recipient_id = auth.uid() or public.is_super_admin())
  with check (recipient_id = auth.uid() or public.is_super_admin());

-- Any authenticated user may enqueue a notification; admins drive broadcasts.
drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications
  for insert
  with check (auth.uid() is not null);

-- 7.11 disputes ------------------------------------------------------------
-- Parties to a dispute (creator/target) and admins may read; admins resolve.
drop policy if exists disputes_select on public.disputes;
create policy disputes_select on public.disputes
  for select
  using (
    public.is_super_admin()
    or creator_id = auth.uid()
    or target_id = auth.uid()
  );

drop policy if exists disputes_insert on public.disputes;
create policy disputes_insert on public.disputes
  for insert
  with check (creator_id = auth.uid() or public.is_super_admin());

-- Only admins issue verdicts / change status.
drop policy if exists disputes_update on public.disputes;
create policy disputes_update on public.disputes
  for update
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- 7.12 reviews -------------------------------------------------------------
-- Reviews are publicly readable; authors create their own; admins moderate.
drop policy if exists reviews_select on public.reviews;
create policy reviews_select on public.reviews
  for select
  using (true);

drop policy if exists reviews_insert on public.reviews;
create policy reviews_insert on public.reviews
  for insert
  with check (author_id = auth.uid() or public.is_super_admin());

drop policy if exists reviews_update on public.reviews;
create policy reviews_update on public.reviews
  for update
  using (author_id = auth.uid() or public.is_super_admin())
  with check (author_id = auth.uid() or public.is_super_admin());

drop policy if exists reviews_delete on public.reviews;
create policy reviews_delete on public.reviews
  for delete
  using (public.is_super_admin());

-- 7.13 system_logs ---------------------------------------------------------
-- Only admins read the audit trail; any authenticated actor may append.
drop policy if exists system_logs_select on public.system_logs;
create policy system_logs_select on public.system_logs
  for select
  using (public.is_super_admin());

drop policy if exists system_logs_insert on public.system_logs;
create policy system_logs_insert on public.system_logs
  for insert
  with check (auth.uid() is not null);

-- 7.14 wallets -------------------------------------------------------------
-- Owners read their own wallet; admins have full control (adjustments run
-- through the SECURITY DEFINER settlement RPC).
drop policy if exists wallets_select on public.wallets;
create policy wallets_select on public.wallets
  for select
  using (profile_id = auth.uid() or public.is_super_admin());

drop policy if exists wallets_write on public.wallets;
create policy wallets_write on public.wallets
  for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- 7.15 cms_content ---------------------------------------------------------
-- Public landing copy is world-readable; only admins mutate it.
drop policy if exists cms_content_select on public.cms_content;
create policy cms_content_select on public.cms_content
  for select
  using (true);

drop policy if exists cms_content_write on public.cms_content;
create policy cms_content_write on public.cms_content
  for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- 7.16 moderation_flags ----------------------------------------------------
-- Reporters see their own reports; admins see and resolve everything.
drop policy if exists moderation_flags_select on public.moderation_flags;
create policy moderation_flags_select on public.moderation_flags
  for select
  using (public.is_super_admin() or reporter_id = auth.uid());

drop policy if exists moderation_flags_insert on public.moderation_flags;
create policy moderation_flags_insert on public.moderation_flags
  for insert
  with check (reporter_id = auth.uid() or public.is_super_admin());

drop policy if exists moderation_flags_update on public.moderation_flags;
create policy moderation_flags_update on public.moderation_flags
  for update
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- 7.17 platform_settings ---------------------------------------------------
-- Settings are world-readable (needed to render public pricing) and
-- admin-writable.
drop policy if exists platform_settings_select on public.platform_settings;
create policy platform_settings_select on public.platform_settings
  for select
  using (true);

drop policy if exists platform_settings_write on public.platform_settings;
create policy platform_settings_write on public.platform_settings
  for all
  using (public.is_super_admin())
  with check (public.is_super_admin());


-- ---------------------------------------------------------------------------
-- 8. Realtime publication (Loop C — Req referenced by realtime sync)
--    Add domain tables to the supabase_realtime publication so the client can
--    subscribe to postgres_changes. Guarded for idempotency.
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    -- profiles
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles'
    ) then
      alter publication supabase_realtime add table public.profiles;
    end if;
    -- rfqs
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rfqs'
    ) then
      alter publication supabase_realtime add table public.rfqs;
    end if;
    -- quotations
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'quotations'
    ) then
      alter publication supabase_realtime add table public.quotations;
    end if;
    -- deals
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'deals'
    ) then
      alter publication supabase_realtime add table public.deals;
    end if;
    -- warehouses
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'warehouses'
    ) then
      alter publication supabase_realtime add table public.warehouses;
    end if;
    -- supplier_products
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'supplier_products'
    ) then
      alter publication supabase_realtime add table public.supplier_products;
    end if;
    -- vehicles
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'vehicles'
    ) then
      alter publication supabase_realtime add table public.vehicles;
    end if;
    -- shipments
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'shipments'
    ) then
      alter publication supabase_realtime add table public.shipments;
    end if;
    -- notifications
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
    ) then
      alter publication supabase_realtime add table public.notifications;
    end if;
    -- disputes
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'disputes'
    ) then
      alter publication supabase_realtime add table public.disputes;
    end if;
    -- reviews
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'reviews'
    ) then
      alter publication supabase_realtime add table public.reviews;
    end if;
    -- system_logs
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'system_logs'
    ) then
      alter publication supabase_realtime add table public.system_logs;
    end if;
    -- wallets
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'wallets'
    ) then
      alter publication supabase_realtime add table public.wallets;
    end if;
    -- cms_content
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'cms_content'
    ) then
      alter publication supabase_realtime add table public.cms_content;
    end if;
    -- moderation_flags
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'moderation_flags'
    ) then
      alter publication supabase_realtime add table public.moderation_flags;
    end if;
    -- platform_settings
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'platform_settings'
    ) then
      alter publication supabase_realtime add table public.platform_settings;
    end if;
  end if;
end$$;

-- ============================================================================
--  End of schema. Re-runnable, strict-FK, RLS-hardened, realtime-ready.
-- ============================================================================

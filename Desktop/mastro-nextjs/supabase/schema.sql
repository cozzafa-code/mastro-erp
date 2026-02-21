-- ════════════════════════════════════════════════
-- MASTRO ERP — Schema Supabase
-- Esegui questo file in Supabase → SQL Editor
-- ════════════════════════════════════════════════

-- Abilita Row Level Security ovunque
-- Ogni azienda vede SOLO i propri dati

-- ── AZIENDE ──────────────────────────────────────
create table if not exists aziende (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references auth.users(id) on delete cascade not null,
  ragione     text not null default '',
  piva        text default '',
  indirizzo   text default '',
  telefono    text default '',
  email       text default '',
  website     text default '',
  iban        text default '',
  cciaa       text default '',
  logo_url    text,
  approved    boolean default false,  -- tu lo metti true manualmente
  created_at  timestamptz default now()
);

alter table aziende enable row level security;

create policy "owner_only" on aziende
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- ── CANTIERI (commesse) ───────────────────────────
create table if not exists cantieri (
  id            text primary key,  -- "CM-0001" etc.
  azienda_id    uuid references aziende(id) on delete cascade not null,
  code          text not null,
  cliente       text not null default '',
  cognome       text default '',
  indirizzo     text default '',
  telefono      text default '',
  email         text default '',
  fase          text default 'sopralluogo',
  tipo          text default 'nuova',
  sistema       text default '',
  difficolta_salita text default '',
  mezzo_salita  text default '',
  foro_scale    text default '',
  piano_edificio text default '',
  note          text default '',
  alert         text,
  creato        text default '',
  aggiornato    text default '',
  sconto        numeric default 0,
  acconto_ricevuto numeric default 0,
  note_preventivo text default '',
  firma_cliente text,  -- base64 dataURL
  data_firma    text,
  prezzo_tapparella numeric default 0,
  prezzo_persiana   numeric default 0,
  prezzo_zanzariera numeric default 0,
  data           jsonb default '{}',  -- campo generico per dati extra
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

alter table cantieri enable row level security;

create policy "azienda_access" on cantieri
  using (azienda_id in (select id from aziende where owner_id = auth.uid()))
  with check (azienda_id in (select id from aziende where owner_id = auth.uid()));

-- ── VANI ─────────────────────────────────────────
create table if not exists vani (
  id          text primary key,
  cantiere_id text references cantieri(id) on delete cascade not null,
  azienda_id  uuid references aziende(id) on delete cascade not null,
  nome        text default '',
  tipo        text default '',
  stanza      text default '',
  piano       text default '',
  sistema     text default '',
  vetro       text default '',
  coprifilo   text default '',
  lamiera     text default '',
  colore_int  text default '',
  colore_est  text default '',
  misure      jsonb default '{}',
  accessori   jsonb default '{}',
  foto        jsonb default '{}',
  note        text default '',
  data        jsonb default '{}',
  created_at  timestamptz default now()
);

alter table vani enable row level security;

create policy "azienda_access" on vani
  using (azienda_id in (select id from aziende where owner_id = auth.uid()))
  with check (azienda_id in (select id from aziende where owner_id = auth.uid()));

-- ── TEAM ─────────────────────────────────────────
create table if not exists team (
  id          text primary key,
  azienda_id  uuid references aziende(id) on delete cascade not null,
  nome        text not null,
  ruolo       text default '',
  telefono    text default '',
  colore      text default '#007aff',
  created_at  timestamptz default now()
);

alter table team enable row level security;

create policy "azienda_access" on team
  using (azienda_id in (select id from aziende where owner_id = auth.uid()))
  with check (azienda_id in (select id from aziende where owner_id = auth.uid()));

-- ── PIPELINE ─────────────────────────────────────
create table if not exists pipeline_config (
  azienda_id  uuid references aziende(id) on delete cascade primary key,
  fasi        jsonb not null default '[]'
);

alter table pipeline_config enable row level security;

create policy "azienda_access" on pipeline_config
  using (azienda_id in (select id from aziende where owner_id = auth.uid()))
  with check (azienda_id in (select id from aziende where owner_id = auth.uid()));

-- ── SISTEMI / MATERIALI ───────────────────────────
create table if not exists materiali (
  id          uuid primary key default gen_random_uuid(),
  azienda_id  uuid references aziende(id) on delete cascade not null,
  tipo        text not null,  -- 'sistema' | 'vetro' | 'coprifilo' | 'lamiera' | 'colore'
  dati        jsonb not null default '{}',
  created_at  timestamptz default now()
);

alter table materiali enable row level security;

create policy "azienda_access" on materiali
  using (azienda_id in (select id from aziende where owner_id = auth.uid()))
  with check (azienda_id in (select id from aziende where owner_id = auth.uid()));

-- ── TRIGGER updated_at ────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger cantieri_updated_at
  before update on cantieri
  for each row execute function update_updated_at();

-- ════════════════════════════════════════════════
-- DOPO aver eseguito questo schema:
-- 1. Vai su Authentication → Users → crea utente con email+password
-- 2. Inserisci manualmente una riga in "aziende" con owner_id = user.id e approved = true
-- 3. Oppure registrati e poi aggiorna approved=true da Supabase Table Editor
-- ════════════════════════════════════════════════

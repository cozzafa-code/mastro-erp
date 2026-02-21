-- ============================================================
-- FABIO OS — Supabase Schema
-- Production-ready · Multi-tenant via user_id RLS
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  nome text,
  avatar_url text,
  mrr_target numeric default 2500,
  risparmi numeric default 0,
  valuta text default 'EUR',
  onboarded boolean default false,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "own profile" on profiles for all using (auth.uid() = id);

-- auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, nome)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- PROGETTI
-- ============================================================
create table progetti (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  nome text not null,
  descrizione text,
  stato text default 'attivo' check (stato in ('attivo','pausa','archiviato')),
  colore text default '#111111',
  mrr numeric default 0,
  beta_clienti integer default 0,
  prezzo numeric default 39,
  url text,
  repo text,
  priorita integer default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table progetti enable row level security;
create policy "own projects" on progetti for all using (auth.uid() = user_id);
create index on progetti(user_id);

-- ============================================================
-- TASKS
-- ============================================================
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  progetto_id uuid references progetti on delete set null,
  testo text not null,
  chi text default 'fabio' check (chi in ('fabio','lidia','entrambi')),
  priorita text default 'media' check (priorita in ('alta','media','bassa')),
  stato text default 'aperto' check (stato in ('aperto','fatto')),
  scadenza date,
  app text,
  ordinamento integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table tasks enable row level security;
create policy "own tasks" on tasks for all using (auth.uid() = user_id);
create index on tasks(user_id, stato);
create index on tasks(user_id, progetto_id);

-- ============================================================
-- MOVIMENTI FINANZIARI
-- ============================================================
create table movimenti (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  tipo text not null check (tipo in ('entrata','uscita')),
  categoria text not null,
  descrizione text not null,
  importo numeric not null,
  data date default current_date,
  ricorrente boolean default false,
  frequenza text check (frequenza in ('mensile','annuale','una_tantum')),
  progetto_id uuid references progetti on delete set null,
  created_at timestamptz default now()
);

alter table movimenti enable row level security;
create policy "own movimenti" on movimenti for all using (auth.uid() = user_id);
create index on movimenti(user_id, data desc);
create index on movimenti(user_id, tipo);

-- ============================================================
-- SPESE CORRENTI (ricorrenti)
-- ============================================================
create table spese_correnti (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  categoria text not null,
  descrizione text not null,
  importo numeric not null,
  frequenza text default 'mensile' check (frequenza in ('mensile','annuale','una_tantum')),
  attiva boolean default true,
  ordinamento integer default 0,
  created_at timestamptz default now()
);

alter table spese_correnti enable row level security;
create policy "own spese" on spese_correnti for all using (auth.uid() = user_id);
create index on spese_correnti(user_id, attiva);

-- ============================================================
-- CLIENTI / LICENZE
-- ============================================================
create table clienti (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  progetto_id uuid references progetti on delete cascade not null,
  nome text not null,
  email text,
  azienda text,
  piano text default 'trial' check (piano in ('trial','free','pro','business','custom')),
  stato text default 'trial' check (stato in ('trial','attivo','scaduto','churned','sospeso')),
  mrr numeric default 0,
  trial_inizio date,
  trial_fine date,
  attivazione date,
  ultimo_accesso timestamptz,
  note text,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table clienti enable row level security;
create policy "own clienti" on clienti for all using (auth.uid() = user_id);
create index on clienti(user_id, progetto_id);
create index on clienti(user_id, stato);

-- ============================================================
-- CAMPAGNE PUBBLICITARIE
-- ============================================================
create table campagne (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  progetto_id uuid references progetti on delete set null,
  nome text not null,
  canale text not null check (canale in ('google','meta','linkedin','email','seo','youtube','altro')),
  obiettivo text default 'trial' check (obiettivo in ('lead','trial','brand','traffico','retention')),
  stato text default 'pianificata' check (stato in ('attiva','pausa','pianificata','completata')),
  budget_totale numeric default 0,
  speso numeric default 0,
  impressioni integer default 0,
  click integer default 0,
  conversioni integer default 0,
  leads integer default 0,
  trial integer default 0,
  ctr numeric default 0,
  cpc numeric default 0,
  cpa numeric default 0,
  roas numeric default 0,
  data_inizio date,
  data_fine date,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table campagne enable row level security;
create policy "own campagne" on campagne for all using (auth.uid() = user_id);
create index on campagne(user_id, stato);

-- ============================================================
-- CAMPAGNA STORICO (weekly snapshots)
-- ============================================================
create table campagna_storico (
  id uuid default uuid_generate_v4() primary key,
  campagna_id uuid references campagne on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  data date not null,
  speso numeric default 0,
  click integer default 0,
  conv integer default 0,
  leads integer default 0,
  created_at timestamptz default now()
);

alter table campagna_storico enable row level security;
create policy "own storico" on campagna_storico for all using (auth.uid() = user_id);
create index on campagna_storico(campagna_id, data desc);

-- ============================================================
-- CREATIVITA CAMPAGNE
-- ============================================================
create table creativita (
  id uuid default uuid_generate_v4() primary key,
  campagna_id uuid references campagne on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  titolo text not null,
  tipo text default 'testo' check (tipo in ('testo','immagine','carosello','video','email','articolo')),
  stato text default 'bozza' check (stato in ('attiva','pausa','bozza')),
  click integer default 0,
  conversioni integer default 0,
  created_at timestamptz default now()
);

alter table creativita enable row level security;
create policy "own creativita" on creativita for all using (auth.uid() = user_id);
create index on creativita(campagna_id);

-- ============================================================
-- FILE ALLEGATI
-- ============================================================
create table allegati (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  entity_type text not null check (entity_type in ('progetto','campagna','cliente','lab','task')),
  entity_id text not null,
  nome text not null,
  estensione text,
  tipo text check (tipo in ('code','binary','link')),
  url text,
  storage_path text,
  dimensione_kb integer,
  created_at timestamptz default now()
);

alter table allegati enable row level security;
create policy "own allegati" on allegati for all using (auth.uid() = user_id);
create index on allegati(user_id, entity_type, entity_id);

-- ============================================================
-- LAB IDEE
-- ============================================================
create table lab_idee (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  nome text not null,
  tag text,
  stelle integer default 3 check (stelle between 1 and 5),
  quando text,
  nota text,
  ordinamento integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table lab_idee enable row level security;
create policy "own lab" on lab_idee for all using (auth.uid() = user_id);
create index on lab_idee(user_id, stelle desc);

-- ============================================================
-- MESSAGGI INTERNI (coppia founder)
-- ============================================================
create table messaggi (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  workspace_id uuid not null,
  da text not null,
  testo text not null,
  trasformato boolean default false,
  task_id uuid references tasks on delete set null,
  created_at timestamptz default now()
);

alter table messaggi enable row level security;
create policy "own messaggi" on messaggi for all using (auth.uid() = user_id);
create index on messaggi(user_id, created_at desc);

-- ============================================================
-- SNAPSHOT MRR (per storico grafico)
-- ============================================================
create table mrr_snapshots (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data date not null,
  mrr_totale numeric not null,
  clienti_attivi integer default 0,
  nuovi_clienti integer default 0,
  churned integer default 0,
  created_at timestamptz default now()
);

alter table mrr_snapshots enable row level security;
create policy "own mrr" on mrr_snapshots for all using (auth.uid() = user_id);
create index on mrr_snapshots(user_id, data desc);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public)
values ('allegati', 'allegati', false);

create policy "auth upload" on storage.objects
  for insert with check (bucket_id = 'allegati' and auth.role() = 'authenticated');

create policy "own files" on storage.objects
  for select using (bucket_id = 'allegati' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "own delete" on storage.objects
  for delete using (bucket_id = 'allegati' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- UTILITY: updated_at trigger
-- ============================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_progetti_updated before update on progetti for each row execute procedure set_updated_at();
create trigger trg_tasks_updated before update on tasks for each row execute procedure set_updated_at();
create trigger trg_clienti_updated before update on clienti for each row execute procedure set_updated_at();
create trigger trg_campagne_updated before update on campagne for each row execute procedure set_updated_at();
create trigger trg_lab_updated before update on lab_idee for each row execute procedure set_updated_at();

// ============================================================
// FABIO OS — Types
// ============================================================

export type UserProfile = {
  id: string
  email: string
  nome: string
  avatar_url?: string
  mrr_target: number
  risparmi: number
  valuta: string
  onboarded: boolean
  created_at: string
}

export type Progetto = {
  id: string
  user_id: string
  nome: string
  descrizione?: string
  stato: 'attivo' | 'pausa' | 'archiviato'
  colore: string
  mrr: number
  beta_clienti: number
  prezzo: number
  url?: string
  repo?: string
  priorita: number
  created_at: string
  updated_at: string
}

export type Task = {
  id: string
  user_id: string
  progetto_id?: string
  testo: string
  chi: 'fabio' | 'lidia' | 'entrambi'
  priorita: 'alta' | 'media' | 'bassa'
  stato: 'aperto' | 'fatto'
  scadenza?: string
  app?: string
  ordinamento: number
  created_at: string
  updated_at: string
  // join
  progetto?: Progetto
}

export type Movimento = {
  id: string
  user_id: string
  tipo: 'entrata' | 'uscita'
  categoria: string
  descrizione: string
  importo: number
  data: string
  ricorrente: boolean
  frequenza?: 'mensile' | 'annuale' | 'una_tantum'
  progetto_id?: string
  created_at: string
}

export type SpesaCorrente = {
  id: string
  user_id: string
  categoria: string
  descrizione: string
  importo: number
  frequenza: 'mensile' | 'annuale' | 'una_tantum'
  attiva: boolean
  ordinamento: number
  created_at: string
}

export type Cliente = {
  id: string
  user_id: string
  progetto_id: string
  nome: string
  email?: string
  azienda?: string
  piano: 'trial' | 'free' | 'pro' | 'business' | 'custom'
  stato: 'trial' | 'attivo' | 'scaduto' | 'churned' | 'sospeso'
  mrr: number
  trial_inizio?: string
  trial_fine?: string
  attivazione?: string
  ultimo_accesso?: string
  note?: string
  tags?: string[]
  created_at: string
  updated_at: string
  // join
  progetto?: Progetto
}

export type Campagna = {
  id: string
  user_id: string
  progetto_id?: string
  nome: string
  canale: 'google' | 'meta' | 'linkedin' | 'email' | 'seo' | 'youtube' | 'altro'
  obiettivo: 'lead' | 'trial' | 'brand' | 'traffico' | 'retention'
  stato: 'attiva' | 'pausa' | 'pianificata' | 'completata'
  budget_totale: number
  speso: number
  impressioni: number
  click: number
  conversioni: number
  leads: number
  trial: number
  ctr: number
  cpc: number
  cpa: number
  roas: number
  data_inizio?: string
  data_fine?: string
  note?: string
  created_at: string
  updated_at: string
  // joins
  storico?: CampagnaStorico[]
  creativita?: Creativita[]
}

export type CampagnaStorico = {
  id: string
  campagna_id: string
  user_id: string
  data: string
  speso: number
  click: number
  conv: number
  leads: number
  created_at: string
}

export type Creativita = {
  id: string
  campagna_id: string
  user_id: string
  titolo: string
  tipo: 'testo' | 'immagine' | 'carosello' | 'video' | 'email' | 'articolo'
  stato: 'attiva' | 'pausa' | 'bozza'
  click: number
  conversioni: number
  created_at: string
}

export type Allegato = {
  id: string
  user_id: string
  entity_type: 'progetto' | 'campagna' | 'cliente' | 'lab' | 'task'
  entity_id: string
  nome: string
  estensione?: string
  tipo: 'code' | 'binary' | 'link'
  url?: string
  storage_path?: string
  dimensione_kb?: number
  created_at: string
}

export type LabIdea = {
  id: string
  user_id: string
  nome: string
  tag?: string
  stelle: number
  quando?: string
  nota?: string
  ordinamento: number
  created_at: string
  updated_at: string
}

export type Messaggio = {
  id: string
  user_id: string
  workspace_id: string
  da: string
  testo: string
  trasformato: boolean
  task_id?: string
  created_at: string
}

export type MrrSnapshot = {
  id: string
  user_id: string
  data: string
  mrr_totale: number
  clienti_attivi: number
  nuovi_clienti: number
  churned: number
  created_at: string
}

// ── Computed / UI types ──────────────────────────────────────

export type FinanzaStats = {
  mrr: number
  speseTot: number
  burn: number
  runway: number
  breakeven: number
  bkPct: number
  entratePas: number
}

export type CampagnaConDettagli = Campagna & {
  storico: CampagnaStorico[]
  creativita: Creativita[]
  allegati: Allegato[]
}

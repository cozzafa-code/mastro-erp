# MASTRO ERP — Database Schema v1.0

## Architettura

```
AZIENDA (tenant root)
├── profili (utenti → auth.users)
├── pipeline_fasi (8 fasi customizzabili)
├── contatti (clienti, fornitori, architetti)
├── team (squadra lavoro)
│
├── COMMESSE
│   ├── commesse_log (cronologia azioni)
│   ├── allegati_commessa (note, audio, video, file)
│   └── RILIEVI
│       └── VANI
│           ├── misure (L, H, D1, D2, spallette...)
│           └── allegati_vano (foto categorizzate, video, disegni)
│
├── eventi (agenda/calendario)
├── tasks (to-do)
├── messaggi (WhatsApp, email, SMS, Telegram)
│
└── CATALOGO
    ├── sistemi (Aluplast, Schüco, Rehau...)
    ├── colori (RAL, Legno, Speciale)
    ├── vetri (doppi, tripli, sicurezza)
    ├── coprifili
    ├── lamiere
    ├── ct_profili (controtelaio)
    └── catalogo_accessori (persiane, tapparelle, cassonetti...)
```

## Tabelle: 23

| # | Tabella | Descrizione | Righe stimate |
|---|---------|-------------|---------------|
| 1 | `aziende` | Tenant root, dati azienda, subscription | 1 per azienda |
| 2 | `profili` | Utenti collegati ad auth.users | 1-10 per azienda |
| 3 | `pipeline_fasi` | 8 fasi workflow personalizzabili | 8 per azienda |
| 4 | `contatti` | Clienti, fornitori, architetti | 50-500 |
| 5 | `commesse` | Lavori/cantieri | 20-200/anno |
| 6 | `commesse_log` | Cronologia azioni | 5-20 per commessa |
| 7 | `rilievi` | Sopralluoghi/misure per commessa | 1-3 per commessa |
| 8 | `vani` | Finestre/porte per rilievo | 3-20 per rilievo |
| 9 | `misure` | Misure singole (L, H, D1...) | 10-30 per vano |
| 10 | `allegati_commessa` | Note, audio, video a livello commessa | 0-10 per commessa |
| 11 | `allegati_vano` | Foto categorizzate, video, disegni | 3-15 per vano |
| 12 | `eventi` | Calendario/agenda | 5-30/mese |
| 13 | `tasks` | Attività da fare | 10-50 attivi |
| 14 | `messaggi` | Comunicazioni multi-canale | 50-500/mese |
| 15 | `team` | Membri squadra | 1-10 |
| 16 | `sistemi` | Catalogo sistemi finestra | 3-15 |
| 17 | `colori` | Catalogo colori RAL/Legno | 6-30 |
| 18 | `vetri` | Catalogo vetri | 4-15 |
| 19 | `coprifili` | Catalogo coprifili | 3-10 |
| 20 | `lamiere` | Catalogo lamiere/davanzali | 3-10 |
| 21 | `ct_profili` | Profili/sezioni controtelaio | 5-20 |
| 22 | `catalogo_accessori` | Persiane, tapparelle, zanzariere | 10-30 |

## Sicurezza (RLS)

Ogni tabella ha **Row Level Security** attivo:
- `get_my_azienda_id()` → funzione che restituisce l'azienda dell'utente corrente
- Nessun utente può vedere/modificare dati di un'altra azienda
- Titolare/Admin possono gestire profili del team
- Storage: path `{azienda_id}/{commessa_id}/{file}` isolato per tenant

## Storage Buckets

| Bucket | Tipo | Pubblico | Uso |
|--------|------|----------|-----|
| `foto` | Privato | No | Foto vani categorizzate |
| `video` | Privato | No | Video cantiere/vano |
| `disegni` | Privato | No | Disegni mano libera |
| `allegati` | Privato | No | File generici, note vocali |
| `loghi` | Pubblico | Sì | Logo azienda (per PDF preventivi) |
| `firme` | Privato | No | Firme cliente su preventivo |

## Funzioni

| Funzione | Descrizione |
|----------|-------------|
| `onboard_new_user()` | Crea azienda + profilo + seed catalogo defaults |
| `next_commessa_code()` | Genera CM-0001, CM-0002... auto-incrementale |
| `get_my_azienda_id()` | Helper RLS per tenant isolation |
| `update_updated_at()` | Trigger updated_at automatico |
| `log_fase_change()` | Log automatico cambio fase commessa |

## Views

| View | Uso |
|------|-----|
| `v_commesse_dashboard` | Commesse + contatori vani/foto/giorni in fase |
| `v_agenda_oggi` | Eventi di oggi |

## Prossimi passi

1. **002_auth_setup.sql** — Configurazione OAuth (email + Google)
2. **003_storage_policies.sql** — Policy storage buckets
3. **Collegare UI** — Sostituire useState con Supabase queries
4. **PWA** — manifest.json + service worker
5. **Stripe** — Webhook subscription management

# FABIO OS — Setup Completo
## Da zero a produzione in 30 minuti

---

## STEP 1 — Crea il progetto Next.js

```bash
# Nella tua cartella di lavoro
npx create-next-app@14 fabio-os --typescript --tailwind=false --eslint --app --src-dir=false --import-alias="@/*"
cd fabio-os

# Installa dipendenze
npm install @supabase/ssr @supabase/supabase-js recharts date-fns date-fns-tz
```

Poi copia tutti i file che ti ho consegnato nella cartella del progetto rispettando la struttura.

---

## STEP 2 — Crea il progetto Supabase

1. Vai su https://supabase.com e crea un account
2. "New project" → nome: `fabio-os` → scegli regione Europe (Frankfurt)
3. Aspetta 2 minuti che si avvii
4. Vai su **SQL Editor** → incolla tutto il contenuto di `schema.sql` → Run

Verifica: vai su **Table Editor** e dovresti vedere tutte le tabelle create.

---

## STEP 3 — Configura le variabili d'ambiente

```bash
cp .env.example .env.local
```

Apri `.env.local` e compila:
- `NEXT_PUBLIC_SUPABASE_URL` → Supabase Dashboard → Settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Supabase Dashboard → Settings → API → anon key

---

## STEP 4 — Configura Auth Supabase

In Supabase Dashboard → Authentication → Settings:
- **Site URL**: `http://localhost:3000` (poi cambia con il dominio reale)
- **Redirect URLs**: aggiungi `http://localhost:3000/auth/callback`

Per Google OAuth (opzionale):
1. Vai su Google Cloud Console → Credentials → OAuth 2.0
2. Crea credenziali → Web application
3. Redirect URI: `https://[tuo-progetto].supabase.co/auth/v1/callback`
4. Torna su Supabase → Authentication → Providers → Google → incolla Client ID e Secret

---

## STEP 5 — Avvia in locale

```bash
npm run dev
```

Apri http://localhost:3000/login → crea il primo account → sei dentro.

---

## STEP 6 — Deploy su Vercel

```bash
# Installa Vercel CLI
npm i -g vercel

# Deploy
vercel

# Segui le istruzioni, poi aggiungi le env vars:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Oppure via interfaccia:
1. Vai su vercel.com → Import Project → GitHub repo
2. Aggiungi le env vars nel pannello Vercel
3. Deploy automatico ad ogni push su main

---

## STEP 7 — Dominio (opzionale)

1. Compra `fabio-os.com` su Namecheap (~€10/anno)
2. In Vercel → Domains → aggiungi il dominio
3. Aggiorna i DNS come indicato da Vercel
4. Aggiorna `NEXT_PUBLIC_APP_URL` nelle env vars
5. Aggiorna Site URL e Redirect URLs in Supabase

---

## STEP 8 — Stripe (quando sei pronto a vendere)

```bash
npm install stripe @stripe/stripe-js
```

1. Crea account su stripe.com
2. Crea 2 prodotti: FABIO OS Pro (€19/mese) e FABIO OS Team (€39/mese)
3. Copia i Price IDs nelle env vars
4. Aggiungi webhook: `https://tuodominio.com/api/stripe/webhook`
5. Aggiungi `STRIPE_WEBHOOK_SECRET` nelle env vars

---

## Struttura file progetto

```
fabio-os/
├── app/
│   ├── auth/callback/route.ts     ← OAuth redirect handler
│   ├── dashboard/
│   │   ├── layout.tsx             ← Sidebar + App Context
│   │   ├── page.tsx               ← Oggi (home)
│   │   ├── progetti/page.tsx      ← Gestione progetti
│   │   ├── finanza/page.tsx       ← Finanza + MRR
│   │   ├── campagne/page.tsx      ← Campagne marketing
│   │   ├── licenze/page.tsx       ← Clienti + licenze
│   │   ├── calendario/page.tsx    ← Calendario
│   │   ├── messaggi/page.tsx      ← Messaggi coppia
│   │   ├── email/page.tsx         ← Email
│   │   ├── lab/page.tsx           ← Lab idee
│   │   └── file/page.tsx          ← File manager
│   ├── login/page.tsx             ← Auth
│   ├── layout.tsx                 ← Root layout
│   └── globals.css                ← Stili globali
├── lib/
│   ├── supabase/
│   │   ├── client.ts              ← Browser client
│   │   └── server.ts              ← Server client
│   └── queries.ts                 ← Tutte le query DB
├── types/
│   └── index.ts                   ← TypeScript types
├── middleware.ts                  ← Auth middleware
├── schema.sql                     ← Schema Supabase
├── .env.example                   ← Template env vars
└── package.json
```

---

## Roadmap post-setup

### Settimana 1 — Core funzionante
- [ ] Setup completato, login funziona
- [ ] Pagina Oggi con task reali da Supabase
- [ ] Pagina Progetti con CRUD completo
- [ ] Pagina Finanza con spese correnti

### Settimana 2 — Feature complete
- [ ] Campagne con metriche aggiornabili
- [ ] Licenze e clienti
- [ ] File upload su Supabase Storage
- [ ] Email con template

### Settimana 3 — Lancio beta
- [ ] Landing page su fabio-os.com
- [ ] Stripe integrato
- [ ] Onboarding nuovo utente
- [ ] Primi 5 beta tester

### Settimana 4 — Growth
- [ ] Analytics usage (Posthog)
- [ ] Product Hunt launch
- [ ] Twitter/X announcement

---

## Note importanti

**Multi-tenancy**: tutto è già isolato per user_id tramite RLS Supabase.
Ogni utente vede solo i propri dati — funziona automaticamente.

**Realtime**: Supabase supporta WebSocket nativi.
Il prototipo in `lib/queries.ts` ha già `subscribeToTasks()` pronto.

**Storage file**: i file vanno su Supabase Storage (bucket `allegati`),
non in base64 nel DB. La policy è già nel schema.sql.

**Performance**: usa sempre `select('campi,specifici')` nelle query,
non `select('*')` in produzione.

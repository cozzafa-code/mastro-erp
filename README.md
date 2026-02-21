# MASTRO ERP

Sistema di gestione commesse per serramentisti.

---

## 🚀 Deploy in 5 passi

### 1. Supabase

1. Vai su [supabase.com](https://supabase.com) → **New project**
2. Nome: `mastro-erp` | Region: **West EU (Frankfurt)**
3. Vai su **SQL Editor** → incolla tutto il contenuto di `supabase/schema.sql` → Run
4. Vai su **Settings → API** → copia:
   - `Project URL`
   - `anon public` key

### 2. Crea il primo utente

1. Supabase → **Authentication → Users → Invite user**
2. Inserisci email di Walter Cozza → Invite
3. Supabase → **Table Editor → aziende → Insert row**:
   ```
   owner_id: [l'ID dell'utente appena creato]
   ragione: Walter Cozza Serramenti SRL
   approved: true
   ```

### 3. GitHub

```bash
git init
git add .
git commit -m "MASTRO ERP v1"
git remote add origin https://github.com/TUO_UTENTE/mastro-erp.git
git push -u origin main
```

### 4. Vercel

1. Vai su [vercel.com](https://vercel.com) → **New Project**
2. Importa il repo GitHub `mastro-erp`
3. Aggiungi le **Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://XXXX.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOi...
   ```
4. **Deploy** → in 2 minuti è live

### 5. Dominio (opzionale)

- Vercel → Settings → Domains → aggiungi `mastro.cozzaserramenti.it`
- Configura il DNS dal tuo provider

---

## 🔑 Aggiungere un nuovo utente

1. Supabase → Authentication → Users → **Invite user** con la sua email
2. L'utente riceve l'email, imposta la password
3. Supabase → Table Editor → aziende → Insert row con `approved: false`
4. Quando sei pronto: cambia `approved: true`
5. L'utente può accedere

---

## 💻 Sviluppo locale

```bash
# Installa dipendenze
npm install

# Crea il file env locale
cp .env.example .env.local
# Compila con i tuoi valori Supabase

# Avvia
npm run dev
# → http://localhost:3000
```

---

## 📁 Struttura

```
mastro-nextjs/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Redirect login/dashboard
│   ├── login/page.tsx      # Pagina di accesso
│   ├── dashboard/page.tsx  # App principale
│   └── api/auth/logout/    # Logout endpoint
├── components/
│   ├── MastroApp.tsx       # Wrapper con auth check
│   └── MastroERP.tsx       # App MASTRO (4700+ righe)
├── lib/
│   ├── supabase.ts         # Client browser
│   └── supabase-server.ts  # Client server
├── supabase/
│   └── schema.sql          # Schema database completo
├── middleware.ts            # Protezione routes
└── vercel.json             # Config deploy
```

---

## 🛠 Stack

- **Next.js 14** (App Router)
- **Supabase** (Auth + Database + Row Level Security)
- **Vercel** (Deploy + CDN)
- **TypeScript**

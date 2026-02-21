// seed.mjs — Carica tutti i dati in Supabase
// Uso: node seed.mjs
// Richiede: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY nel .env.local

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { config } from 'dotenv'

// Carica .env.local
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const data = JSON.parse(readFileSync('./seed-data.json', 'utf-8'))

// ── Colori per log ──────────────────────────────────────────
const ok  = (msg) => console.log(`  ✓ ${msg}`)
const err = (msg) => console.log(`  ✗ ${msg}`)
const sec = (msg) => console.log(`\n▸ ${msg}`)

// ── Ottieni user ID dal primo utente registrato ─────────────
async function getUserId() {
  // Prova a fare login con le credenziali salvate
  // Se non funziona, le inserisci tu sotto
  const EMAIL    = process.env.SEED_EMAIL    || ''
  const PASSWORD = process.env.SEED_PASSWORD || ''

  if (!EMAIL || !PASSWORD) {
    err('Aggiungi SEED_EMAIL e SEED_PASSWORD nel .env.local')
    err('Esempio:  SEED_EMAIL=tuaemail@gmail.com')
    err('          SEED_PASSWORD=tuapassword')
    process.exit(1)
  }

  const { data: auth, error } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD })
  if (error) { err('Login fallito: ' + error.message); process.exit(1) }
  ok('Login: ' + auth.user.email)
  return auth.user.id
}

// ── Seed progetti ───────────────────────────────────────────
async function seedProgetti(userId) {
  sec('Progetti')
  const { data: existing } = await supabase.from('progetti').select('id').eq('user_id', userId)
  if (existing?.length > 0) {
    ok(`Già presenti ${existing.length} progetti — skip`)
    return
  }
  for (const p of data.progetti) {
    const { error } = await supabase.from('progetti').insert({ ...p, user_id: userId })
    if (error) err(p.nome + ': ' + error.message)
    else ok(p.nome)
  }
}

// ── Seed spese correnti ─────────────────────────────────────
async function seedSpese(userId) {
  sec('Spese correnti')
  const { data: existing } = await supabase.from('spese_correnti').select('id').eq('user_id', userId)
  if (existing?.length > 0) {
    ok(`Già presenti ${existing.length} spese — skip`)
    return
  }
  for (let i = 0; i < data.spese_correnti.length; i++) {
    const s = data.spese_correnti[i]
    const { error } = await supabase.from('spese_correnti').insert({ ...s, user_id: userId, ordinamento: i })
    if (error) err(s.descrizione + ': ' + error.message)
    else ok(s.descrizione + ' €' + s.importo)
  }
}

// ── Seed movimenti ──────────────────────────────────────────
async function seedMovimenti(userId) {
  sec('Movimenti finanziari')
  const { data: existing } = await supabase.from('movimenti').select('id').eq('user_id', userId)
  if (existing?.length > 0) {
    ok(`Già presenti ${existing.length} movimenti — skip`)
    return
  }
  for (const m of data.movimenti) {
    const { error } = await supabase.from('movimenti').insert({ ...m, user_id: userId })
    if (error) err(m.descrizione + ': ' + error.message)
    else ok((m.tipo === 'entrata' ? '+' : '-') + '€' + m.importo + ' ' + m.descrizione)
  }
}

// ── Seed tasks ──────────────────────────────────────────────
async function seedTasks(userId) {
  sec('Tasks')
  const { data: existing } = await supabase.from('tasks').select('id').eq('user_id', userId)
  if (existing?.length > 0) {
    ok(`Già presenti ${existing.length} tasks — skip`)
    return
  }

  // Carica progetti per collegare i task
  const { data: progetti } = await supabase.from('progetti').select('id, nome').eq('user_id', userId)
  const projMap = {}
  progetti?.forEach(p => { projMap[p.nome] = p.id })

  for (let i = 0; i < data.tasks.length; i++) {
    const t = data.tasks[i]
    const progettoId = t.app ? Object.entries(projMap).find(([n]) => n.includes(t.app?.split(' ')[0]))?.[1] : null
    const { error } = await supabase.from('tasks').insert({
      testo: t.testo, chi: t.chi, priorita: t.priorita,
      stato: 'aperto', ordinamento: i,
      progetto_id: progettoId || null,
      user_id: userId
    })
    if (error) err(t.testo + ': ' + error.message)
    else ok(t.testo.substring(0, 50) + '...')
  }
}

// ── Seed campagne ───────────────────────────────────────────
async function seedCampagne(userId) {
  sec('Campagne')
  const { data: existing } = await supabase.from('campagne').select('id').eq('user_id', userId)
  if (existing?.length > 0) {
    ok(`Già presenti ${existing.length} campagne — skip`)
    return
  }
  for (const c of data.campagne) {
    const { error } = await supabase.from('campagne').insert({ ...c, user_id: userId })
    if (error) err(c.nome + ': ' + error.message)
    else ok(c.nome)
  }
}

// ── Seed lab idee ───────────────────────────────────────────
async function seedLab(userId) {
  sec('Lab Idee')
  const { data: existing } = await supabase.from('lab_idee').select('id').eq('user_id', userId)
  if (existing?.length > 0) {
    ok(`Già presenti ${existing.length} idee — skip`)
    return
  }
  for (let i = 0; i < data.lab_idee.length; i++) {
    const idea = data.lab_idee[i]
    const { error } = await supabase.from('lab_idee').insert({ ...idea, user_id: userId, ordinamento: i })
    if (error) err(idea.nome + ': ' + error.message)
    else ok(idea.nome + ' (' + '⭐'.repeat(idea.stelle) + ')')
  }
}

// ── Aggiorna profilo ────────────────────────────────────────
async function seedProfilo(userId) {
  sec('Profilo')
  const { error } = await supabase.from('profiles').update({
    nome: data.profilo.nome,
    mrr_target: data.profilo.mrr_target,
    risparmi: data.profilo.risparmi,
    onboarded: true
  }).eq('id', userId)
  if (error) err(error.message)
  else ok('Profilo aggiornato: ' + data.profilo.nome + ', target €' + data.profilo.mrr_target)
}

// ── MAIN ────────────────────────────────────────────────────
async function main() {
  console.log('\n═══════════════════════════════════')
  console.log('  FABIO OS — Seed Database')
  console.log('═══════════════════════════════════')

  const userId = await getUserId()

  await seedProfilo(userId)
  await seedProgetti(userId)
  await seedSpese(userId)
  await seedMovimenti(userId)
  await seedTasks(userId)
  await seedCampagne(userId)
  await seedLab(userId)

  console.log('\n═══════════════════════════════════')
  console.log('  ✓ Seed completato!')
  console.log('  Apri http://localhost:3000')
  console.log('═══════════════════════════════════\n')

  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })

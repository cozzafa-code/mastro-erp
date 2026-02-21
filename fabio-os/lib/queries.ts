// lib/queries.ts — tutte le query Supabase in un posto
import { createClient } from './supabase/client'
import type {
  Progetto, Task, Movimento, SpesaCorrente, Cliente,
  Campagna, LabIdea, Allegato, MrrSnapshot
} from '@/types'

const sb = () => createClient()

// ── PROFILO ──────────────────────────────────────────────────
export async function getProfile() {
  const { data: { user } } = await sb().auth.getUser()
  if (!user) return null
  const { data } = await sb().from('profiles').select('*').eq('id', user.id).single()
  return data
}

export async function updateProfile(updates: Partial<{nome: string, mrr_target: number, risparmi: number}>) {
  const { data: { user } } = await sb().auth.getUser()
  if (!user) return
  return sb().from('profiles').update(updates).eq('id', user.id)
}

// ── PROGETTI ─────────────────────────────────────────────────
export async function getProgetti(): Promise<Progetto[]> {
  const { data } = await sb().from('progetti').select('*').order('priorita').order('created_at')
  return data || []
}

export async function upsertProgetto(p: Partial<Progetto>) {
  const { data: { user } } = await sb().auth.getUser()
  if (!user) return
  if (p.id) {
    return sb().from('progetti').update(p).eq('id', p.id).eq('user_id', user.id)
  }
  return sb().from('progetti').insert({ ...p, user_id: user.id })
}

export async function deleteProgetto(id: string) {
  return sb().from('progetti').delete().eq('id', id)
}

// ── TASKS ────────────────────────────────────────────────────
export async function getTasks(): Promise<Task[]> {
  const { data } = await sb()
    .from('tasks')
    .select('*, progetto:progetti(id,nome,colore)')
    .order('ordinamento')
    .order('created_at', { ascending: false })
  return data || []
}

export async function upsertTask(t: Partial<Task>) {
  const { data: { user } } = await sb().auth.getUser()
  if (!user) return
  if (t.id) {
    return sb().from('tasks').update(t).eq('id', t.id).eq('user_id', user.id)
  }
  return sb().from('tasks').insert({ ...t, user_id: user.id })
}

export async function deleteTask(id: string) {
  return sb().from('tasks').delete().eq('id', id)
}

export async function toggleTask(id: string, stato: 'aperto' | 'fatto') {
  return sb().from('tasks').update({ stato }).eq('id', id)
}

// ── MOVIMENTI ────────────────────────────────────────────────
export async function getMovimenti(): Promise<Movimento[]> {
  const { data } = await sb()
    .from('movimenti')
    .select('*')
    .order('data', { ascending: false })
    .limit(200)
  return data || []
}

export async function addMovimento(m: Omit<Movimento, 'id' | 'user_id' | 'created_at'>) {
  const { data: { user } } = await sb().auth.getUser()
  if (!user) return
  return sb().from('movimenti').insert({ ...m, user_id: user.id })
}

export async function deleteMovimento(id: string) {
  return sb().from('movimenti').delete().eq('id', id)
}

// ── SPESE CORRENTI ───────────────────────────────────────────
export async function getSpeseCorrenti(): Promise<SpesaCorrente[]> {
  const { data } = await sb().from('spese_correnti').select('*').order('ordinamento').order('created_at')
  return data || []
}

export async function upsertSpesa(s: Partial<SpesaCorrente>) {
  const { data: { user } } = await sb().auth.getUser()
  if (!user) return
  if (s.id) {
    return sb().from('spese_correnti').update(s).eq('id', s.id).eq('user_id', user.id)
  }
  return sb().from('spese_correnti').insert({ ...s, user_id: user.id })
}

export async function deleteSpesa(id: string) {
  return sb().from('spese_correnti').delete().eq('id', id)
}

// ── CLIENTI ──────────────────────────────────────────────────
export async function getClienti(): Promise<Cliente[]> {
  const { data } = await sb()
    .from('clienti')
    .select('*, progetto:progetti(id,nome,colore)')
    .order('created_at', { ascending: false })
  return data || []
}

export async function upsertCliente(c: Partial<Cliente>) {
  const { data: { user } } = await sb().auth.getUser()
  if (!user) return
  if (c.id) {
    return sb().from('clienti').update(c).eq('id', c.id).eq('user_id', user.id)
  }
  return sb().from('clienti').insert({ ...c, user_id: user.id })
}

export async function deleteCliente(id: string) {
  return sb().from('clienti').delete().eq('id', id)
}

// ── CAMPAGNE ─────────────────────────────────────────────────
export async function getCampagne(): Promise<Campagna[]> {
  const { data } = await sb()
    .from('campagne')
    .select(`*, storico:campagna_storico(*), creativita:creativita(*)`)
    .order('created_at', { ascending: false })
  return data || []
}

export async function upsertCampagna(c: Partial<Campagna>) {
  const { data: { user } } = await sb().auth.getUser()
  if (!user) return
  const { storico, creativita, ...rest } = c as any
  if (rest.id) {
    return sb().from('campagne').update(rest).eq('id', rest.id).eq('user_id', user.id)
  }
  return sb().from('campagne').insert({ ...rest, user_id: user.id })
}

export async function deleteCampagna(id: string) {
  return sb().from('campagne').delete().eq('id', id)
}

// ── LAB IDEE ─────────────────────────────────────────────────
export async function getLabIdee(): Promise<LabIdea[]> {
  const { data } = await sb().from('lab_idee').select('*').order('stelle', { ascending: false }).order('ordinamento')
  return data || []
}

export async function upsertLabIdea(idea: Partial<LabIdea>) {
  const { data: { user } } = await sb().auth.getUser()
  if (!user) return
  if (idea.id) {
    return sb().from('lab_idee').update(idea).eq('id', idea.id).eq('user_id', user.id)
  }
  return sb().from('lab_idee').insert({ ...idea, user_id: user.id })
}

// ── ALLEGATI ─────────────────────────────────────────────────
export async function getAllegati(entity_type: string, entity_id: string): Promise<Allegato[]> {
  const { data } = await sb()
    .from('allegati')
    .select('*')
    .eq('entity_type', entity_type)
    .eq('entity_id', entity_id)
    .order('created_at', { ascending: false })
  return data || []
}

export async function addAllegato(a: Omit<Allegato, 'id' | 'user_id' | 'created_at'>) {
  const { data: { user } } = await sb().auth.getUser()
  if (!user) return
  return sb().from('allegati').insert({ ...a, user_id: user.id })
}

export async function deleteAllegato(id: string) {
  return sb().from('allegati').delete().eq('id', id)
}

// ── MRR SNAPSHOTS ────────────────────────────────────────────
export async function getMrrSnapshots(): Promise<MrrSnapshot[]> {
  const { data } = await sb()
    .from('mrr_snapshots')
    .select('*')
    .order('data', { ascending: true })
    .limit(24)
  return data || []
}

// ── REALTIME ─────────────────────────────────────────────────
export function subscribeToTasks(callback: () => void) {
  return sb()
    .channel('tasks-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, callback)
    .subscribe()
}

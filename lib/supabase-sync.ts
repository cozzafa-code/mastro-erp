// lib/supabase-sync.ts
// MASTRO ERP — Supabase Data Layer
import { createClient } from './supabase'

const sb = () => createClient();

// ── GET AZIENDA ID ──────────────────────────────
export async function getAziendaId(): Promise<string | null> {
  const { data: { user } } = await sb().auth.getUser();
  if (!user) return null;
  const { data } = await sb().from('aziende').select('id').eq('owner_id', user.id).single();
  return data?.id || null;
}

// ── LOAD ALL DATA ───────────────────────────────
export async function loadAllData(azId: string) {
  const s = sb();
  const [cantieri, events, contatti, team, tasks, msgs, materiali, pipeline, azienda] = await Promise.all([
    s.from('cantieri').select('*').eq('azienda_id', azId).order('created_at', { ascending: false }),
    s.from('events').select('*').eq('azienda_id', azId).order('date'),
    s.from('contatti').select('*').eq('azienda_id', azId).order('nome'),
    s.from('team').select('*').eq('azienda_id', azId),
    s.from('tasks').select('*').eq('azienda_id', azId).order('created_at', { ascending: false }),
    s.from('messages').select('*').eq('azienda_id', azId).order('created_at', { ascending: false }),
    s.from('materiali').select('*').eq('azienda_id', azId),
    s.from('pipeline_config').select('*').eq('azienda_id', azId).single(),
    s.from('aziende').select('*').eq('id', azId).single(),
  ]);

  // Parse materiali by tipo
  const mat = materiali.data || [];
  const sistemi = mat.filter((m: any) => m.tipo === 'sistema').map((m: any) => m.dati);
  const colori = mat.filter((m: any) => m.tipo === 'colore').map((m: any) => m.dati);
  const vetri = mat.filter((m: any) => m.tipo === 'vetro').map((m: any) => m.dati);
  const coprifili = mat.filter((m: any) => m.tipo === 'coprifilo').map((m: any) => m.dati);
  const lamiere = mat.filter((m: any) => m.tipo === 'lamiera').map((m: any) => m.dati);

  return {
    cantieri: cantieri.data || [],
    events: events.data || [],
    contatti: contatti.data || [],
    team: team.data || [],
    tasks: tasks.data || [],
    msgs: msgs.data || [],
    sistemi: sistemi.length ? sistemi : null,  // null = use defaults
    colori: colori.length ? colori : null,
    vetri: vetri.length ? vetri : null,
    coprifili: coprifili.length ? coprifili : null,
    lamiere: lamiere.length ? lamiere : null,
    pipeline: pipeline.data?.fasi || null,
    azienda: azienda.data || null,
  };
}

// ── SAVE FUNCTIONS ──────────────────────────────

// Cantieri (commesse)
export async function saveCantiere(azId: string, c: any) {
  const row = { ...c, azienda_id: azId };
  delete row.rilievi; // rilievi contain vani, handle separately
  const { error } = await sb().from('cantieri').upsert(row, { onConflict: 'id' });
  if (error) console.error('saveCantiere:', error.message);
  return !error;
}

export async function deleteCantiere(id: string) {
  const { error } = await sb().from('cantieri').delete().eq('id', id);
  if (error) console.error('deleteCantiere:', error.message);
}

// Events
export async function saveEvent(azId: string, ev: any) {
  const row = { ...ev, azienda_id: azId };
  if (row.id && typeof row.id === 'number') {
    const { error } = await sb().from('events').upsert(row);
    if (error) console.error('saveEvent:', error.message);
  } else {
    delete row.id;
    const { data, error } = await sb().from('events').insert(row).select().single();
    if (error) console.error('saveEvent:', error.message);
    return data;
  }
  return row;
}

export async function deleteEvent(id: number) {
  await sb().from('events').delete().eq('id', id);
}

// Contatti
export async function saveContatto(azId: string, c: any) {
  const row = { ...c, azienda_id: azId };
  if (row.id && typeof row.id === 'number') {
    const { error } = await sb().from('contatti').upsert(row);
    if (error) console.error('saveContatto:', error.message);
  } else {
    delete row.id;
    const { data, error } = await sb().from('contatti').insert(row).select().single();
    if (error) console.error('saveContatto:', error.message);
    return data;
  }
  return row;
}

// Team
export async function saveTeamMember(azId: string, t: any) {
  const row = { ...t, azienda_id: azId };
  const { error } = await sb().from('team').upsert(row);
  if (error) console.error('saveTeamMember:', error.message);
}

// Tasks
export async function saveTask(azId: string, t: any) {
  const row = { ...t, azienda_id: azId };
  if (row.id && typeof row.id === 'number') {
    const { error } = await sb().from('tasks').upsert(row);
    if (error) console.error('saveTask:', error.message);
  } else {
    delete row.id;
    const { data, error } = await sb().from('tasks').insert(row).select().single();
    if (error) console.error('saveTask:', error.message);
    return data;
  }
  return row;
}

// Azienda info
export async function saveAzienda(azId: string, info: any) {
  const { error } = await sb().from('aziende').update({
    ragione: info.ragione || '',
    piva: info.piva || '',
    indirizzo: info.indirizzo || '',
    telefono: info.telefono || '',
    email: info.email || '',
    website: info.website || '',
    iban: info.iban || '',
    cciaa: info.cciaa || '',
    logo_url: info.logo_url || null,
  }).eq('id', azId);
  if (error) console.error('saveAzienda:', error.message);
}

// Vani
export async function saveVano(azId: string, v: any) {
  const row = { ...v, azienda_id: azId };
  const { error } = await sb().from('vani').upsert(row, { onConflict: 'id' });
  if (error) console.error('saveVano:', error.message);
}

export async function deleteVano(id: string) {
  await sb().from('vani').delete().eq('id', id);
}

// Materiali (bulk save)
export async function saveMateriali(azId: string, tipo: string, items: any[]) {
  // Delete existing
  await sb().from('materiali').delete().eq('azienda_id', azId).eq('tipo', tipo);
  // Insert new
  if (items.length > 0) {
    const rows = items.map(item => ({ azienda_id: azId, tipo, dati: item }));
    const { error } = await sb().from('materiali').insert(rows);
    if (error) console.error('saveMateriali:', error.message);
  }
}

// Pipeline config
export async function savePipeline(azId: string, fasi: any[]) {
  const { error } = await sb().from('pipeline_config').upsert({ azienda_id: azId, fasi });
  if (error) console.error('savePipeline:', error.message);
}

"use client";
// @ts-nocheck
import React from "react";
import { useMastro } from "./MastroContext";
import { FF, ICO, Ico } from "./mastro-constants";

export default function ClientiPanel() {
  const {
    T, S, isDesktop, fs,
    PIPELINE, cantieri, contatti, events, fattureDB, setContatti, setNewCM, setSelectedCM, setTab,
    clientiSearch, setClientiSearch, clientiFilter, setClientiFilter,
  } = useMastro();

    const filters = [
      { id: "tutti", l: "Tutti", c: T.acc },
      { id: "cliente", l: "Clienti", c: "#007aff" },
      { id: "fornitore", l: "Fornitori", c: "#34c759" },
      { id: "professionista", l: "Professionisti", c: "#af52de" },
    ];
    const filtered = contatti
      .filter(c => clientiFilter === "tutti" || c.tipo === clientiFilter)
      .filter(c => {
        if (!clientiSearch) return true;
        const s = clientiSearch.toLowerCase();
        return (c.nome||"").toLowerCase().includes(s) || (c.cognome||"").toLowerCase().includes(s) || (c.telefono||"").includes(s) || (c.email||"").toLowerCase().includes(s) || (c.indirizzo||"").toLowerCase().includes(s);
      })
      .sort((a, b) => (a.nome||"").localeCompare(b.nome||""));

    // Count commesse per cliente
    const cmCountFor = (c) => cantieri.filter(cm => cm.cliente === c.nome || (c.cognome && cm.cognome === c.cognome)).length;

    // Dettaglio cliente selezionato — ENRICHED v2
    if (selectedCliente) {
      const c = selectedCliente;
      const cmList = cantieri.filter(cm => cm.cliente === c.nome || (c.cognome && cm.cognome === c.cognome));
      const evList = events.filter(ev => ev.persona === c.nome || ev.persona === (c.nome + " " + (c.cognome||"")).trim());
      const fattureTot = fattureDB.filter(f => cmList.some(cm => cm.id === f.cmId)).reduce((s, f) => s + (f.importo || 0), 0);
      const cmAttive = cmList.filter(cm => cm.fase !== "chiusura").length;
      const tabs = [
        { id: "info", label: "Info", icon: "📋" },
        { id: "storia", label: "Storia", icon: "📅" },
        { id: "fatturato", label: "€ Fatturato", icon: "" },
        { id: "note", label: "📝 Note", icon: "" }
      ];
      return (
        <div style={{ padding: "0 0 100px" }}>
          {/* Header */}
          <div style={{ ...S.header, display: "flex", alignItems: "center", gap: 10 }}>
            <div onClick={() => { setSelectedCliente(null); setClienteDetailTab("info"); }} style={{ cursor: "pointer", padding: 4 }}>
              <Ico d={ICO.back} s={22} c={T.text} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 800 }}>{c.nome} {c.cognome || ""}</div>
              <div style={{ fontSize: 11, color: T.sub }}>{c.tipo === "cliente" ? "👤 Cliente" : c.tipo === "fornitore" ? "🏭 Fornitore" : "👷 Professionista"}</div>
            </div>
            <div onClick={() => { const idx = contatti.findIndex(x => x.id === c.id); if (idx >= 0) { const updated = { ...c, preferito: !c.preferito }; setContatti(prev => prev.map(x => x.id === c.id ? updated : x)); setSelectedCliente(updated); } }} style={{ fontSize: 22, cursor: "pointer" }}>
              {c.preferito ? "⭐" : "☆"}
            </div>
          </div>

          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, margin: "0 16px 12px" }}>
            <div style={{ background: T.card, borderRadius: 12, padding: "12px 10px", textAlign: "center", border: "1px solid " + T.bdr }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: T.acc }}>{cmList.length}</div>
              <div style={{ fontSize: 10, color: T.sub, fontWeight: 600 }}>Commesse</div>
            </div>
            <div style={{ background: T.card, borderRadius: 12, padding: "12px 10px", textAlign: "center", border: "1px solid " + T.bdr }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: T.grn }}>{cmAttive}</div>
              <div style={{ fontSize: 10, color: T.sub, fontWeight: 600 }}>Attive</div>
            </div>
            <div style={{ background: T.card, borderRadius: 12, padding: "12px 10px", textAlign: "center", border: "1px solid " + T.bdr }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: T.orange }}>{fattureTot > 0 ? (fattureTot / 1000).toFixed(1) + "k" : "0"}</div>
              <div style={{ fontSize: 10, color: T.sub, fontWeight: 600 }}>€ Totale</div>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 0, margin: "0 16px 12px", background: T.bg, borderRadius: 10, padding: 3 }}>
            {tabs.map(t => (
              <div key={t.id} onClick={() => setClienteDetailTab(t.id)}
                style={{ flex: 1, padding: "8px 4px", textAlign: "center", borderRadius: 8, fontSize: 11, fontWeight: 700,
                  cursor: "pointer", transition: "all .2s",
                  background: clienteDetailTab === t.id ? T.card : "transparent",
                  color: clienteDetailTab === t.id ? T.acc : T.sub,
                  boxShadow: clienteDetailTab === t.id ? T.cardSh : "none"
                }}>
                {t.icon} {t.label}
              </div>
            ))}
          </div>

          {/* TAB: Info */}
          {clienteDetailTab === "info" && <>
            <div style={{ margin: "0 16px 12px", background: T.card, borderRadius: 14, padding: 16, border: "1px solid " + T.bdr }}>
              {c.telefono && <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 14 }}>📞</div>
                <div style={{ flex: 1, fontSize: 13, color: T.text }}>{c.telefono}</div>
                <div onClick={() => { window.location.href="tel:" + c.telefono; }} style={{ padding: "6px 12px", borderRadius: 8, background: T.grnLt, color: T.grn, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Chiama</div>
                <div onClick={() => window.open("https://wa.me/" + c.telefono.replace(/\s/g, ""))} style={{ padding: "6px 12px", borderRadius: 8, background: "#dcf8c6", color: "#128c7e", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>WA</div>
              </div>}
              {c.email && <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 14 }}>📧</div>
                <div style={{ flex: 1, fontSize: 13, color: T.text }}>{c.email}</div>
                <div onClick={() => window.open("mailto:" + c.email)} style={{ padding: "6px 12px", borderRadius: 8, background: T.blueLt, color: T.blue, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Email</div>
              </div>}
              {c.indirizzo && <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 14 }}>📍</div>
                <div style={{ flex: 1, fontSize: 13, color: T.text }}>{c.indirizzo}</div>
                <div onClick={() => window.open("https://maps.google.com/?q=" + encodeURIComponent(c.indirizzo))} style={{ padding: "6px 12px", borderRadius: 8, background: T.bg, color: T.sub, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Mappa</div>
              </div>}
              {c.piva && <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ fontSize: 14 }}>🏢</div>
                <div style={{ fontSize: 13, color: T.sub, fontFamily: "'JetBrains Mono',monospace" }}>{c.piva}</div>
              </div>}
              {c.cf && <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ fontSize: 14 }}>🆔</div>
                <div style={{ fontSize: 13, color: T.sub, fontFamily: "'JetBrains Mono',monospace" }}>{c.cf}</div>
              </div>}
            </div>
            <div style={{ margin: "0 16px 12px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>📂 Commesse ({cmList.length})</span>
                <div onClick={() => { setNewCM(prev => ({ ...prev, cliente: c.nome, telefono: c.telefono || "", indirizzo: c.indirizzo || "" } as any)); setTab("commesse"); }} style={{ fontSize: 11, fontWeight: 700, color: T.acc, cursor: "pointer" }}>+ Nuova commessa</div>
              </div>
              {cmList.length === 0 && <div style={{ padding: 16, background: T.card, borderRadius: 10, textAlign: "center", fontSize: 12, color: T.sub }}>Nessuna commessa</div>}
              {cmList.map(cm => (
                <div key={cm.id} onClick={() => { setSelectedCM(cm); setTab("commesse"); }} style={{ padding: "10px 12px", background: T.card, borderRadius: 10, border: "1px solid " + T.bdr, marginBottom: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: (PIPELINE.find(p => p.id === cm.fase)?.color || T.acc) + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                    {PIPELINE.find(p => p.id === cm.fase)?.icon || "📂"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{cm.code}</div>
                    <div style={{ fontSize: 11, color: T.sub }}>{PIPELINE.find(p => p.id === cm.fase)?.nome || cm.fase} · {cm.indirizzo || "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {/* TAB: Storia */}
          {clienteDetailTab === "storia" && <>
            <div style={{ margin: "0 16px 12px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 12 }}>📅 Timeline</div>
              {[...evList].sort((a, b) => (b.date || "").localeCompare(a.date || "")).length === 0 &&
                <div style={{ padding: 24, background: T.card, borderRadius: 12, textAlign: "center", fontSize: 12, color: T.sub }}>Nessuna attività registrata</div>
              }
              {[...evList].sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((ev, i) => (
                <div key={ev.id || i} style={{ display: "flex", gap: 12, marginBottom: 2 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 24 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: tipoEvColor(ev.tipo), border: "2px solid " + T.card }} />
                    {i < evList.length - 1 && <div style={{ width: 2, flex: 1, background: T.bdr }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{ev.text}</div>
                    <div style={{ fontSize: 11, color: T.sub }}>{ev.date} {ev.time && "· " + ev.time} {ev.tipo && "· " + ev.tipo}</div>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {/* TAB: Fatturato */}
          {clienteDetailTab === "fatturato" && <>
            <div style={{ margin: "0 16px 12px" }}>
              {(() => {
                const fattList = fattureDB.filter(f => cmList.some(cm => cm.id === f.cmId));
                const totaleFatt = fattList.reduce((s, f) => s + (f.importo || 0), 0);
                const totalePagato = fattList.filter(f => f.pagata).reduce((s, f) => s + (f.importo || 0), 0);
                const totaleNonPagato = totaleFatt - totalePagato;
                return <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                    <div style={{ background: T.card, borderRadius: 12, padding: 14, border: "1px solid " + T.bdr }}>
                      <div style={{ fontSize: 10, color: T.sub, fontWeight: 600, marginBottom: 4 }}>Fatturato totale</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: T.text }}>€ {totaleFatt.toLocaleString("it-IT")}</div>
                    </div>
                    <div style={{ background: T.card, borderRadius: 12, padding: 14, border: "1px solid " + T.bdr }}>
                      <div style={{ fontSize: 10, color: T.sub, fontWeight: 600, marginBottom: 4 }}>Da incassare</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: totaleNonPagato > 0 ? T.red : T.grn }}>€ {totaleNonPagato.toLocaleString("it-IT")}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 8 }}>Fatture ({fattList.length})</div>
                  {fattList.length === 0 && <div style={{ padding: 24, background: T.card, borderRadius: 12, textAlign: "center", fontSize: 12, color: T.sub }}>Nessuna fattura</div>}
                  {fattList.map(f => (
                    <div key={f.id} style={{ padding: "10px 12px", background: T.card, borderRadius: 10, border: "1px solid " + T.bdr, marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: f.pagata ? T.grn : T.red }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>€ {(f.importo || 0).toLocaleString("it-IT")}</div>
                        <div style={{ fontSize: 11, color: T.sub }}>{f.numero || "N/D"} · {f.data || ""}</div>
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: f.pagata ? T.grnLt : T.redLt, color: f.pagata ? T.grn : T.red }}>{f.pagata ? "Pagata" : "Da pagare"}</div>
                    </div>
                  ))}
                </>;
              })()}
            </div>
          </>}

          {/* TAB: Note */}
          {clienteDetailTab === "note" && <>
            <div style={{ margin: "0 16px 12px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 8 }}>📝 Note private</div>
              <textarea
                value={clienteNotes[c.id] || c.note || ""}
                onChange={e => setClienteNotes(prev => ({ ...prev, [c.id]: e.target.value }))}
                onBlur={() => { const noteVal = clienteNotes[c.id]; if (noteVal !== undefined) { setContatti(prev => prev.map(x => x.id === c.id ? { ...x, note: noteVal } : x)); setSelectedCliente({ ...c, note: noteVal }); } }}
                placeholder="Scrivi note private su questo cliente..."
                style={{ width: "100%", minHeight: 120, padding: 12, borderRadius: 12, border: "1px solid " + T.bdr, background: T.card, color: T.text, fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none" }}
              />
              {c.note && <div style={{ marginTop: 6, fontSize: 10, color: T.sub }}>Le note si salvano automaticamente</div>}
            </div>
          </>}

          {/* Azioni */}
          <div style={{ margin: "12px 16px 0", display: "flex", gap: 8 }}>
            <div onClick={() => { if(confirm("Eliminare " + c.nome + "?")) { setContatti(prev => prev.filter(x => x.id !== c.id)); setSelectedCliente(null); }}} style={{ flex: 1, padding: 12, borderRadius: 10, background: T.redLt, color: T.red, textAlign: "center", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🗑 Elimina</div>
          </div>
        </div>
      );
    }

    // Nuovo cliente modal
    if (showNewCliente) {
      return (
        <div style={{ padding: "0 0 100px" }}>
          <div style={{ ...S.header, display: "flex", alignItems: "center", gap: 10 }}>
            <div onClick={() => setShowNewCliente(false)} style={{ cursor: "pointer", padding: 4 }}>
              <Ico d={ICO.back} s={22} c={T.text} />
            </div>
            <div style={{ flex: 1, fontSize: 17, fontWeight: 800 }}>Nuovo contatto</div>
          </div>

          <div style={{ padding: "0 16px" }}>
            {/* Tipo */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {[{id:"cliente",l:"👤 Cliente"},{id:"fornitore",l:"🏭 Fornitore"},{id:"professionista",l:"👷 Professionista"}].map(t => (
                <div key={t.id} onClick={() => setNewCliente(prev => ({...prev, tipo: t.id}))} style={{ flex: 1, padding: "10px 6px", borderRadius: 10, border: `1.5px solid ${newCliente.tipo === t.id ? T.acc : T.bdr}`, background: newCliente.tipo === t.id ? T.accLt : T.card, textAlign: "center", fontSize: 11, fontWeight: 700, cursor: "pointer", color: newCliente.tipo === t.id ? T.acc : T.sub }}>{t.l}</div>
              ))}
            </div>

            {[
              { l: "Nome *", k: "nome", ph: "Mario" },
              { l: "Cognome", k: "cognome", ph: "Rossi" },
              { l: "Telefono", k: "telefono", ph: "+39 333 1234567" },
              { l: "Email", k: "email", ph: "mario@email.it" },
              { l: "Indirizzo", k: "indirizzo", ph: "Via Roma 1, Cosenza" },
              { l: "P.IVA / C.F.", k: "piva", ph: "IT01234567890" },
            ].map(f => (
              <div key={f.k} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.l}</div>
                <input value={newCliente[f.k]} onChange={e => setNewCliente(prev => ({...prev, [f.k]: e.target.value}))}
                  placeholder={f.ph} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.bdr}`, background: T.card, fontSize: 13, color: T.text, fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
            ))}

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Note</div>
              <textarea value={newCliente.note} onChange={e => setNewCliente(prev => ({...prev, note: e.target.value}))}
                placeholder="Note aggiuntive..." rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.bdr}`, background: T.card, fontSize: 13, color: T.text, fontFamily: "inherit", boxSizing: "border-box", resize: "vertical" }} />
            </div>

            <button onClick={() => {
              if (!newCliente.nome.trim()) return;
              setContatti(prev => [...prev, { id: "CT-" + Date.now(), ...newCliente, preferito: false }]);
              setNewCliente({ nome: "", cognome: "", tipo: "cliente", telefono: "", email: "", indirizzo: "", piva: "", note: "" });
              setShowNewCliente(false);
            }} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: T.acc, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              ✅ Salva contatto
            </button>
          </div>
        </div>
      );
    }

    // Lista principale
    return (
      <div style={{ padding: "0 0 100px" }}>
        <div style={{ ...S.header, flexDirection: "column", alignItems: "stretch" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 900 }}>Clienti</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: T.sub, fontWeight: 600 }}>{contatti.length}</span>
              <div onClick={() => setShowNewCliente(true)} style={{ width: 32, height: 32, borderRadius: 8, background: T.acc, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Ico d={ICO.plus} s={16} c="#fff" />
              </div>
            </div>
          </div>

          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, border: `1px solid ${T.bdr}`, background: T.card, marginBottom: 8 }}>
            <Ico d={ICO.search} s={14} c={T.sub} />
            <input value={clientiSearch} onChange={e => setClientiSearch(e.target.value)}
              placeholder="Cerca..."
              style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, color: T.text, outline: "none", fontFamily: "inherit" }} />
            {clientiSearch && <div onClick={() => setClientiSearch("")} style={{ cursor: "pointer", fontSize: 12, color: T.sub }}>✕</div>}
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 4, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 2 }}>
            {filters.map(f => (
              <div key={f.id} onClick={() => setClientiFilter(f.id)} style={{ padding: "5px 10px", borderRadius: 16, border: `1px solid ${clientiFilter === f.id ? f.c : T.bdr}`, background: clientiFilter === f.id ? f.c + "15" : T.card, fontSize: 10, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", color: clientiFilter === f.id ? f.c : T.sub }}>
                {f.l}{f.id !== "tutti" ? ` ${contatti.filter(c => c.tipo === f.id).length}` : ""}
              </div>
            ))}
          </div>
        </div>

        {/* Lista */}
        <div style={{ padding: "0 16px" }}>
          {filtered.length === 0 && (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>👤</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>Nessun contatto</div>
              <div style={{ fontSize: 12, color: T.sub }}>Aggiungi il tuo primo cliente</div>
            </div>
          )}
          {filtered.map(c => {
            const cmCount = cmCountFor(c);
            const tipoColor = c.tipo === "cliente" ? "#007aff" : c.tipo === "fornitore" ? "#34c759" : "#af52de";
            const initials = ((c.nome||"")[0] || "") + ((c.cognome||"")[0] || "");
            return (
              <div key={c.id} onClick={() => setSelectedCliente(c)} style={{ padding: "12px 14px", background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, marginBottom: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                {/* Avatar */}
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: tipoColor + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: tipoColor, flexShrink: 0 }}>
                  {initials.toUpperCase() || "?"}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 4 }}>
                    {c.nome} {c.cognome || ""}
                    {c.preferito && <span style={{ fontSize: 12 }}>⭐</span>}
                  </div>
                  <div style={{ fontSize: 11, color: T.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.telefono || c.email || c.indirizzo || "Nessun dettaglio"}
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                    <span style={{ ...S.badge(tipoColor + "15", tipoColor), fontSize: 9 }}>{c.tipo === "cliente" ? "Cliente" : c.tipo === "fornitore" ? "Fornitore" : "Professionista"}</span>
                    {cmCount > 0 && <span style={{ ...S.badge(T.accLt, T.acc), fontSize: 9 }}>📁 {cmCount}</span>}
                  </div>
                </div>
                {/* Quick actions */}
                <div style={{ display: "flex", gap: 4 }}>
                  {c.telefono && <div onClick={(e) => { e.stopPropagation(); window.location.href="tel:" + c.telefono; }} style={{ width: 32, height: 32, borderRadius: "50%", background: T.grnLt, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer" }}>📞</div>}
                  {c.telefono && <div onClick={(e) => { e.stopPropagation(); window.open("https://wa.me/" + (c.telefono||"").replace(/\s/g, "")); }} style={{ width: 32, height: 32, borderRadius: "50%", background: "#dcf8c6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer" }}>💬</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );

}

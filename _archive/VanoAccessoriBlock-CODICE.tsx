{/* ═══════════════════════════════════════════════════════════
   MASTRO ERP — ACCESSORI BLOCK v2.0 (CODICE REALE)
   Sostituisce righe ~1046-1206 in VanoDetailPanel.tsx
   
   PREREQUISITI nel context:
   - settoriAttivi (array)
   - zanzModelliDB, zanzRetiDB
   - cassModelliDB, cassIspezioneDB, cassTappoDB, cassSpallDB
   - tdSoleModelliDB, tdSoleMontaggioDB, tdSoleComandoDB
   - tdIntCategorieDB, tdIntTessutoDB, tdIntMontaggioDB, tdIntFinituraDB
   - bxDocCategorieDB, bxDocAperturaDB, bxDocVetroDB, bxDocProfiloDB
   - cancSistemaDB, cancAutoDB
   - Importa ZANZ_CATEGORIE, TDSOLE_CATEGORIE, BXDOC_CATEGORIE, CANC_CATEGORIE
     da mastro-accessori-config
   ═══════════════════════════════════════════════════════════ */}

{/* ── HEADER ACCESSORI COLLAPSIBLE ── */}
<div onClick={() => setDetailOpen(d => ({...d, accessori: !d.accessori}))} style={{ padding: "12px 16px", borderRadius: 12, border: `1px solid ${detailOpen.accessori ? "#af52de" : T.bdr}`, background: detailOpen.accessori ? "#af52de08" : T.card, marginBottom: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <span style={{ fontSize: 16 }}>✚</span>
    <span style={{ fontSize: 13, fontWeight: 700, color: detailOpen.accessori ? "#af52de" : T.text }}>Accessori</span>
    {(() => {
      const cnt = [
        v.accessori?.tapparella?.attivo, v.accessori?.persiana?.attivo, v.accessori?.zanzariera?.attivo,
        v.cassonetto,
        v.accessori?.tenda_sole?.attivo, v.accessori?.tenda_interna?.attivo,
        v.accessori?.box_doccia?.attivo, v.accessori?.cancello?.attivo,
      ].filter(Boolean).length;
      return cnt > 0 ? <span style={{ fontSize: 10, color: "#af52de", fontWeight: 700, background: "#af52de15", padding: "2px 8px", borderRadius: 6 }}>{cnt} attivi</span> : null;
    })()}
  </div>
  <span style={{ fontSize: 13, color: T.sub, transform: detailOpen.accessori ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}>▾</span>
</div>

{detailOpen.accessori && (
<div style={{ marginBottom: 12 }}>

  {/* ═══ LISTA ACCESSORI FILTRATA PER SETTORI ATTIVI ═══ */}
  {[
    { key: "tapparella",    icon: "🪟", label: "Tapparella",        color: "#ff9500", settore: "tapparelle" },
    { key: "persiana",      icon: "🏠", label: "Persiana",          color: "#007aff", settore: "persiane" },
    { key: "zanzariera",    icon: "🦟", label: "Zanzariera",        color: "#ff2d55", settore: "zanzariere" },
    { key: "cassonetto",    icon: "🧊", label: "Cassonetto",        color: "#b45309", settore: "tapparelle" },
    { key: "tenda_sole",    icon: "☀️", label: "Tenda da sole",      color: "#f59e0b", settore: "tende" },
    { key: "tenda_interna", icon: "🪞", label: "Tenda da interno",   color: "#8b5cf6", settore: "tendeinterne" },
    { key: "box_doccia",    icon: "🚿", label: "Box doccia",         color: "#06b6d4", settore: "boxdoccia" },
    { key: "cancello",      icon: "🚧", label: "Cancello/Recinzione",color: "#64748b", settore: "cancelli" },
  ].filter(acc => settoriAttivi.includes(acc.settore)).map(acc => {

    // ── CASSONETTO (gestione separata — usa v.cassonetto, non v.accessori) ──
    if (acc.key === "cassonetto") {
      const casColor = acc.color;
      const focusNext = (ids, cur) => { const i = ids.indexOf(cur); if (i < ids.length - 1) { const el = document.getElementById(ids[i + 1]); if (el) { el.focus(); el.scrollIntoView({ behavior: "smooth", block: "center" }); } } };
      const casIds = [`cas-L-${v.id}`, `cas-H-${v.id}`, `cas-P-${v.id}`, `cas-LC-${v.id}`, `cas-PC-${v.id}`];
      const casInput = (label, field, idx) => (
        <div key={field} style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>{label}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input id={casIds[idx]} style={{ flex: 1, padding: "10px", fontSize: 14, fontFamily: FM, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }} type="number" inputMode="numeric" enterKeyHint={idx < 4 ? "next" : "done"} placeholder="" value={m[field] || ""} onChange={e => updateMisura(v.id, field, e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); focusNext(casIds, casIds[idx]); } }} />
            <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "6px 8px", borderRadius: 6 }}>mm</span>
            {idx < 4 && <div onClick={() => focusNext(casIds, casIds[idx])} style={{ padding: "8px 12px", borderRadius: 8, background: casColor, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>→</div>}
          </div>
        </div>
      );
      return (
        <div key={acc.key} style={{ marginBottom: 8, borderRadius: 12, border: `1px ${v.cassonetto ? "solid" : "dashed"} ${v.cassonetto ? casColor + "40" : T.bdr}`, overflow: "hidden", background: T.card }}>
          {!v.cassonetto ? (
            <div onClick={() => { const nv = { ...v, cassonetto: true }; setSelectedVano(nv); if(selectedRilievo){const updR={...selectedRilievo,vani:selectedRilievo.vani.map(x=>x.id===v.id?nv:x)};setCantieri(cs=>cs.map(c=>c.id===selectedCM?.id?{...c,rilievi:c.rilievi.map(r2=>r2.id===selectedRilievo.id?updR:r2)}:c));setSelectedRilievo(updR);} }} style={{ padding: "14px 16px", textAlign: "center", cursor: "pointer" }}>
              <span style={{ fontSize: 12, color: T.sub }}>+ {acc.icon} Aggiungi Cassonetto</span>
            </div>
          ) : (
            <>
              <div style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.bdr}` }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: casColor }}>{acc.icon} Cassonetto</span>
                <div onClick={() => { const nv = { ...v, cassonetto: false }; setSelectedVano(nv); if(selectedRilievo){const updR={...selectedRilievo,vani:selectedRilievo.vani.map(x=>x.id===v.id?nv:x)};setCantieri(cs=>cs.map(c=>c.id===selectedCM?.id?{...c,rilievi:c.rilievi.map(r2=>r2.id===selectedRilievo.id?updR:r2)}:c));setSelectedRilievo(updR);} }} style={{ fontSize: 11, color: T.sub, cursor: "pointer" }}>▲ Chiudi</div>
              </div>
              <div style={{ padding: "12px 16px" }}>
                {/* MODELLO (NUOVO — da catalogo Ferraro) */}
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Modello</div>
                <select style={{ width: "100%", padding: "10px", fontSize: 12, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card, fontFamily: FF, marginBottom: 10 }} value={v.casModello || ""} onChange={e => {
                  const val = e.target.value;
                  updateVanoField(v.id, "casModello", val);
                  const mod = cassModelliDB.find(mx => mx.code === val);
                  if (mod?.hStd) updateMisura(v.id, "casH", mod.hStd);
                  if (mod?.pStd) updateMisura(v.id, "casP", mod.pStd);
                  if (mod?.ispezione) updateVanoField(v.id, "casIspezione", mod.ispezione);
                }}>
                  <option value="">— Seleziona modello —</option>
                  {cassModelliDB.map(cm => <option key={cm.id} value={cm.code}>{cm.code} — {cm.nome}</option>)}
                </select>

                {/* TIPO CASSONETTO (esistente) */}
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Tipo Cassonetto</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
                  {tipoCassonettoDB.map(tc => (
                    <div key={tc.id} onClick={() => updateVanoField(v.id, "casTipo", tc.code)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${v.casTipo === tc.code ? casColor : T.bdr}`, background: v.casTipo === tc.code ? casColor + "18" : T.card, fontSize: 12, cursor: "pointer", fontWeight: v.casTipo === tc.code ? 700 : 400, color: v.casTipo === tc.code ? casColor : T.text }}>{tc.code}</div>
                  ))}
                </div>

                {/* DIMENSIONI */}
                {casInput("Larghezza", "casL", 0)}
                {casInput("Altezza", "casH", 1)}
                {casInput("Profondità", "casP", 2)}

                {/* ISPEZIONE (NUOVO) */}
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, marginTop: 6, textTransform: "uppercase" }}>Tipo ispezione</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                  {cassIspezioneDB.map(ci => (
                    <div key={ci.id} onClick={() => updateVanoField(v.id, "casIspezione", ci.code)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${v.casIspezione === ci.code ? casColor : T.bdr}`, background: v.casIspezione === ci.code ? casColor + "18" : T.card, fontSize: 12, cursor: "pointer", fontWeight: v.casIspezione === ci.code ? 700 : 400, color: v.casIspezione === ci.code ? casColor : T.text }}>{ci.code}</div>
                  ))}
                </div>

                {/* TAPPO (NUOVO) */}
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Tipo tappo</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                  {cassTappoDB.map(ct => (
                    <div key={ct.id} onClick={() => updateVanoField(v.id, "casTappo", ct.code)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${v.casTappo === ct.code ? casColor : T.bdr}`, background: v.casTappo === ct.code ? casColor + "18" : T.card, fontSize: 12, cursor: "pointer", fontWeight: v.casTappo === ct.code ? 700 : 400, color: v.casTappo === ct.code ? casColor : T.text }}>{ct.code}</div>
                  ))}
                </div>

                {/* SPALLE (NUOVO) */}
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Spalle coibentate</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                  {cassSpallDB.map(cs => (
                    <div key={cs.id} onClick={() => updateVanoField(v.id, "casSpalle", cs.code)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${v.casSpalle === cs.code ? casColor : T.bdr}`, background: v.casSpalle === cs.code ? casColor + "18" : T.card, fontSize: 12, cursor: "pointer", fontWeight: v.casSpalle === cs.code ? 700 : 400, color: v.casSpalle === cs.code ? casColor : T.text }}>{cs.code}</div>
                  ))}
                </div>

                {/* CIELINO (esistente) */}
                <div style={{ marginTop: 4, marginBottom: 4, padding: "6px 0", borderTop: `1px dashed ${T.bdr}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, textTransform: "uppercase", marginBottom: 2 }}>Cielino</div>
                </div>
                {casInput("Larghezza Cielino", "casLCiel", 3)}
                {casInput("Profondità Cielino", "casPCiel", 4)}

                {/* RIMUOVI */}
                <div onClick={() => { const nv = { ...v, cassonetto: false, casModello: "", casIspezione: "", casTappo: "", casSpalle: "" }; setSelectedVano(nv); if(selectedRilievo){const updR={...selectedRilievo,vani:selectedRilievo.vani.map(x=>x.id===v.id?nv:x)};setCantieri(cs=>cs.map(c=>c.id===selectedCM?.id?{...c,rilievi:c.rilievi.map(r2=>r2.id===selectedRilievo.id?updR:r2)}:c));setSelectedRilievo(updR);} }} style={{ marginTop: 10, padding: "8px", borderRadius: 8, border: `1px dashed #ef5350`, textAlign: "center", fontSize: 11, color: "#ef5350", cursor: "pointer" }}>
                  🗑 Rimuovi cassonetto
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    // ── TUTTI GLI ALTRI ACCESSORI (tapparella, persiana, zanzariera + NUOVI) ──
    const a = v.accessori?.[acc.key] || { attivo: false };
    const focusNextAcc = (ids, cur) => { const i = ids.indexOf(cur); if (i < ids.length - 1) { const el = document.getElementById(ids[i + 1]); if (el) { el.focus(); el.scrollIntoView({ behavior: "smooth", block: "center" }); } } };
    const accInputIds = [`${acc.key}-L-${v.id}`, `${acc.key}-H-${v.id}`, `${acc.key}-P-${v.id}`];

    return (
      <div key={acc.key} style={{ marginBottom: 8, borderRadius: 12, border: `1px ${a.attivo ? "solid" : "dashed"} ${a.attivo ? acc.color + "40" : T.bdr}`, overflow: "hidden", background: T.card }}>
        {!a.attivo ? (
          <div onClick={() => toggleAccessorio(v.id, acc.key)} style={{ padding: "14px 16px", textAlign: "center", cursor: "pointer" }}>
            <span style={{ fontSize: 12, color: T.sub }}>+ {acc.icon} Aggiungi {acc.label}</span>
          </div>
        ) : (
          <>
            <div style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.bdr}` }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: acc.color }}>{acc.icon} {acc.label}</span>
              <div onClick={() => toggleAccessorio(v.id, acc.key)} style={{ fontSize: 11, color: T.sub, cursor: "pointer" }}>▲ Chiudi</div>
            </div>
            <div style={{ padding: "12px 16px" }}>

              {/* ═══ ZANZARIERA — CAMPI ARRICCHITI ═══ */}
              {acc.key === "zanzariera" && (<>
                {/* Categoria */}
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Categoria</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                  {(typeof ZANZ_CATEGORIE !== "undefined" ? ZANZ_CATEGORIE : [
                    {id:"avv_nb",code:"Avvolg. s/bottone"},{id:"avv_cb",code:"Avvolg. c/bottone"},{id:"plisse",code:"Plissettata"},
                    {id:"zip",code:"ZIP"},{id:"incas",code:"Da incasso"},{id:"pann",code:"Pannello/Battente"},
                  ]).map(cat => (
                    <div key={cat.id} onClick={() => updateAccessorio(v.id, "zanzariera", "categoria", cat.id)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${a.categoria === cat.id ? acc.color : T.bdr}`, background: a.categoria === cat.id ? acc.color + "18" : T.card, fontSize: 11, cursor: "pointer", fontWeight: a.categoria === cat.id ? 700 : 400, color: a.categoria === cat.id ? acc.color : T.text }}>{cat.code}</div>
                  ))}
                </div>
                {/* Modello (filtrato per categoria) */}
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Modello</div>
                <select style={{ width: "100%", padding: "10px", fontSize: 12, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card, fontFamily: FF, marginBottom: 10 }} value={a.modello || ""} onChange={e => updateAccessorio(v.id, "zanzariera", "modello", e.target.value)}>
                  <option value="">— Seleziona modello —</option>
                  {(zanzModelliDB || []).filter(zm => !a.categoria || zm.cat === a.categoria).map(zm => (
                    <option key={zm.id} value={zm.code}>{zm.code}{zm.note ? ` (${zm.note})` : ""}</option>
                  ))}
                </select>
                {/* Validazione dimensioni */}
                {a.modello && (() => {
                  const mod = (zanzModelliDB || []).find(zm => zm.code === a.modello);
                  if (!mod) return null;
                  const wL = a.l && (a.l < mod.lMin || a.l > mod.lMax);
                  const wH = a.h && (a.h < mod.hMin || a.h > mod.hMax);
                  return (wL || wH) ? (
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px", marginBottom: 8, fontSize: 11, color: "#991b1b", fontWeight: 600 }}>
                      ⚠️ Fuori range {a.modello}: {wL ? `L ${mod.lMin}-${mod.lMax}mm` : ""} {wH ? `H ${mod.hMin}-${mod.hMax}mm` : ""}
                    </div>
                  ) : null;
                })()}
              </>)}

              {/* ═══ TENDA DA SOLE — CAMPI NUOVI ═══ */}
              {acc.key === "tenda_sole" && (<>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Tipo</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                  {(typeof TDSOLE_CATEGORIE !== "undefined" ? TDSOLE_CATEGORIE : [
                    {id:"bracci_p",code:"Bracci"},{id:"caduta",code:"Caduta"},{id:"cappott",code:"Cappottina"},
                    {id:"antiv",code:"Antivento"},{id:"perg",code:"Pergola"},{id:"tecnica",code:"Tecnica/ZIP"},
                  ]).map(cat => (
                    <div key={cat.id} onClick={() => updateAccessorio(v.id, "tenda_sole", "categoria", cat.id)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${a.categoria === cat.id ? acc.color : T.bdr}`, background: a.categoria === cat.id ? acc.color + "18" : T.card, fontSize: 11, cursor: "pointer", fontWeight: a.categoria === cat.id ? 700 : 400, color: a.categoria === cat.id ? acc.color : T.text }}>{cat.code}</div>
                  ))}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Modello</div>
                <select style={{ width: "100%", padding: "10px", fontSize: 12, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card, fontFamily: FF, marginBottom: 10 }} value={a.modello || ""} onChange={e => updateAccessorio(v.id, "tenda_sole", "modello", e.target.value)}>
                  <option value="">— Seleziona modello —</option>
                  {(tdSoleModelliDB || []).filter(tm => !a.categoria || tm.cat === a.categoria).map(tm => (
                    <option key={tm.id} value={tm.code}>{tm.code}{tm.note ? ` (${tm.note})` : ""}</option>
                  ))}
                </select>
                {/* Validazione dimensioni tenda sole */}
                {a.modello && (() => {
                  const mod = (tdSoleModelliDB || []).find(tm => tm.code === a.modello);
                  if (!mod) return null;
                  const wL = a.larghezza && (a.larghezza < mod.lMin || a.larghezza > mod.lMax);
                  const wS = a.sporgenza && mod.spMax > 0 && (a.sporgenza < mod.spMin || a.sporgenza > mod.spMax);
                  return (wL || wS) ? (
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px", marginBottom: 8, fontSize: 11, color: "#991b1b", fontWeight: 600 }}>
                      ⚠️ Fuori range {a.modello}: {wL ? `L ${mod.lMin}-${mod.lMax}mm` : ""} {wS ? `Sp ${mod.spMin}-${mod.spMax}mm` : ""}
                    </div>
                  ) : null;
                })()}
              </>)}

              {/* ═══ TENDA DA INTERNO — CAMPI NUOVI ═══ */}
              {acc.key === "tenda_interna" && (<>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Tipo tenda</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                  {(tdIntCategorieDB || [
                    {id:"rullo",code:"Rullo"},{id:"pacchetto",code:"Pacchetto"},{id:"pannello",code:"Pannello"},
                    {id:"veneziana",code:"Veneziana"},{id:"plissett",code:"Plissettata"},{id:"bastone",code:"Bastone"},
                    {id:"binario",code:"Binario"},{id:"doppiobin",code:"Doppio binario"},{id:"tetto",code:"Da tetto"},
                  ]).map(cat => (
                    <div key={cat.id} onClick={() => updateAccessorio(v.id, "tenda_interna", "categoria", cat.id)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${a.categoria === cat.id ? acc.color : T.bdr}`, background: a.categoria === cat.id ? acc.color + "18" : T.card, fontSize: 11, cursor: "pointer", fontWeight: a.categoria === cat.id ? 700 : 400, color: a.categoria === cat.id ? acc.color : T.text }}>{cat.code}</div>
                  ))}
                </div>
              </>)}

              {/* ═══ BOX DOCCIA — CAMPI NUOVI ═══ */}
              {acc.key === "box_doccia" && (<>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Configurazione</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                  {(bxDocCategorieDB || [
                    {id:"nicchia",code:"Nicchia"},{id:"angolare",code:"Angolare"},{id:"semicir",code:"Semicircolare"},
                    {id:"walkin",code:"Walk-in"},{id:"vasca",code:"Parete vasca"},{id:"soffietto",code:"Soffietto"},
                  ]).map(cat => (
                    <div key={cat.id} onClick={() => updateAccessorio(v.id, "box_doccia", "tipo", cat.id)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${a.tipo === cat.id ? acc.color : T.bdr}`, background: a.tipo === cat.id ? acc.color + "18" : T.card, fontSize: 11, cursor: "pointer", fontWeight: a.tipo === cat.id ? 700 : 400, color: a.tipo === cat.id ? acc.color : T.text }}>{cat.code}</div>
                  ))}
                </div>
              </>)}

              {/* ═══ CANCELLO/RECINZIONE — CAMPI NUOVI ═══ */}
              {acc.key === "cancello" && (<>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Tipo</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                  {(typeof CANC_CATEGORIE !== "undefined" ? CANC_CATEGORIE : [
                    {id:"batt_s",code:"Battente singolo"},{id:"batt_d",code:"Battente doppio"},{id:"scorr",code:"Scorrevole"},
                    {id:"pedon",code:"Pedonale"},{id:"recinz",code:"Recinzione"},{id:"ringh",code:"Ringhiera"},
                  ]).map(cat => (
                    <div key={cat.id} onClick={() => updateAccessorio(v.id, "cancello", "tipo", cat.id)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${a.tipo === cat.id ? acc.color : T.bdr}`, background: a.tipo === cat.id ? acc.color + "18" : T.card, fontSize: 11, cursor: "pointer", fontWeight: a.tipo === cat.id ? 700 : 400, color: a.tipo === cat.id ? acc.color : T.text }}>{cat.code}</div>
                  ))}
                </div>
                {/* Sistema / Linea */}
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Sistema / Linea</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                  {(cancSistemaDB || []).map(cs => (
                    <div key={cs.id} onClick={() => updateAccessorio(v.id, "cancello", "sistema", cs.code)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${a.sistema === cs.code ? acc.color : T.bdr}`, background: a.sistema === cs.code ? acc.color + "18" : T.card, fontSize: 11, cursor: "pointer", fontWeight: a.sistema === cs.code ? 700 : 400, color: a.sistema === cs.code ? acc.color : T.text }}>{cs.code}</div>
                  ))}
                </div>
              </>)}

              {/* ═══ DIMENSIONI COMUNI — L × H ═══ */}
              {/* Per tenda_sole: larghezza + sporgenza + altezza installazione */}
              {acc.key === "tenda_sole" ? (<>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>Larghezza totale</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input style={{ flex: 1, padding: "10px", fontSize: 14, fontFamily: FM, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }} type="number" inputMode="numeric" placeholder="" value={a.larghezza || ""} onChange={e => updateAccessorio(v.id, acc.key, "larghezza", parseInt(e.target.value) || 0)} />
                    <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "6px 8px", borderRadius: 6 }}>mm</span>
                  </div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>Sporgenza / Proiezione</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input style={{ flex: 1, padding: "10px", fontSize: 14, fontFamily: FM, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }} type="number" inputMode="numeric" placeholder="" value={a.sporgenza || ""} onChange={e => updateAccessorio(v.id, acc.key, "sporgenza", parseInt(e.target.value) || 0)} />
                    <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "6px 8px", borderRadius: 6 }}>mm</span>
                  </div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>Altezza installazione da terra</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input style={{ flex: 1, padding: "10px", fontSize: 14, fontFamily: FM, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }} type="number" inputMode="numeric" placeholder="" value={a.altezzaInst || ""} onChange={e => updateAccessorio(v.id, acc.key, "altezzaInst", parseInt(e.target.value) || 0)} />
                    <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "6px 8px", borderRadius: 6 }}>mm</span>
                  </div>
                </div>
              </>) : acc.key === "box_doccia" ? (<>
                {/* Box doccia: larghezza + profondità condizionale + altezza */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>Larghezza apertura</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input style={{ flex: 1, padding: "10px", fontSize: 14, fontFamily: FM, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }} type="number" inputMode="numeric" placeholder="" value={a.larghezza || ""} onChange={e => updateAccessorio(v.id, acc.key, "larghezza", parseInt(e.target.value) || 0)} />
                    <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "6px 8px", borderRadius: 6 }}>mm</span>
                  </div>
                </div>
                {["angolare","semicir","pentag"].includes(a.tipo) && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>Profondità</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input style={{ flex: 1, padding: "10px", fontSize: 14, fontFamily: FM, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }} type="number" inputMode="numeric" placeholder="" value={a.profondita || ""} onChange={e => updateAccessorio(v.id, acc.key, "profondita", parseInt(e.target.value) || 0)} />
                      <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "6px 8px", borderRadius: 6 }}>mm</span>
                    </div>
                  </div>
                )}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>Altezza box</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input style={{ flex: 1, padding: "10px", fontSize: 14, fontFamily: FM, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }} type="number" inputMode="numeric" placeholder="" value={a.altezza || ""} onChange={e => updateAccessorio(v.id, acc.key, "altezza", parseInt(e.target.value) || 0)} />
                    <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "6px 8px", borderRadius: 6 }}>mm</span>
                  </div>
                </div>
              </>) : acc.key === "cancello" ? (<>
                {/* Cancello: dimensioni condizionali */}
                {["batt_s","batt_d","scorr","pedon"].includes(a.tipo) && (<>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>Larghezza apertura</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input style={{ flex: 1, padding: "10px", fontSize: 14, fontFamily: FM, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }} type="number" inputMode="numeric" placeholder="" value={a.larghezza || ""} onChange={e => updateAccessorio(v.id, acc.key, "larghezza", parseInt(e.target.value) || 0)} />
                      <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "6px 8px", borderRadius: 6 }}>mm</span>
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>Altezza</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input style={{ flex: 1, padding: "10px", fontSize: 14, fontFamily: FM, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }} type="number" inputMode="numeric" placeholder="" value={a.altezza || ""} onChange={e => updateAccessorio(v.id, acc.key, "altezza", parseInt(e.target.value) || 0)} />
                      <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "6px 8px", borderRadius: 6 }}>mm</span>
                    </div>
                  </div>
                </>)}
                {["recinz","ringh"].includes(a.tipo) && (<>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>Lunghezza totale recinzione</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input style={{ flex: 1, padding: "10px", fontSize: 14, fontFamily: FM, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }} type="number" inputMode="numeric" placeholder="" value={a.lunghezzaRec || ""} onChange={e => updateAccessorio(v.id, acc.key, "lunghezzaRec", parseInt(e.target.value) || 0)} />
                      <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "6px 8px", borderRadius: 6 }}>mm</span>
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>Altezza</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input style={{ flex: 1, padding: "10px", fontSize: 14, fontFamily: FM, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }} type="number" inputMode="numeric" placeholder="" value={a.altezza || ""} onChange={e => updateAccessorio(v.id, acc.key, "altezza", parseInt(e.target.value) || 0)} />
                      <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "6px 8px", borderRadius: 6 }}>mm</span>
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>N° moduli (2m cad.)</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input style={{ flex: 1, padding: "10px", fontSize: 14, fontFamily: FM, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }} type="number" inputMode="numeric" placeholder="" value={a.nModuli || ""} onChange={e => updateAccessorio(v.id, acc.key, "nModuli", parseInt(e.target.value) || 0)} />
                      <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "6px 8px", borderRadius: 6 }}>pz</span>
                    </div>
                    {a.lunghezzaRec > 0 && <div style={{ fontSize: 10, color: T.sub, marginTop: 2 }}>Suggerito: {Math.ceil(a.lunghezzaRec / 2000)} moduli</div>}
                  </div>
                  {a.sistema === "Gradius" && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>Pendenza terreno (°)</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <input style={{ flex: 1, padding: "10px", fontSize: 14, fontFamily: FM, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }} type="number" inputMode="numeric" max="30" placeholder="" value={a.pendenza || ""} onChange={e => updateAccessorio(v.id, acc.key, "pendenza", parseInt(e.target.value) || 0)} />
                        <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "6px 8px", borderRadius: 6 }}>°</span>
                      </div>
                      {a.pendenza > 30 && <div style={{ fontSize: 10, color: "#ff3b30", fontWeight: 600, marginTop: 2 }}>⚠️ Max 30° per sistema Gradius</div>}
                    </div>
                  )}
                </>)}
              </>) : acc.key === "tenda_interna" ? (<>
                {/* Tenda interna: larghezza + altezza + profondità condizionale */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>Larghezza</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input id={accInputIds[0]} style={{ flex: 1, padding: "10px", fontSize: 14, fontFamily: FM, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }} type="number" inputMode="numeric" enterKeyHint="next" placeholder="" value={a.larghezza || ""} onChange={e => updateAccessorio(v.id, acc.key, "larghezza", parseInt(e.target.value) || 0)} />
                    <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "6px 8px", borderRadius: 6 }}>mm</span>
                  </div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>Altezza</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input id={accInputIds[1]} style={{ flex: 1, padding: "10px", fontSize: 14, fontFamily: FM, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }} type="number" inputMode="numeric" enterKeyHint="done" placeholder="" value={a.altezza || ""} onChange={e => updateAccessorio(v.id, acc.key, "altezza", parseInt(e.target.value) || 0)} />
                    <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "6px 8px", borderRadius: 6 }}>mm</span>
                  </div>
                </div>
              </>) : (<>
                {/* Standard L × H per tapparella, persiana, zanzariera */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>Larghezza</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input id={accInputIds[0]} style={{ flex: 1, padding: "10px", fontSize: 14, fontFamily: FM, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }} type="number" inputMode="numeric" enterKeyHint="next" placeholder="" value={v.accessori?.[acc.key]?.l || ""} onChange={e => updateAccessorio(v.id, acc.key, "l", parseInt(e.target.value) || 0)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); focusNextAcc(accInputIds, accInputIds[0]); } }} />
                    <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "6px 8px", borderRadius: 6 }}>mm</span>
                    <div onClick={() => focusNextAcc(accInputIds, accInputIds[0])} style={{ padding: "8px 12px", borderRadius: 8, background: acc.color, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>→</div>
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>Altezza</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input id={accInputIds[1]} style={{ flex: 1, padding: "10px", fontSize: 14, fontFamily: FM, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }} type="number" inputMode="numeric" enterKeyHint="done" placeholder="" value={v.accessori?.[acc.key]?.h || ""} onChange={e => updateAccessorio(v.id, acc.key, "h", parseInt(e.target.value) || 0)} />
                    <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "6px 8px", borderRadius: 6 }}>mm</span>
                  </div>
                </div>
              </>)}

              {/* ═══ CAMPI SPECIFICI POST-DIMENSIONI ═══ */}

              {/* TAPPARELLA — Materiale, Motorizzata, Tipo Misura */}
              {acc.key === "tapparella" && (<>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Materiale</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                  {["PVC", "Alluminio", "Acciaio", "Legno"].map(mat => (
                    <div key={mat} onClick={() => updateAccessorio(v.id, acc.key, "materiale", mat)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${a.materiale === mat ? "#ff9500" : T.bdr}`, background: a.materiale === mat ? "#ff950018" : T.card, fontSize: 12, cursor: "pointer", fontWeight: a.materiale === mat ? 700 : 400, color: a.materiale === mat ? "#ff9500" : T.text }}>{mat}</div>
                  ))}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Motorizzata</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                  {["Sì", "No"].map(mot => (
                    <div key={mot} onClick={() => updateAccessorio(v.id, acc.key, "motorizzata", mot)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${a.motorizzata === mot ? "#34c759" : T.bdr}`, background: a.motorizzata === mot ? "#34c75918" : T.card, fontSize: 12, cursor: "pointer", fontWeight: a.motorizzata === mot ? 700 : 400, color: a.motorizzata === mot ? "#34c759" : T.text }}>{mot}</div>
                  ))}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Tipo Misura</div>
                <select style={{ width: "100%", padding: "10px", fontSize: 12, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card, fontFamily: FF, marginBottom: 10 }} value={a.tipoMisura || ""} onChange={e => updateAccessorio(v.id, acc.key, "tipoMisura", e.target.value)}>
                  <option value="">— Seleziona tipo misura —</option>
                  {tipoMisuraTappDB.map(tm => <option key={tm.id} value={tm.code}>{tm.code}</option>)}
                </select>
              </>)}

              {/* PERSIANA — Telaio, Posizionamento, Tipo Misura */}
              {acc.key === "persiana" && (<>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Tipologia Telaio</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                  {telaiPersianaDB.map(tp => (
                    <div key={tp.id} onClick={() => updateAccessorio(v.id, acc.key, "telaio", tp.code)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${a.telaio === tp.code ? "#007aff" : T.bdr}`, background: a.telaio === tp.code ? "#007aff18" : T.card, fontSize: 12, cursor: "pointer", fontWeight: a.telaio === tp.code ? 700 : 400, color: a.telaio === tp.code ? "#007aff" : T.text }}>{tp.code}</div>
                  ))}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>4° Lato / Posizionamento</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                  {posPersianaDB.map(pp => (
                    <div key={pp.id} onClick={() => updateAccessorio(v.id, acc.key, "posizionamento", pp.code)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${a.posizionamento === pp.code ? "#007aff" : T.bdr}`, background: a.posizionamento === pp.code ? "#007aff18" : T.card, fontSize: 12, cursor: "pointer", fontWeight: a.posizionamento === pp.code ? 700 : 400, color: a.posizionamento === pp.code ? "#007aff" : T.text }}>{pp.code}</div>
                  ))}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Tipo Misura</div>
                <select style={{ width: "100%", padding: "10px", fontSize: 12, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card, fontFamily: FF, marginBottom: 10 }} value={a.tipoMisura || ""} onChange={e => updateAccessorio(v.id, acc.key, "tipoMisura", e.target.value)}>
                  <option value="">— Seleziona tipo misura —</option>
                  {tipoMisuraDB.map(tm => <option key={tm.id} value={tm.code}>{tm.code}</option>)}
                </select>
              </>)}

              {/* ZANZARIERA — Lato apertura, Tipo rete, Profondità telaio, Tipo Misura */}
              {acc.key === "zanzariera" && (<>
                {a.categoria === "incas" && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>Profondità telaio (per incasso)</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input style={{ flex: 1, padding: "10px", fontSize: 14, fontFamily: FM, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }} type="number" inputMode="numeric" placeholder="" value={a.profTelaio || ""} onChange={e => updateAccessorio(v.id, "zanzariera", "profTelaio", parseInt(e.target.value) || 0)} />
                      <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "6px 8px", borderRadius: 6 }}>mm</span>
                    </div>
                  </div>
                )}
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Lato apertura</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                  {["DX", "SX", "Centrale", "Alto"].map(lato => (
                    <div key={lato} onClick={() => updateAccessorio(v.id, "zanzariera", "latoApertura", lato)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${a.latoApertura === lato ? acc.color : T.bdr}`, background: a.latoApertura === lato ? acc.color + "18" : T.card, fontSize: 12, cursor: "pointer", fontWeight: a.latoApertura === lato ? 700 : 400, color: a.latoApertura === lato ? acc.color : T.text }}>{lato}</div>
                  ))}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Tipo rete</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                  {(zanzRetiDB || []).map(r => (
                    <div key={r.id} onClick={() => updateAccessorio(v.id, "zanzariera", "tipoRete", r.code)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${a.tipoRete === r.code ? acc.color : T.bdr}`, background: a.tipoRete === r.code ? acc.color + "18" : T.card, fontSize: 11, cursor: "pointer", fontWeight: a.tipoRete === r.code ? 700 : 400, color: a.tipoRete === r.code ? acc.color : T.text }}>{r.code}{r.sovrapprezzo > 0 ? ` (+€${r.sovrapprezzo}/mq)` : ""}</div>
                  ))}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Tipo Misura</div>
                <select style={{ width: "100%", padding: "10px", fontSize: 12, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card, fontFamily: FF, marginBottom: 10 }} value={a.tipoMisura || ""} onChange={e => updateAccessorio(v.id, "zanzariera", "tipoMisura", e.target.value)}>
                  <option value="">— Seleziona tipo misura —</option>
                  {tipoMisuraZanzDB.map(tm => <option key={tm.id} value={tm.code}>{tm.code}</option>)}
                </select>
              </>)}

              {/* TENDA DA SOLE — Montaggio, Comando, Colore telo */}
              {acc.key === "tenda_sole" && (<>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Montaggio</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                  {(tdSoleMontaggioDB || []).map(m2 => (
                    <div key={m2.id} onClick={() => updateAccessorio(v.id, acc.key, "montaggio", m2.code)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${a.montaggio === m2.code ? acc.color : T.bdr}`, background: a.montaggio === m2.code ? acc.color + "18" : T.card, fontSize: 12, cursor: "pointer", fontWeight: a.montaggio === m2.code ? 700 : 400, color: a.montaggio === m2.code ? acc.color : T.text }}>{m2.code}</div>
                  ))}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Comando</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                  {(tdSoleComandoDB || []).map(co => (
                    <div key={co.id} onClick={() => updateAccessorio(v.id, acc.key, "comando", co.code)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${a.comando === co.code ? acc.color : T.bdr}`, background: a.comando === co.code ? acc.color + "18" : T.card, fontSize: 11, cursor: "pointer", fontWeight: a.comando === co.code ? 700 : 400, color: a.comando === co.code ? acc.color : T.text }}>{co.code}</div>
                  ))}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Colore telo</div>
                  <input style={{ width: "100%", padding: "10px", fontSize: 12, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card, fontFamily: FF }} placeholder="Es. Bianco, Righe giallo/bianco, Grigio..." value={a.coloreTelo || ""} onChange={e => updateAccessorio(v.id, acc.key, "coloreTelo", e.target.value)} />
                </div>
              </>)}

              {/* TENDA DA INTERNO — Montaggio, Tessuto, Finitura, Lato */}
              {acc.key === "tenda_interna" && (<>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Montaggio</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                  {(tdIntMontaggioDB || []).map(m2 => (
                    <div key={m2.id} onClick={() => updateAccessorio(v.id, acc.key, "montaggio", m2.code)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${a.montaggio === m2.code ? acc.color : T.bdr}`, background: a.montaggio === m2.code ? acc.color + "18" : T.card, fontSize: 11, cursor: "pointer", fontWeight: a.montaggio === m2.code ? 700 : 400, color: a.montaggio === m2.code ? acc.color : T.text }}>{m2.code}</div>
                  ))}
                </div>
                {(a.montaggio === "A vetro (senza fori)" || a.montaggio === "Al telaio finestra") && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>Profondità telaio finestra</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input style={{ flex: 1, padding: "10px", fontSize: 14, fontFamily: FM, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }} type="number" inputMode="numeric" placeholder="" value={a.profTelaio || ""} onChange={e => updateAccessorio(v.id, acc.key, "profTelaio", parseInt(e.target.value) || 0)} />
                      <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "6px 8px", borderRadius: 6 }}>mm</span>
                    </div>
                  </div>
                )}
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Tessuto</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                  {(tdIntTessutoDB || []).map(t2 => (
                    <div key={t2.id} onClick={() => updateAccessorio(v.id, acc.key, "tessuto", t2.code)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${a.tessuto === t2.code ? acc.color : T.bdr}`, background: a.tessuto === t2.code ? acc.color + "18" : T.card, fontSize: 12, cursor: "pointer", fontWeight: a.tessuto === t2.code ? 700 : 400, color: a.tessuto === t2.code ? acc.color : T.text }}>{t2.code}</div>
                  ))}
                </div>
                {["bastone","binario","doppiobin"].includes(a.categoria) && (<>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Finitura</div>
                  <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                    {(tdIntFinituraDB || []).map(f2 => (
                      <div key={f2.id} onClick={() => updateAccessorio(v.id, acc.key, "finitura", f2.code)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${a.finitura === f2.code ? acc.color : T.bdr}`, background: a.finitura === f2.code ? acc.color + "18" : T.card, fontSize: 12, cursor: "pointer", fontWeight: a.finitura === f2.code ? 700 : 400, color: a.finitura === f2.code ? acc.color : T.text }}>{f2.code}</div>
                    ))}
                  </div>
                </>)}
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Lato comando</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                  {["DX", "SX"].map(lato => (
                    <div key={lato} onClick={() => updateAccessorio(v.id, acc.key, "latoComando", lato)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${a.latoComando === lato ? acc.color : T.bdr}`, background: a.latoComando === lato ? acc.color + "18" : T.card, fontSize: 12, cursor: "pointer", fontWeight: a.latoComando === lato ? 700 : 400, color: a.latoComando === lato ? acc.color : T.text }}>{lato}</div>
                  ))}
                </div>
              </>)}

              {/* BOX DOCCIA — Apertura, Vetro, Profilo */}
              {acc.key === "box_doccia" && (<>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Tipo apertura</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                  {(bxDocAperturaDB || []).map(ap => (
                    <div key={ap.id} onClick={() => updateAccessorio(v.id, acc.key, "apertura", ap.code)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${a.apertura === ap.code ? acc.color : T.bdr}`, background: a.apertura === ap.code ? acc.color + "18" : T.card, fontSize: 11, cursor: "pointer", fontWeight: a.apertura === ap.code ? 700 : 400, color: a.apertura === ap.code ? acc.color : T.text }}>{ap.code}</div>
                  ))}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Vetro</div>
                <select style={{ width: "100%", padding: "10px", fontSize: 12, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card, fontFamily: FF, marginBottom: 10 }} value={a.vetro || ""} onChange={e => updateAccessorio(v.id, acc.key, "vetro", e.target.value)}>
                  <option value="">— Seleziona vetro —</option>
                  {(bxDocVetroDB || []).map(vt => <option key={vt.id} value={vt.code}>{vt.code}</option>)}
                </select>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Profilo</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                  {(bxDocProfiloDB || []).map(pr => (
                    <div key={pr.id} onClick={() => updateAccessorio(v.id, acc.key, "profilo", pr.code)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${a.profilo === pr.code ? acc.color : T.bdr}`, background: a.profilo === pr.code ? acc.color + "18" : T.card, fontSize: 11, cursor: "pointer", fontWeight: a.profilo === pr.code ? 700 : 400, color: a.profilo === pr.code ? acc.color : T.text }}>{pr.code}</div>
                  ))}
                </div>
              </>)}

              {/* CANCELLO — Automazione, Colore RAL */}
              {acc.key === "cancello" && (<>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Automazione</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                  {(cancAutoDB || []).map(au => (
                    <div key={au.id} onClick={() => updateAccessorio(v.id, acc.key, "automazione", au.code)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${a.automazione === au.code ? acc.color : T.bdr}`, background: a.automazione === au.code ? acc.color + "18" : T.card, fontSize: 11, cursor: "pointer", fontWeight: a.automazione === au.code ? 700 : 400, color: a.automazione === au.code ? acc.color : T.text }}>{au.code}</div>
                  ))}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Colore RAL</div>
                  <input style={{ width: "100%", padding: "10px", fontSize: 12, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card, fontFamily: FF }} placeholder="Es. RAL 7016, RAL 9010, COR-TEN..." value={a.coloreRAL || ""} onChange={e => updateAccessorio(v.id, acc.key, "coloreRAL", e.target.value)} />
                </div>
                <div style={{ fontSize: 10, color: T.grn, background: T.grnLt, padding: "6px 10px", borderRadius: 6, marginBottom: 10 }}>
                  ✅ Conforme UNI EN 13241:2016 — Zona vento 3
                </div>
              </>)}

              {/* ═══ COLORE COMUNE (per chi usa coloriDB) ═══ */}
              {["tapparella", "persiana", "zanzariera"].includes(acc.key) && (<>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Colore</div>
                <select style={{ width: "100%", padding: "10px", fontSize: 12, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card, fontFamily: FF }} value={a.colore || ""} onChange={e => updateAccessorio(v.id, acc.key, "colore", e.target.value)}>
                  <option value="">Colore</option>
                  {coloriDB.map(c => <option key={c.id} value={c.code}>{c.code} — {c.nome}</option>)}
                </select>
              </>)}

              {/* Tenda sole e interna: colore struttura */}
              {["tenda_sole", "tenda_interna"].includes(acc.key) && (<>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Colore struttura</div>
                <select style={{ width: "100%", padding: "10px", fontSize: 12, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card, fontFamily: FF }} value={a.colore || ""} onChange={e => updateAccessorio(v.id, acc.key, "colore", e.target.value)}>
                  <option value="">Colore</option>
                  {coloriDB.map(c => <option key={c.id} value={c.code}>{c.code} — {c.nome}</option>)}
                </select>
              </>)}

              {/* ═══ RIMUOVI ═══ */}
              <div onClick={() => toggleAccessorio(v.id, acc.key)} style={{ marginTop: 10, padding: "8px", borderRadius: 8, border: `1px dashed #ef5350`, textAlign: "center", fontSize: 11, color: "#ef5350", cursor: "pointer" }}>
                🗑 Rimuovi {acc.label.toLowerCase()}
              </div>
            </div>
          </>
        )}
      </div>
    );
  })}
</div>
)}

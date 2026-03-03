// ═══════════════════════════════════════════════════════════
// MASTRO ERP — SettingsPanel ADDITIONS v2.0
// Nuove tab e tab arricchite per le impostazioni
//
// ISTRUZIONI:
// 1. Aggiungi le nuove tab nella lista tabs (riga ~80)
// 2. Aggiungi i nuovi state nel context (vedi sotto)
// 3. Incolla i blocchi sotto nelle posizioni indicate
// ═══════════════════════════════════════════════════════════

// ── STEP 1: Aggiungi queste tab nella lista (riga ~80) ──
// Dopo { id: "cassonetto", l: "🧊 Cassonetto" }, aggiungi:
//   { id: "tendasole", l: "☀️ Tenda sole" },
//   { id: "tendainterna", l: "🪞 Tenda int." },
//   { id: "boxdoccia", l: "🚿 Box doccia" },
//   { id: "cancelli", l: "🚧 Cancelli" },

// ── STEP 2: Aggiorna SETTORI in mastro-constants.tsx ──
// Aggiungi alla fine dell'array SETTORI:
//   { id: "tendeinterne", label: "Tende da Interno", icon: "🪞", desc: "Rullo, pacchetto, veneziane, plissettate, pannello" },
//   { id: "cancelli", label: "Cancelli e Recinzioni", icon: "🚧", desc: "Battenti, scorrevoli, recinzioni, ringhiere" },

// ── STEP 3: Nuovi state nel MastroERP.tsx ──
// (importa init da mastro-accessori-config.tsx)
//
// const [zanzModelliDB, setZanzModelliDB] = useState(ZANZ_MODELLI_INIT);
// const [zanzRetiDB, setZanzRetiDB] = useState(ZANZ_RETI);
// const [cassModelliDB, setCassModelliDB] = useState(CASS_MODELLI_INIT);
// const [cassIspezioneDB, setCassIspezioneDB] = useState(CASS_ISPEZIONE);
// const [cassTappoDB, setCassTappoDB] = useState(CASS_TAPPO);
// const [cassSpallDB, setCassSpallDB] = useState(CASS_SPALLE);
// const [tdSoleModelliDB, setTdSoleModelliDB] = useState(TDSOLE_MODELLI_INIT);
// const [tdSoleMontaggioDB, setTdSoleMontaggioDB] = useState(TDSOLE_MONTAGGIO);
// const [tdSoleComandoDB, setTdSoleComandoDB] = useState(TDSOLE_COMANDO);
// const [tdIntCategorieDB, setTdIntCategorieDB] = useState(TDINT_CATEGORIE);
// const [tdIntTessutoDB, setTdIntTessutoDB] = useState(TDINT_TESSUTO);
// const [tdIntMontaggioDB, setTdIntMontaggioDB] = useState(TDINT_MONTAGGIO);
// const [tdIntFinituraDB, setTdIntFinituraDB] = useState(TDINT_FINITURA);
// const [bxDocAperturaDB, setBxDocAperturaDB] = useState(BXDOC_APERTURA);
// const [bxDocVetroDB, setBxDocVetroDB] = useState(BXDOC_VETRO);
// const [bxDocProfiloDB, setBxDocProfiloDB] = useState(BXDOC_PROFILO);
// const [cancSistemaDB, setCancSistemaDB] = useState(CANC_SISTEMA);
// const [cancAutoDB, setCancAutoDB] = useState(CANC_AUTOMAZIONE);

// ═══════════════════════════════════════════════════════════
// BLOCCHI TAB — Copia e incolla nel SettingsPanel.tsx
// dopo il blocco cassonetto (riga ~823)
// ═══════════════════════════════════════════════════════════

/* ─── TAB: ZANZARIERA (ARRICCHITA) ─────────────────────
   Sostituisce il blocco settingsTab === "zanzariera" (righe ~724-736)
   Aggiunge: modelli catalogo + tipo rete
   ──────────────────────────────────────────────────────── */

{settingsTab === "zanzariera" && (
  <>
    <div style={{ fontSize: 11, color: T.sub, marginBottom: 12 }}>Configura modelli, reti e opzioni per le zanzariere (catalogo Zanzar)</div>

    {/* MODELLI ZANZARIERE */}
    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>🦟 Modelli Zanzariere ({zanzModelliDB.length})</div>
    <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 12 }}>
      {["avv_nb","avv_cb","plisse","zip","incas","pann"].map(catId => {
        const catModels = zanzModelliDB.filter(m => m.cat === catId);
        if (catModels.length === 0) return null;
        const catLabel = {avv_nb:"Avvolgenti s/bottone",avv_cb:"Avvolgenti c/bottone",plisse:"Plissettate",zip:"ZIP/Tecniche",incas:"Da incasso",pann:"Pannello/Battente"}[catId];
        return (
          <div key={catId} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#ff2d55", textTransform: "uppercase", marginBottom: 4 }}>{catLabel}</div>
            {catModels.map(zm => (
              <div key={zm.id} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px" }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{zm.code}</span>
                  <span style={{ fontSize: 10, color: T.sub, marginLeft: 6 }}>{zm.lMin}–{zm.lMax} × {zm.hMin}–{zm.hMax}mm</span>
                  {zm.prezzo > 0 && <span style={{ fontSize: 10, color: "#34c759", marginLeft: 6 }}>€{zm.prezzo}/{zm.unitaPrezzo}</span>}
                </div>
                <div onClick={() => setZanzModelliDB(prev => prev.filter(x => x.id !== zm.id))} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
              </div></div>
            ))}
          </div>
        );
      })}
    </div>
    <div onClick={() => {
      let n; try{n=window.prompt("Nuovo modello zanzariera (nome):");}catch(e){}
      if (n?.trim()) {
        let cat; try{cat=window.prompt("Categoria (avv_nb/avv_cb/plisse/zip/incas/pann):");}catch(e){}
        setZanzModelliDB(prev => [...prev, { id: "zc" + Date.now(), code: n.trim(), cat: cat?.trim() || "avv_nb", lMin: 400, lMax: 1600, hMin: 400, hMax: 2500, prezzo: 0, unitaPrezzo: "mq", note: "" }]);
      }
    }} style={{ padding: "12px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginBottom: 16 }}>+ Aggiungi modello</div>

    {/* TIPO RETE */}
    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>🕸 Tipo Rete</div>
    {zanzRetiDB.map(r => (
      <div key={r.id} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{r.code}</span>
          {r.sovrapprezzo > 0 && <span style={{ fontSize: 10, color: "#ff9500", marginLeft: 8 }}>+€{r.sovrapprezzo}/mq</span>}
        </div>
        <div onClick={() => setZanzRetiDB(prev => prev.filter(x => x.id !== r.id))} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
      </div></div>
    ))}
    <div onClick={() => { let n; try{n=window.prompt("Nuovo tipo rete:");}catch(e){} if (n?.trim()) setZanzRetiDB(prev => [...prev, { id: "zr" + Date.now(), code: n.trim(), sovrapprezzo: 0 }]); }} style={{ padding: "12px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginTop: 4, marginBottom: 16 }}>+ Aggiungi rete</div>

    {/* TIPO MISURA (esistente) */}
    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>📏 Tipo Misura Zanzariera</div>
    {tipoMisuraZanzDB.map(tm => (
      <div key={tm.id} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{tm.code}</span>
        <div onClick={() => setTipoMisuraZanzDB(prev => prev.filter(x => x.id !== tm.id))} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
      </div></div>
    ))}
    <div onClick={() => { let n; try{n=window.prompt("Nuovo tipo misura zanzariera:");}catch(e){} if (n?.trim()) setTipoMisuraZanzDB(prev => [...prev, { id: "tmz" + Date.now(), code: n.trim() }]); }} style={{ padding: "12px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginTop: 4 }}>+ Aggiungi tipo misura</div>
  </>
)}

/* ─── TAB: CASSONETTO (ARRICCHITA) ────────────────────
   Sostituisce il blocco settingsTab === "cassonetto" (righe ~811-823)
   Aggiunge: modelli Ferraro, ispezione, tappo, spalle
   ──────────────────────────────────────────────────────── */

{settingsTab === "cassonetto" && (
  <>
    <div style={{ fontSize: 11, color: T.sub, marginBottom: 12 }}>Configura modelli e opzioni cassonetto (catalogo Ferraro)</div>

    {/* MODELLI CASSONETTO */}
    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>🧊 Modelli Cassonetto ({cassModelliDB.length})</div>
    {cassModelliDB.map(cm => (
      <div key={cm.id} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px" }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{cm.code}</span>
          <span style={{ fontSize: 10, color: T.sub, marginLeft: 6 }}>{cm.nome}</span>
          {cm.hStd > 0 && <span style={{ fontSize: 10, color: "#b45309", marginLeft: 6 }}>{cm.hStd}×{cm.pStd}mm</span>}
          <span style={{ fontSize: 9, color: T.sub, marginLeft: 4 }}>isp: {cm.ispezione}</span>
        </div>
        <div onClick={() => setCassModelliDB(prev => prev.filter(x => x.id !== cm.id))} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
      </div></div>
    ))}
    <div onClick={() => { let n; try{n=window.prompt("Nuovo modello cassonetto (codice):");}catch(e){} if (n?.trim()) setCassModelliDB(prev => [...prev, { id: "cm" + Date.now(), code: n.trim(), nome: "", lMax: 6000, hStd: 0, pStd: 0, ispezione: "frontale" }]); }} style={{ padding: "12px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginTop: 4, marginBottom: 16 }}>+ Aggiungi modello</div>

    {/* TIPO CASSONETTO (esistente) */}
    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>📐 Tipo Cassonetto</div>
    {tipoCassonettoDB.map(tc => (
      <div key={tc.id} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{tc.code}</span>
        <div onClick={() => setTipoCassonettoDB(prev => prev.filter(x => x.id !== tc.id))} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
      </div></div>
    ))}
    <div onClick={() => { let n; try{n=window.prompt("Nuovo tipo cassonetto:");}catch(e){} if (n?.trim()) setTipoCassonettoDB(prev => [...prev, { id: "tc" + Date.now(), code: n.trim() }]); }} style={{ padding: "12px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginTop: 4, marginBottom: 16 }}>+ Aggiungi tipo</div>

    {/* ISPEZIONE */}
    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>👁 Tipo Ispezione</div>
    {cassIspezioneDB.map(ci => (
      <div key={ci.id} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{ci.code}</span>
        <div onClick={() => setCassIspezioneDB(prev => prev.filter(x => x.id !== ci.id))} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
      </div></div>
    ))}
    <div onClick={() => { let n; try{n=window.prompt("Nuovo tipo ispezione:");}catch(e){} if (n?.trim()) setCassIspezioneDB(prev => [...prev, { id: "ci" + Date.now(), code: n.trim() }]); }} style={{ padding: "12px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginTop: 4, marginBottom: 16 }}>+ Aggiungi ispezione</div>

    {/* TAPPO */}
    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>🔲 Tipo Tappo</div>
    {cassTappoDB.map(ct => (
      <div key={ct.id} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{ct.code}</span>
        <div onClick={() => setCassTappoDB(prev => prev.filter(x => x.id !== ct.id))} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
      </div></div>
    ))}
    <div onClick={() => { let n; try{n=window.prompt("Nuovo tipo tappo:");}catch(e){} if (n?.trim()) setCassTappoDB(prev => [...prev, { id: "ctp" + Date.now(), code: n.trim() }]); }} style={{ padding: "12px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginTop: 4, marginBottom: 16 }}>+ Aggiungi tappo</div>

    {/* SPALLE */}
    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>🏗 Spalle Coibentate</div>
    {cassSpallDB.map(cs => (
      <div key={cs.id} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{cs.code}</span>
        {cs.barra > 0 && <span style={{ fontSize: 10, color: T.sub }}>barra {cs.barra}mm</span>}
        <div onClick={() => setCassSpallDB(prev => prev.filter(x => x.id !== cs.id))} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
      </div></div>
    ))}
    <div onClick={() => { let n; try{n=window.prompt("Nuova spalla coibentata:");}catch(e){} if (n?.trim()) setCassSpallDB(prev => [...prev, { id: "csp" + Date.now(), code: n.trim(), barra: 0 }]); }} style={{ padding: "12px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginTop: 4 }}>+ Aggiungi spalla</div>
  </>
)}

/* ─── TAB: TENDA DA SOLE (NUOVA) ──────────────────────── */

{settingsTab === "tendasole" && (
  <>
    <div style={{ fontSize: 11, color: T.sub, marginBottom: 12 }}>Configura modelli tende da sole (catalogo Tenditalia / TendaMaggi)</div>

    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>☀️ Modelli Tende da Sole ({tdSoleModelliDB.length})</div>
    <div style={{ maxHeight: 350, overflowY: "auto", marginBottom: 12 }}>
      {["bracci_p","bracci_b","caduta","cappott","antiv","giard","perg","tecnica"].map(catId => {
        const catModels = tdSoleModelliDB.filter(m => m.cat === catId);
        if (catModels.length === 0) return null;
        const catLabel = {bracci_p:"Bracci piastre",bracci_b:"Bracci barra quadra",caduta:"Caduta",cappott:"Cappottine",antiv:"Antivento",giard:"Giardino",perg:"Pergole",tecnica:"Tecniche"}[catId];
        return (
          <div key={catId} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", marginBottom: 4 }}>{catLabel}</div>
            {catModels.map(tm => (
              <div key={tm.id} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px" }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{tm.code}</span>
                  <span style={{ fontSize: 10, color: T.sub, marginLeft: 6 }}>L {tm.lMin}–{tm.lMax} Sp {tm.spMin}–{tm.spMax}mm</span>
                  {tm.note && <span style={{ fontSize: 9, color: T.sub, marginLeft: 4 }}>({tm.note})</span>}
                </div>
                <div onClick={() => setTdSoleModelliDB(prev => prev.filter(x => x.id !== tm.id))} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
              </div></div>
            ))}
          </div>
        );
      })}
    </div>
    <div onClick={() => { let n; try{n=window.prompt("Nuovo modello tenda (nome):");}catch(e){} if (n?.trim()) setTdSoleModelliDB(prev => [...prev, { id: "ts" + Date.now(), code: n.trim(), cat: "bracci_p", lMin: 2000, lMax: 5000, spMin: 1500, spMax: 3000, prezzo: 0, note: "" }]); }} style={{ padding: "12px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginBottom: 16 }}>+ Aggiungi modello</div>

    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>🔧 Montaggio</div>
    {tdSoleMontaggioDB.map(m2 => (
      <div key={m2.id} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{m2.code}</span>
        <div onClick={() => setTdSoleMontaggioDB(prev => prev.filter(x => x.id !== m2.id))} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
      </div></div>
    ))}
    <div onClick={() => { let n; try{n=window.prompt("Nuovo montaggio:");}catch(e){} if (n?.trim()) setTdSoleMontaggioDB(prev => [...prev, { id: "tsm" + Date.now(), code: n.trim() }]); }} style={{ padding: "12px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginTop: 4, marginBottom: 16 }}>+ Aggiungi montaggio</div>

    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>⚡ Comando</div>
    {tdSoleComandoDB.map(co => (
      <div key={co.id} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{co.code}</span>
        <div onClick={() => setTdSoleComandoDB(prev => prev.filter(x => x.id !== co.id))} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
      </div></div>
    ))}
    <div onClick={() => { let n; try{n=window.prompt("Nuovo comando:");}catch(e){} if (n?.trim()) setTdSoleComandoDB(prev => [...prev, { id: "tsc" + Date.now(), code: n.trim() }]); }} style={{ padding: "12px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginTop: 4 }}>+ Aggiungi comando</div>
  </>
)}

/* ─── TAB: TENDA DA INTERNO (NUOVA) ──────────────────── */

{settingsTab === "tendainterna" && (
  <>
    <div style={{ fontSize: 11, color: T.sub, marginBottom: 12 }}>Configura tipi e opzioni tende da interno (catalogo Tuiss)</div>

    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>🪞 Categorie ({tdIntCategorieDB.length})</div>
    {tdIntCategorieDB.map(cat => (
      <div key={cat.id} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{cat.code}</span>
          {cat.desc && <span style={{ fontSize: 10, color: T.sub, marginLeft: 6 }}>{cat.desc}</span>}
        </div>
        <div onClick={() => setTdIntCategorieDB(prev => prev.filter(x => x.id !== cat.id))} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
      </div></div>
    ))}
    <div onClick={() => { let n; try{n=window.prompt("Nuova categoria tenda interna:");}catch(e){} if (n?.trim()) setTdIntCategorieDB(prev => [...prev, { id: "tic" + Date.now(), code: n.trim(), desc: "" }]); }} style={{ padding: "12px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginTop: 4, marginBottom: 16 }}>+ Aggiungi categoria</div>

    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>🧵 Tessuti</div>
    {tdIntTessutoDB.map(t2 => (
      <div key={t2.id} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{t2.code}</span>
        <div onClick={() => setTdIntTessutoDB(prev => prev.filter(x => x.id !== t2.id))} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
      </div></div>
    ))}
    <div onClick={() => { let n; try{n=window.prompt("Nuovo tessuto:");}catch(e){} if (n?.trim()) setTdIntTessutoDB(prev => [...prev, { id: "tit" + Date.now(), code: n.trim() }]); }} style={{ padding: "12px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginTop: 4, marginBottom: 16 }}>+ Aggiungi tessuto</div>

    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>🔧 Montaggio</div>
    {tdIntMontaggioDB.map(m2 => (
      <div key={m2.id} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{m2.code}</span>
        <div onClick={() => setTdIntMontaggioDB(prev => prev.filter(x => x.id !== m2.id))} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
      </div></div>
    ))}
    <div onClick={() => { let n; try{n=window.prompt("Nuovo montaggio:");}catch(e){} if (n?.trim()) setTdIntMontaggioDB(prev => [...prev, { id: "tim" + Date.now(), code: n.trim() }]); }} style={{ padding: "12px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginTop: 4, marginBottom: 16 }}>+ Aggiungi montaggio</div>

    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>✨ Finiture (bastone/binario)</div>
    {tdIntFinituraDB.map(f2 => (
      <div key={f2.id} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{f2.code}</span>
        <div onClick={() => setTdIntFinituraDB(prev => prev.filter(x => x.id !== f2.id))} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
      </div></div>
    ))}
    <div onClick={() => { let n; try{n=window.prompt("Nuova finitura:");}catch(e){} if (n?.trim()) setTdIntFinituraDB(prev => [...prev, { id: "tif" + Date.now(), code: n.trim() }]); }} style={{ padding: "12px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginTop: 4 }}>+ Aggiungi finitura</div>
  </>
)}

/* ─── TAB: BOX DOCCIA (NUOVA) ─────────────────────────── */

{settingsTab === "boxdoccia" && (
  <>
    <div style={{ fontSize: 11, color: T.sub, marginBottom: 12 }}>Configura le opzioni per box doccia (catalogo Deghi)</div>

    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>🚿 Tipo Apertura</div>
    {bxDocAperturaDB.map(ap => (
      <div key={ap.id} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{ap.code}</span>
        <div onClick={() => setBxDocAperturaDB(prev => prev.filter(x => x.id !== ap.id))} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
      </div></div>
    ))}
    <div onClick={() => { let n; try{n=window.prompt("Nuovo tipo apertura:");}catch(e){} if (n?.trim()) setBxDocAperturaDB(prev => [...prev, { id: "bxa" + Date.now(), code: n.trim() }]); }} style={{ padding: "12px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginTop: 4, marginBottom: 16 }}>+ Aggiungi apertura</div>

    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>🪟 Tipo Vetro</div>
    {bxDocVetroDB.map(vt => (
      <div key={vt.id} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{vt.code}</span>
        <div onClick={() => setBxDocVetroDB(prev => prev.filter(x => x.id !== vt.id))} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
      </div></div>
    ))}
    <div onClick={() => { let n; try{n=window.prompt("Nuovo tipo vetro:");}catch(e){} if (n?.trim()) setBxDocVetroDB(prev => [...prev, { id: "bxv" + Date.now(), code: n.trim() }]); }} style={{ padding: "12px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginTop: 4, marginBottom: 16 }}>+ Aggiungi vetro</div>

    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>🔩 Profilo</div>
    {bxDocProfiloDB.map(pr => (
      <div key={pr.id} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{pr.code}</span>
        <div onClick={() => setBxDocProfiloDB(prev => prev.filter(x => x.id !== pr.id))} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
      </div></div>
    ))}
    <div onClick={() => { let n; try{n=window.prompt("Nuovo profilo (es. Cromo lucido):");}catch(e){} if (n?.trim()) setBxDocProfiloDB(prev => [...prev, { id: "bxp" + Date.now(), code: n.trim() }]); }} style={{ padding: "12px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginTop: 4 }}>+ Aggiungi profilo</div>
  </>
)}

/* ─── TAB: CANCELLI E RECINZIONI (NUOVA) ──────────────── */

{settingsTab === "cancelli" && (
  <>
    <div style={{ fontSize: 11, color: T.sub, marginBottom: 12 }}>Configura sistemi cancelli e recinzioni (catalogo Eurofer 2025-26)</div>

    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>🚧 Sistemi / Linee</div>
    {cancSistemaDB.map(cs => (
      <div key={cs.id} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{cs.code}</span>
          {cs.desc && <span style={{ fontSize: 10, color: T.sub, marginLeft: 6 }}>{cs.desc}</span>}
          {cs.moduli && <span style={{ fontSize: 9, color: "#34c759", marginLeft: 4 }}>modulare</span>}
        </div>
        <div onClick={() => setCancSistemaDB(prev => prev.filter(x => x.id !== cs.id))} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
      </div></div>
    ))}
    <div onClick={() => { let n; try{n=window.prompt("Nuovo sistema (nome):");}catch(e){} if (n?.trim()) setCancSistemaDB(prev => [...prev, { id: "cns" + Date.now(), code: n.trim(), desc: "", moduli: false }]); }} style={{ padding: "12px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginTop: 4, marginBottom: 16 }}>+ Aggiungi sistema</div>

    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>⚡ Automazione</div>
    {cancAutoDB.map(au => (
      <div key={au.id} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{au.code}</span>
        <div onClick={() => setCancAutoDB(prev => prev.filter(x => x.id !== au.id))} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
      </div></div>
    ))}
    <div onClick={() => { let n; try{n=window.prompt("Nuova opzione automazione:");}catch(e){} if (n?.trim()) setCancAutoDB(prev => [...prev, { id: "cna" + Date.now(), code: n.trim() }]); }} style={{ padding: "12px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginTop: 4, marginBottom: 16 }}>+ Aggiungi automazione</div>

    <div style={{ padding: "12px 16px", borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", marginTop: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", marginBottom: 4 }}>📋 Normativa</div>
      <div style={{ fontSize: 10, color: "#166534", lineHeight: 1.5 }}>
        Cancelli conformi a UNI EN 13241:2016 — Marcatura CE obbligatoria.
        Zona vento 3 (copre quasi tutto il territorio italiano).
        Classe corrosione C3 standard, C4 su richiesta per zone costiere.
      </div>
    </div>
  </>
)}

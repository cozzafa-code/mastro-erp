with open(r'components\MastroERP.tsx', 'r', encoding='utf-8-sig') as f:
    src = f.read()

errors = []

# ── 1. Tab MISURE in renderCMDetail (sostituisce il contenuto del return misure) ──
# Trova il return Info e aggiungici il contenuto corretto
old1 = "        {cmDetailTab === \"info\" && (\n          <div style={{ padding: \"14px 16px\" }}>\n            {[[\"Cliente\",(c.cliente||\"\")+(c.cognome?\" \"+c.cognome:\"\")],[\"Indirizzo\",c.indirizzo||\"-\"],[\"Codice\",c.code],[\"Telefono\",c.telefono||\"-\"],[\"Sistema\",c.sistema||\"-\"],[\"Vani\",(c.vani?c.vani.length:0)+\" vani\"],[\"Fase\",c.fase||\"-\"]].map(function(item) {\n              var k = item[0]; var val = item[1];\n              return <div key={k} style={{ display: \"flex\", justifyContent: \"space-between\", padding: \"10px 12px\", borderRadius: 8, background: T.card, border: \"1px solid \" + T.bdr, marginBottom: 6 }}>\n                <div style={{ fontSize: 12, color: T.sub, fontWeight: 600 }}>{k}</div>\n                <div style={{ fontSize: 12, fontWeight: 600 }}>{val}</div>\n              </div>;\n            })}\n          </div>\n        )}"
new1 = """        {cmDetailTab === "info" && (
          <div style={{ padding: "14px 16px", paddingBottom: 80 }}>
            {[
              ["Cliente", (c.cliente||"")+(c.cognome?" "+c.cognome:"")],
              ["Indirizzo", c.indirizzo||"—"],
              ["Codice", c.code],
              ["Telefono", c.telefono||"—"],
              ["Sistema", c.sistema||"—"],
              ["Totale vani", (c.vani?c.vani.length:0)+" vani"],
              ["Visite", (c.visite||[]).length+" sopralluogh"+((c.visite||[]).length===1?"o":"i")],
              ["Avanzamento", progH+"% ("+vaniMH.length+"/"+vaniListH.length+")"],
              ["Importo", c.euro ? "€"+c.euro.toLocaleString("it-IT") : "—"],
              ["Fase", c.fase||"—"],
            ].map(function(item) {
              var k = item[0]; var val = item[1];
              return <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", borderRadius: 8, background: T.card, border: "1px solid " + T.bdr, marginBottom: 6 }}>
                <div style={{ fontSize: 12, color: T.sub, fontWeight: 600 }}>{k}</div>
                <div style={{ fontSize: 12, fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{val}</div>
              </div>;
            })}
          </div>
        )}

        {cmDetailTab === "misure" && (
          <div style={{ padding: "14px 16px", paddingBottom: 80 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>Stato per vano</div>
            {vaniListH.length === 0 && <div style={{ textAlign: "center", padding: 24, color: T.sub, fontSize: 13 }}>Nessun vano configurato</div>}
            {vaniListH.map(function(vano) {
              const mis = (c.visite||[]).find(function(v) { return (v.vaniMisurati||[]).includes(vano.id); });
              var blk = null;
              for (var i = (c.visite||[]).length - 1; i >= 0; i--) {
                const b = ((c.visite||[])[i].vaniBloccati||[]).find(function(b) { return b.vanoId === vano.id; });
                if (b) { blk = Object.assign({}, b, { nV: (c.visite||[])[i].n }); break; }
              }
              const isMis = !!mis;
              const isBlk = !isMis && !!blk;
              const isNone = !isMis && !blk;
              const iconBg = isMis ? "#f0fff4" : isBlk ? "#fff5f5" : T.bdr+"40";
              const iconColor = isMis ? T.grn : isBlk ? "#ff3b30" : T.sub;
              const icon = isMis ? "✅" : isBlk ? "🔴" : "⏳";
              return (
                <div key={vano.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", borderRadius: 10, background: T.card, border: "1px solid " + T.bdr, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{vano.nome}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {vano.mq && <span style={{ fontSize: 11, color: T.sub }}>~{vano.mq}m²</span>}
                        {!isMis && <span style={{ padding: "1px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700, color: "#ff3b30", background: "#fff5f5", border: "1px solid #ff3b3030" }}>DA FARE</span>}
                      </div>
                    </div>
                    {isMis && <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>{mis.n}ª visita · {mis.data ? new Date(mis.data+"T12:00:00").toLocaleDateString("it-IT",{day:"numeric",month:"short"}) : "—"}</div>}
                    {isBlk && <div style={{ fontSize: 11, color: "#ff3b30", marginTop: 2 }}>{blk.motivo}{blk.note ? " — "+blk.note : ""}</div>}
                    {isNone && <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>Non ancora visitato</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}"""

if old1 in src:
    src = src.replace(old1, new1, 1)
    print("✓ 1. Tab Misure e Info aggiornati")
else:
    errors.append("✗ 1")
    print(errors[-1])
    # mostra cosa c'è
    idx = src.find('cmDetailTab === "info"')
    print(repr(src[idx:idx+200]))

ob = src.count('{') - src.count('}')
print(f"\nBrackets: {ob}\nErrori: {len(errors)}")
if not errors and ob == 0:
    with open(r'components\MastroERP.tsx', 'w', encoding='utf-8') as f:
        f.write(src)
    print("SALVATO OK")
else:
    print("NON salvato")
// ═══════════════════════════════════════════════════════════
// MASTRO ERP — lib/pdf-misure.ts
// Generazione PDF Misure per Produzione (estratto da MastroERP.tsx)
// ═══════════════════════════════════════════════════════════

import { TIPOLOGIE_RAPIDE } from "../components/mastro-constants";

interface MisureDeps {
  aziendaInfo: any;
  getVaniAttivi: (c: any) => any[];
}

export function generaPDFMisure(c: any, deps: MisureDeps) {
  const { aziendaInfo, getVaniAttivi } = deps;
  const aziendaDB = aziendaInfo; // alias compatibilità
    const az = aziendaDB;
    const vani = getVaniAttivi(c);
    const fmt = (n) => n.toLocaleString("it-IT", { minimumFractionDigits: 2 });

    const vaniHtml = vani.map((v, i) => {
      const m = v.misure || {};
      const fotoEntries = Object.entries(v.foto || {}).filter(([, f]) => f.tipo === "foto" && f.dataUrl);
      const tip = TIPOLOGIE_RAPIDE.find(t => t.code === v.tipo);
      const lmm = m.lCentro || m.lAlto || m.lBasso || 0;
      const hmm = m.hCentro || m.hSx || m.hDx || 0;
      const mq = lmm > 0 && hmm > 0 ? ((lmm / 1000) * (hmm / 1000)) : 0;

      return `<div style="border:1.5px solid #333;border-radius:6px;padding:12px;margin-bottom:10px;page-break-inside:avoid">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #333;padding-bottom:6px;margin-bottom:8px">
          <div>
            <span style="font-size:18px;font-weight:900;color:#0D7C6B">${String(i + 1).padStart(2, "0")}</span>
            <span style="font-size:14px;font-weight:800;margin-left:8px">${v.nome}</span>
            <span style="font-size:11px;color:#666;margin-left:8px">${tip?.label || v.tipo} · ${v.stanza || ""} · ${v.piano || ""}</span>
          </div>
          <div style="text-align:right">
            <div style="font-size:13px;font-weight:900">${lmm} × ${hmm} mm</div>
            <div style="font-size:10px;color:#666">${mq.toFixed(2)} m² ${(v.pezzi || 1) > 1 ? "× " + v.pezzi + " pz" : ""}</div>
          </div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:10px">
          <tr>
            <td style="border:1px solid #ccc;padding:4px;background:#f0f8ff;font-weight:700;width:50%" colspan="2"><I d={ICO.ruler} /> LARGHEZZE (mm)</td>
            <td style="border:1px solid #ccc;padding:4px;background:#fff8f0;font-weight:700;width:50%" colspan="2"><I d={ICO.ruler} /> ALTEZZE (mm)</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:4px">Alto</td><td style="border:1px solid #ccc;padding:4px;font-weight:700;font-family:monospace">${m.lAlto || "—"}</td>
            <td style="border:1px solid #ccc;padding:4px">Sinistra</td><td style="border:1px solid #ccc;padding:4px;font-weight:700;font-family:monospace">${m.hSx || "—"}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:4px">Centro</td><td style="border:1px solid #ccc;padding:4px;font-weight:700;font-family:monospace">${m.lCentro || "—"}</td>
            <td style="border:1px solid #ccc;padding:4px">Centro</td><td style="border:1px solid #ccc;padding:4px;font-weight:700;font-family:monospace">${m.hCentro || "—"}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:4px">Basso</td><td style="border:1px solid #ccc;padding:4px;font-weight:700;font-family:monospace">${m.lBasso || "—"}</td>
            <td style="border:1px solid #ccc;padding:4px">Destra</td><td style="border:1px solid #ccc;padding:4px;font-weight:700;font-family:monospace">${m.hDx || "—"}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:4px;background:#fef3f3" colspan="2">↗ Diag 1: <b>${m.d1 || "—"}</b></td>
            <td style="border:1px solid #ccc;padding:4px;background:#fef3f3" colspan="2">↘ Diag 2: <b>${m.d2 || "—"}</b> ${m.d1 > 0 && m.d2 > 0 ? `(Δ ${Math.abs(m.d1 - m.d2)} mm${Math.abs(m.d1 - m.d2) > 3 ? " ⚠️" : " ✅"})` : ""}</td>
          </tr>
        </table>
        <table style="width:100%;border-collapse:collapse;font-size:10px;margin-top:4px">
          <tr>
            <td style="border:1px solid #ccc;padding:4px;background:#f0fff0;font-weight:700" colspan="4"><I d={ICO.settings} /> CONFIGURAZIONE</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:4px">Sistema</td><td style="border:1px solid #ccc;padding:4px;font-weight:700">${v.sistema || "—"}</td>
            <td style="border:1px solid #ccc;padding:4px">Vetro</td><td style="border:1px solid #ccc;padding:4px;font-weight:700">${v.vetro || "—"}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:4px">Colore INT</td><td style="border:1px solid #ccc;padding:4px;font-weight:700">${v.coloreInt || "—"}</td>
            <td style="border:1px solid #ccc;padding:4px">Colore EST</td><td style="border:1px solid #ccc;padding:4px;font-weight:700">${v.bicolore ? (v.coloreEst || "—") : "= INT"}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:4px">Telaio</td><td style="border:1px solid #ccc;padding:4px;font-weight:700">${v.telaio === "Z" ? "Z" : v.telaio === "L" ? "L" : "—"}${v.telaioAlaZ ? " Ala " + v.telaioAlaZ : ""}</td>
            <td style="border:1px solid #ccc;padding:4px">Coprifilo</td><td style="border:1px solid #ccc;padding:4px;font-weight:700">${v.coprifilo || "—"}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:4px">Lamiera</td><td style="border:1px solid #ccc;padding:4px;font-weight:700">${v.lamiera || "—"}</td>
            <td style="border:1px solid #ccc;padding:4px">Col. Acc.</td><td style="border:1px solid #ccc;padding:4px;font-weight:700">${v.coloreAcc || "= profili"}</td>
          </tr>
          ${v.rifilato ? `<tr><td style="border:1px solid #ccc;padding:4px;background:#fff8e6" colspan="4"><I d={ICO.scissors} /> RIFILATO — Sx: ${v.rifilSx || "—"} · Dx: ${v.rifilDx || "—"} · Sopra: ${v.rifilSopra || "—"} · Sotto: ${v.rifilSotto || "—"}</td></tr>` : ""}
        </table>
        <table style="width:100%;border-collapse:collapse;font-size:10px;margin-top:4px">
          <tr>
            <td style="border:1px solid #ccc;padding:4px;background:#f5f0ff;font-weight:700" colspan="4"><I d={ICO.layers} /> MURATURA</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:3px">Sp. Sx</td><td style="border:1px solid #ccc;padding:3px;font-weight:700">${m.spSx || "—"}</td>
            <td style="border:1px solid #ccc;padding:3px">Sp. Dx</td><td style="border:1px solid #ccc;padding:3px;font-weight:700">${m.spDx || "—"}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:3px">Sp. Sopra</td><td style="border:1px solid #ccc;padding:3px;font-weight:700">${m.spSopra || "—"}</td>
            <td style="border:1px solid #ccc;padding:3px">Imbotte</td><td style="border:1px solid #ccc;padding:3px;font-weight:700">${m.imbotte || "—"}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:3px">Dav. Prof.</td><td style="border:1px solid #ccc;padding:3px;font-weight:700">${m.davProf || "—"}</td>
            <td style="border:1px solid #ccc;padding:3px">Dav. Sporg.</td><td style="border:1px solid #ccc;padding:3px;font-weight:700">${m.davSporg || "—"}</td>
          </tr>
          <tr><td style="border:1px solid #ccc;padding:3px">Soglia</td><td style="border:1px solid #ccc;padding:3px;font-weight:700" colspan="3">${m.soglia || "—"}</td></tr>
        </table>
        ${v.controtelaio?.tipo ? `<table style="width:100%;border-collapse:collapse;font-size:10px;margin-top:4px">
          <tr><td style="border:1px solid #ccc;padding:4px;background:#e8f4fd;font-weight:700" colspan="4"><I d={ICO.square} /> CONTROTELAIO ${(v.controtelaio.tipo || "").toUpperCase()}</td></tr>
          <tr><td style="border:1px solid #ccc;padding:3px">L</td><td style="border:1px solid #ccc;padding:3px;font-weight:700">${v.controtelaio.l || "—"}</td><td style="border:1px solid #ccc;padding:3px">H</td><td style="border:1px solid #ccc;padding:3px;font-weight:700">${v.controtelaio.h || "—"}</td></tr>
          ${v.controtelaio.hCass ? `<tr><td style="border:1px solid #ccc;padding:3px">H Cass.</td><td style="border:1px solid #ccc;padding:3px;font-weight:700">${v.controtelaio.hCass}</td><td style="border:1px solid #ccc;padding:3px">Sezione</td><td style="border:1px solid #ccc;padding:3px;font-weight:700">${v.controtelaio.sezione || "—"}</td></tr>` : ""}
        </table>` : ""}
        ${v.accessori?.tapparella?.attivo || v.accessori?.persiana?.attivo || v.accessori?.zanzariera?.attivo ? `<div style="font-size:10px;margin-top:4px;padding:4px;background:#f5f5ff;border:1px solid #ddd;border-radius:3px">
          <b>Accessori:</b> ${v.accessori?.tapparella?.attivo ? "⊞ Tapparella" : ""} ${v.accessori?.persiana?.attivo ? "🏠 Persiana" : ""} ${v.accessori?.zanzariera?.attivo ? "🦟 Zanzariera" : ""}
        </div>` : ""}
        ${fotoEntries.length > 0 ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">${fotoEntries.slice(0, 6).map(([, f]) => `<img src="${f.dataUrl}" style="width:70px;height:52px;object-fit:cover;border-radius:3px;border:1px solid #ccc" alt=""/>`).join("")}</div>` : ""}
        ${v.note ? `<div style="font-size:10px;margin-top:4px;padding:4px;background:#fff8e6;border:1px solid #f0e0b0;border-radius:3px"><I d={ICO.fileText} /> <b>Note:</b> ${v.note}</div>` : ""}
        ${v.difficoltaSalita ? `<div style="font-size:10px;margin-top:3px;color:#b45309"><I d={ICO.building} /> Accesso: ${v.difficoltaSalita}${v.mezzoSalita ? " — " + v.mezzoSalita : ""}</div>` : ""}
      </div>`;
    }).join("");

    const totalMq = vani.reduce((s, v) => {
      const m = v.misure || {};
      const l = m.lCentro || m.lAlto || m.lBasso || 0;
      const h = m.hCentro || m.hSx || m.hDx || 0;
      return s + (l > 0 && h > 0 ? (l / 1000) * (h / 1000) * (v.pezzi || 1) : 0);
    }, 0);

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Misure — ${c.code}</title>
    <style>
      body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:15px;font-size:11px}
      @media print{body{padding:5px} .no-print{display:none!important}}
      .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #333;padding-bottom:10px;margin-bottom:12px}
    </style></head><body>
    <div class="header">
      <div>
        ${az.logo ? `<img src="${az.logo}" style="max-height:50px;max-width:180px;margin-bottom:4px" alt=""/>` : ""}
        <div style="font-size:16px;font-weight:900;color:#333">${az.nome || "MASTRO"}</div>
        <div style="font-size:9px;color:#666">${az.indirizzo || ""} ${az.citta || ""} · ${az.tel || ""}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:20px;font-weight:900;color:#8B5CF6">SCHEDA MISURE</div>
        <div style="font-size:11px;color:#333;margin-top:2px"><b>${c.code}</b></div>
        <div style="font-size:10px;color:#666">${new Date().toLocaleDateString("it-IT")}</div>
      </div>
    </div>
    <div style="display:flex;gap:16px;margin-bottom:12px;padding:10px;background:#F2F1EC;border-radius:6px">
      <div style="flex:1"><div style="font-size:8px;color:#999;text-transform:uppercase">Cliente</div><div style="font-size:13px;font-weight:800">${c.cliente}</div></div>
      <div style="flex:1"><div style="font-size:8px;color:#999;text-transform:uppercase">Indirizzo</div><div style="font-size:11px">${c.indirizzo || "—"}</div></div>
      <div><div style="font-size:8px;color:#999;text-transform:uppercase">Vani</div><div style="font-size:13px;font-weight:800">${vani.length}</div></div>
      <div><div style="font-size:8px;color:#999;text-transform:uppercase">Tot. m²</div><div style="font-size:13px;font-weight:800">${totalMq.toFixed(2)}</div></div>
    </div>
    ${vaniHtml}
    <div style="margin-top:12px;padding:10px;background:#f9f9f9;border:1px solid #ddd;border-radius:6px;font-size:10px;color:#666;text-align:center">
      Documento generato da MASTRO ERP — ${new Date().toLocaleDateString("it-IT")} ${new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
      <br><b style="color:#333"><I d={ICO.alertTriangle} /> DOCUMENTO PER USO INTERNO / PRODUZIONE — NON VALIDO COME PREVENTIVO</b>
    </div>
    <div class="no-print" style="position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:2px solid #8B5CF6;padding:10px 16px;display:flex;gap:8px;z-index:999;box-shadow:0 -4px 20px rgba(0,0,0,0.15)">
      <button onclick="window.print()" style="flex:1;padding:10px;background:#8B5CF6;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer"><I d={ICO.printer} /> Stampa PDF</button>
      <button onclick="if(navigator.share){navigator.share({title:document.title,text:'Report misure',url:window.location.href}).catch(()=>{})}else{alert('Usa Stampa → Salva come PDF')}" style="flex:1;padding:10px;background:#1A9E73;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer"><I d={ICO.upload} /> Condividi</button>
      <button onclick="window.close()" style="padding:10px 16px;background:#DC4444;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">✕</button>
    </div>
    <button class="no-print" onclick="window.print()" style="position:fixed;bottom:70px;right:20px;padding:12px 24px;background:#8B5CF6;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(88,86,214,0.3)"><I d={ICO.printer} /> Stampa / Salva PDF</button>
    </body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
}

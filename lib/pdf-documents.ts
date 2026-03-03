// ═══════════════════════════════════════════════════════════
// MASTRO ERP — lib/pdf-documents.ts
// PDF/HTML generators estratti da MastroERP.tsx
// ═══════════════════════════════════════════════════════════

interface DocDeps {
  aziendaInfo: any;
  fattureDB?: any[];
  montaggiDB?: any[];
  calcolaVanoPrezzo?: (v: any, c: any) => number;
  getVaniAttivi?: (c: any) => any[];
}

export function generaFatturaPDF(fat: any, deps: DocDeps) {
  const { aziendaInfo, fattureDB, calcolaVanoPrezzo, getVaniAttivi } = deps;
  const aziendaDB = aziendaInfo;
    const az = aziendaDB;
    const fmt = (n) => typeof n === "number" ? n.toLocaleString("it-IT", { minimumFractionDigits: 2 }) : "0,00";
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Fattura ${fat.numero}/${fat.anno}</title>
    <style>
      body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px;font-size:12px;color:#333}
      @media print{.no-print{display:none!important}body{padding:10px}}
      table{width:100%;border-collapse:collapse} th,td{border:1px solid #ccc;padding:8px;text-align:left}
      th{background:#f5f8fc;font-size:10px;text-transform:uppercase;color:#666}
      .totale{font-size:16px;font-weight:900}
    </style></head><body>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
      <div>
        ${az.logo ? `<img src="${az.logo}" style="max-height:60px;max-width:200px;margin-bottom:6px" alt=""/>` : ""}
        <div style="font-size:18px;font-weight:900">${az.nome || "MASTRO"}</div>
        <div style="font-size:10px;color:#666">${az.indirizzo || ""} · ${az.citta || ""}</div>
        <div style="font-size:10px;color:#666">P.IVA: ${az.piva || "—"} · Tel: ${az.tel || "—"}</div>
        ${az.pec ? `<div style="font-size:10px;color:#666">PEC: ${az.pec}</div>` : ""}
      </div>
      <div style="text-align:right">
        <div style="font-size:24px;font-weight:900;color:#0D7C6B">FATTURA</div>
        <div style="font-size:14px;font-weight:700">N. ${fat.numero}/${fat.anno}</div>
        <div style="font-size:11px;color:#666">Data: ${fat.data}</div>
        <div style="font-size:10px;color:#999;margin-top:4px">${fat.tipo === "acconto" ? "ACCONTO" : fat.tipo === "saldo" ? "SALDO" : "FATTURA"}</div>
      </div>
    </div>
    <div style="background:#F2F1EC;padding:14px;border-radius:8px;margin-bottom:16px">
      <div style="font-size:9px;color:#999;text-transform:uppercase;margin-bottom:4px">Destinatario</div>
      <div style="font-size:14px;font-weight:800">${fat.cliente} ${fat.cognome}</div>
      <div style="font-size:11px">${fat.indirizzo || ""}</div>
      ${fat.cf ? `<div style="font-size:10px;color:#666">C.F.: ${fat.cf}</div>` : ""}
      ${fat.piva ? `<div style="font-size:10px;color:#666">P.IVA: ${fat.piva}</div>` : ""}
      ${fat.sdi ? `<div style="font-size:10px;color:#666">SDI: ${fat.sdi}</div>` : ""}
      ${fat.pec ? `<div style="font-size:10px;color:#666">PEC: ${fat.pec}</div>` : ""}
      <div style="font-size:10px;color:#666;margin-top:4px">Rif. commessa: ${fat.cmCode}</div>
    </div>
    <table>
      <thead><tr><th>Descrizione</th><th style="width:80px;text-align:right">Imponibile</th><th style="width:60px;text-align:right">IVA %</th><th style="width:80px;text-align:right">IVA</th><th style="width:90px;text-align:right">Totale</th></tr></thead>
      <tbody>
        <tr>
          <td>Fornitura e posa serramenti${fat.tipo === "acconto" ? " — Acconto 50%" : fat.tipo === "saldo" ? " — Saldo" : ""}<br><span style="font-size:10px;color:#666">${fat.note || ""}</span></td>
          <td style="text-align:right;font-weight:700">&euro; ${fmt(fat.imponibile)}</td>
          <td style="text-align:right">${fat.iva}%</td>
          <td style="text-align:right">&euro; ${fmt(fat.ivaAmt)}</td>
          <td style="text-align:right;font-weight:900;font-size:14px">&euro; ${fmt(fat.importo)}</td>
        </tr>
      </tbody>
    </table>
    <div style="text-align:right;margin-top:12px;padding:12px;background:#f0f8ff;border-radius:8px">
      <div style="font-size:10px;color:#666">Imponibile: &euro; ${fmt(fat.imponibile)}</div>
      <div style="font-size:10px;color:#666">IVA ${fat.iva}%: &euro; ${fmt(fat.ivaAmt)}</div>
      <div class="totale" style="margin-top:6px;color:#0D7C6B">TOTALE: &euro; ${fmt(fat.importo)}</div>
    </div>
    <div style="margin-top:16px;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:10px;color:#666">
      <b>Modalità pagamento:</b> Bonifico bancario<br>
      <b>IBAN:</b> ${az.iban || "________________"}<br>
      <b>Scadenza:</b> ${fat.scadenza || "30 giorni data fattura"}<br>
      ${fat.note ? `<b>Note:</b> ${fat.note}` : ""}
    </div>
    <div style="margin-top:20px;text-align:center;font-size:9px;color:#999">Documento generato da MASTRO ERP</div>
    <div class="no-print" style="position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:2px solid #0D7C6B;padding:10px 16px;display:flex;gap:8px;z-index:999;box-shadow:0 -4px 20px rgba(0,0,0,0.15)">
      <button onclick="window.print()" style="flex:1;padding:10px;background:#0D7C6B;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer"><I d={ICO.printer} /> Stampa PDF</button>
      <button onclick="if(navigator.share){navigator.share({title:document.title,text:'Ordine fornitore',url:window.location.href}).catch(()=>{})}else{alert('Usa Stampa → Salva come PDF')}" style="flex:1;padding:10px;background:#1A9E73;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer"><I d={ICO.upload} /> Condividi</button>
      <button onclick="window.close()" style="padding:10px 16px;background:#DC4444;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">✕</button>
    </div>
    <button class="no-print" onclick="window.print()" style="position:fixed;bottom:70px;right:20px;padding:12px 24px;background:#0D7C6B;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer"><I d={ICO.printer} /> Stampa / Salva PDF</button>
    </body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    window.open(URL.createObjectURL(blob), "_blank");
  };

  // === WHATSAPP / EMAIL HELPERS ===
  const inviaWhatsApp = (c, tipo: "preventivo" | "conferma" | "stato") => {
    const tel = (c.telefono || "").replace(/\D/g, "");
    const msgs = {
      preventivo: `Gentile ${c.cliente}, le invio in allegato il preventivo per la fornitura serramenti. Rif: ${c.code}. Resto a disposizione per qualsiasi chiarimento.`,
      conferma: `Gentile ${c.cliente}, confermiamo la ricezione del suo ordine ${c.code}. Provvederemo a ordinare il materiale. La terremo aggiornata sullo stato di avanzamento.`,
      stato: `Gentile ${c.cliente}, aggiornamento sul suo ordine ${c.code}: ${c.trackingStato === "ordinato" ? "il materiale è stato ordinato" : c.trackingStato === "produzione" ? "il materiale è in produzione" : c.trackingStato === "pronto" ? "il materiale è pronto per la consegna" : c.trackingStato === "consegnato" ? "il materiale è stato consegnato" : c.trackingStato === "montato" ? "il montaggio è completato" : "in lavorazione"}.${c.dataPrevConsegna ? " Consegna prevista: " + c.dataPrevConsegna : ""}`,
    };
    const msg = encodeURIComponent(msgs[tipo] || "");
    window.open(`https://wa.me/${tel.startsWith("39") ? tel : "39" + tel}?text=${msg}`, "_blank");
  };

  const inviaEmail = (c, tipo: "preventivo" | "conferma" | "montaggio" | "saldo" | "generico") => {
    const az = aziendaDB;
    const azNome = az.ragione || az.nome || "Walter Cozza Serramenti";
    const azTel = az.telefono || "";
    const azEmail = az.email || "";
    const firma = `\nCordiali saluti,\n${azNome}${azTel ? "\nTel. " + azTel : ""}${azEmail ? "\n" + azEmail : ""}`;
    const vani = getVaniAttivi(c);
    const totale = vani.reduce((s, v) => s + calcolaVanoPrezzo(v, c), 0) + (c.vociLibere || []).reduce((s, vl) => s + ((vl.importo||0)*(vl.qta||1)), 0);
    const ivaP = parseFloat(c.ivaPerc || 10);
    const totIva = totale * (1 + ivaP / 100);
    const fmt = (n) => typeof n === "number" ? n.toLocaleString("it-IT", { minimumFractionDigits: 2 }) : "0,00";
    
    const templates = {
      preventivo: {
        oggetto: `Preventivo ${c.code} — ${azNome}`,
        corpo: `Gentile ${c.cliente} ${c.cognome || ""},\n\nle trasmetto il preventivo per la fornitura e posa in opera dei serramenti per l'immobile in ${c.indirizzo || "—"}.\n\n📋 Rif. commessa: ${c.code}\n📦 Vani: ${vani.length}\n${c.sistema ? "🏭 Sistema: " + c.sistema + "\n" : ""}💰 Importo: €${fmt(totale)} + IVA ${ivaP}% = €${fmt(totIva)}\n${c.praticaFiscale ? "📑 Agevolazione: " + c.praticaFiscale + "\n" : ""}\nIl preventivo include fornitura, posa in opera, smaltimento vecchi infissi e rilascio documentazione (DoP, CE, manuale).\n\nResto a disposizione per qualsiasi chiarimento.${firma}`
      },
      conferma: {
        oggetto: `Conferma ordine ${c.code} — ${azNome}`,
        corpo: `Gentile ${c.cliente} ${c.cognome || ""},\n\ncon la presente le confermiamo la ricezione dell'ordine per la commessa ${c.code}.\n\n✅ Materiale ordinato al fornitore\n⏱ Tempi di consegna stimati: 4-6 settimane\n📍 Cantiere: ${c.indirizzo || "—"}\n\nLa terremo aggiornata sullo stato di avanzamento della produzione.\n\nPer qualsiasi necessità non esiti a contattarci.${firma}`
      },
      montaggio: {
        oggetto: `Programmazione montaggio ${c.code} — ${azNome}`,
        corpo: `Gentile ${c.cliente} ${c.cognome || ""},\n\nsiamo lieti di comunicarle che il materiale per la commessa ${c.code} è arrivato.\n\n🔧 Montaggio previsto: [INSERIRE DATA]\n📍 Indirizzo: ${c.indirizzo || "—"}\n⏱ Durata stimata: ${vani.length <= 3 ? "1 giorno" : vani.length <= 6 ? "2 giorni" : "3+ giorni"}\n👷 Squadra: [NOME SQUADRA]\n\n📌 Note per il giorno del montaggio:\n- Assicurarsi che i locali siano accessibili\n- Spostare eventuali mobili vicino alle finestre\n- È possibile che si verifichi polvere durante lo smontaggio\n\nLa preghiamo di confermare la data rispondendo a questa mail.${firma}`
      },
      saldo: {
        oggetto: `Completamento lavori e saldo ${c.code} — ${azNome}`,
        corpo: `Gentile ${c.cliente} ${c.cognome || ""},\n\ncon la presente le comunichiamo che i lavori relativi alla commessa ${c.code} sono stati completati con successo.\n\n✅ Fornitura e posa completata\n📦 Vani installati: ${vani.length}\n📍 Cantiere: ${c.indirizzo || "—"}\n\n💶 Importo totale: €${fmt(totIva)} (IVA ${ivaP}% inclusa)\n${(() => { const inc = fattureDB.filter(f => f.cmId === c.id && f.pagata).reduce((s,f)=>s+(f.importo||0),0); return inc > 0 ? `💳 Già versato: €${fmt(inc)}\n📄 Saldo dovuto: €${fmt(totIva - inc)}\n` : ""; })()}\n📎 In allegato:\n- Fattura di saldo\n- Dichiarazione di prestazione (DoP)\n- Certificazione CE\n- Manuale d'uso e manutenzione\n\nModalità di pagamento: Bonifico bancario\nIBAN: ${az.iban || "[IBAN]"}\n\nLa ringraziamo per la fiducia.${firma}`
      },
      generico: {
        oggetto: `Commessa ${c.code} — ${azNome}`,
        corpo: `Gentile ${c.cliente} ${c.cognome || ""},\n\n[Scrivi qui il messaggio]\n\nRif. commessa: ${c.code}\nCantiere: ${c.indirizzo || "—"}${firma}`
      }
    };
    const t = templates[tipo] || templates.generico;
    setEmailDest(c.email || "");
    setEmailOggetto(t.oggetto);
    setEmailCorpo(t.corpo);
    setShowEmailComposer({ cm: c, tipo });
  };

  // =============================================
  // === ORDINI FORNITORE — MODULO COMPLETO ===
  // =============================================

  const [ordineDetail, setOrdineDetail] = useState<string | null>(null); // id ordine aperto
  const [extractingPDF, setExtractingPDF] = useState(false); // loading AI extraction
  const [showInboxDoc, setShowInboxDoc] = useState(false); // global document inbox
  const [inboxResult, setInboxResult] = useState<any>(null); // extracted data from inbox



  // Crea nuovo ordine fornitore da commessa

export function generaOrdinePDF(ord: any, deps: DocDeps) {
  const { aziendaInfo } = deps;
  const aziendaDB = aziendaInfo;
    const az = aziendaDB;
    const fmt = (n) => typeof n === "number" ? n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0,00";
    const imponibile = ord.totale;
    const ivaVal = imponibile * ord.iva / 100;
    const scontoPerc = ord.sconto || 0;

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#1a1a1c;padding:20px;max-width:800px;margin:0 auto}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:16px;border-bottom:2px solid #1a1a1c}
      .title{font-size:20px;font-weight:800;letter-spacing:-0.3px}
      table{width:100%;border-collapse:collapse;margin:16px 0}
      th{background:#F2F1EC;padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #ddd}
      td{padding:8px 10px;border-bottom:1px solid #eee}
      .total-row td{font-weight:700;border-top:2px solid #1a1a1c;border-bottom:none}
      .box{background:#f9f9fb;border-radius:8px;padding:14px;margin-bottom:12px}
      .sign-area{margin-top:40px;display:flex;justify-content:space-between}
      .sign-box{width:45%;border-top:1px solid #aaa;padding-top:8px;text-align:center;font-size:10px;color:#888}
      @media print{body{padding:10px}}
    </style></head><body>

    <div class="header">
      <div>
        ${az.logo ? `<img src="${az.logo}" style="max-height:45px;margin-bottom:6px" /><br>` : ""}
        <div class="title">${az.nome || "MASTRO"}</div>
        <div style="font-size:10px;color:#666;margin-top:2px">${az.indirizzo || ""}<br>${az.tel || ""} · ${az.email || ""}<br>${az.piva ? "P.IVA " + az.piva : ""}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:16px;font-weight:800;color:#0D7C6B">ORDINE FORNITORE</div>
        <div style="font-size:12px;font-weight:700">N. ${ord.numero}/${ord.anno}</div>
        <div style="font-size:10px;color:#666">Data: ${new Date(ord.dataOrdine).toLocaleDateString("it-IT")}</div>
        <div style="font-size:10px;color:#666">Rif. Commessa: ${ord.cmCode}</div>
      </div>
    </div>

    <div style="display:flex;gap:16px;margin-bottom:16px">
      <div class="box" style="flex:1">
        <div style="font-size:9px;text-transform:uppercase;color:#888;letter-spacing:1px;margin-bottom:6px">Fornitore</div>
        <div style="font-size:14px;font-weight:700">${ord.fornitore.nome || "—"}</div>
        ${ord.fornitore.referente ? `<div>Att.ne: ${ord.fornitore.referente}</div>` : ""}
        ${ord.fornitore.email ? `<div>${ord.fornitore.email}</div>` : ""}
        ${ord.fornitore.tel ? `<div>${ord.fornitore.tel}</div>` : ""}
        ${ord.fornitore.piva ? `<div>P.IVA: ${ord.fornitore.piva}</div>` : ""}
      </div>
      <div class="box" style="flex:1">
        <div style="font-size:9px;text-transform:uppercase;color:#888;letter-spacing:1px;margin-bottom:6px">Consegna</div>
        <div style="font-size:12px;font-weight:600">${ord.consegna.luogo || "Da definire"}</div>
        ${ord.consegna.prevista ? `<div><I d={ICO.calendar} /> Prevista: ${new Date(ord.consegna.prevista).toLocaleDateString("it-IT")}</div>` : ""}
        ${ord.consegna.settimane ? `<div><I d={ICO.clock} /> Produzione: ${ord.consegna.settimane} settimane</div>` : ""}
        <div style="margin-top:4px;font-size:10px;color:#888">Pagamento: ${ord.pagamento.termini === "anticipato" ? "Anticipato" : ord.pagamento.termini === "30gg_fm" ? "30gg FM" : ord.pagamento.termini === "60gg_fm" ? "60gg FM" : ord.pagamento.termini === "90gg_fm" ? "90gg FM" : "A ricevimento merce"}</div>
      </div>
    </div>

    <div style="font-size:12px;font-weight:700;margin-bottom:4px">Cliente finale: ${ord.cliente}</div>

    <table>
      <tr><th style="width:5%">#</th><th style="width:40%">Descrizione</th><th style="width:12%">Misure</th><th style="width:8%">Qtà</th><th style="width:15%">Prezzo Unit.</th><th style="width:15%">Totale</th><th>Note</th></tr>
      ${ord.righe.map((r, i) => `<tr>
        <td>${i + 1}</td>
        <td style="font-weight:600">${r.desc}</td>
        <td>${r.misure}</td>
        <td style="text-align:center">${r.qta}</td>
        <td style="text-align:right">&euro;${fmt(r.prezzoUnit)}</td>
        <td style="text-align:right">&euro;${fmt(r.qta * r.prezzoUnit)}</td>
        <td style="font-size:9px;color:#666">${r.note || ""}</td>
      </tr>`).join("")}
      ${scontoPerc > 0 ? `<tr><td colspan="5" style="text-align:right;font-weight:600">Sconto ${scontoPerc}%</td><td style="text-align:right;color:#DC4444">-&euro;${fmt(ord.righe.reduce((s, r) => s + r.qta * r.prezzoUnit, 0) * scontoPerc / 100)}</td><td></td></tr>` : ""}
      <tr><td colspan="5" style="text-align:right">Imponibile</td><td style="text-align:right">&euro;${fmt(imponibile)}</td><td></td></tr>
      <tr><td colspan="5" style="text-align:right">IVA ${ord.iva}%</td><td style="text-align:right">&euro;${fmt(ivaVal)}</td><td></td></tr>
      <tr class="total-row"><td colspan="5" style="text-align:right;font-size:13px">TOTALE</td><td style="text-align:right;font-size:13px">&euro;${fmt(ord.totaleIva)}</td><td></td></tr>
    </table>

    ${ord.note ? `<div class="box"><div style="font-size:9px;text-transform:uppercase;color:#888;margin-bottom:4px">Note</div>${ord.note}</div>` : ""}

    <div class="sign-area">
      <div class="sign-box">Timbro e firma ordinante<br><br><br></div>
      <div class="sign-box">Per accettazione fornitore<br><br><br></div>
    </div>

    <div style="text-align:center;font-size:8px;color:#ccc;margin-top:30px">Generato con MASTRO · ${new Date().toLocaleDateString("it-IT")}</div>
    </body></html>`;

    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  };

  // Genera PDF conferma firmata (per reinvio al fornitore)

export function generaConfermaFirmataPDF(ord: any, deps: DocDeps) {
  const { aziendaInfo } = deps;
  const aziendaDB = aziendaInfo;
    const az = aziendaDB;
    const fmt = (n) => typeof n === "number" ? n.toLocaleString("it-IT", { minimumFractionDigits: 2 }) : "0,00";
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#1a1a1c;padding:30px;max-width:800px;margin:0 auto}
      .stamp{border:3px solid #1A9E73;border-radius:12px;padding:16px;margin:20px 0;text-align:center}
    </style></head><body>
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:18px;font-weight:800;color:#1A9E73">✅ CONFERMA ORDINE APPROVATA</div>
      <div style="font-size:12px;color:#666;margin-top:4px">Ordine N. ${ord.numero}/${ord.anno} — ${ord.fornitore.nome}</div>
    </div>

    <div style="background:#f9f9fb;border-radius:8px;padding:14px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between">
        <div><b>Committente:</b> ${az.nome || "MASTRO"}<br>${az.indirizzo || ""}<br>${az.piva ? "P.IVA " + az.piva : ""}</div>
        <div style="text-align:right"><b>Fornitore:</b> ${ord.fornitore.nome}<br>${ord.fornitore.email || ""}<br>${ord.fornitore.piva ? "P.IVA " + ord.fornitore.piva : ""}</div>
      </div>
    </div>

    <div style="margin:14px 0"><b>Rif. Commessa:</b> ${ord.cmCode} — ${ord.cliente}</div>

    <table style="width:100%;border-collapse:collapse">
      <tr><th style="background:#1A9E7320;padding:8px;text-align:left;border-bottom:2px solid #1A9E73">#</th><th style="background:#1A9E7320;padding:8px;text-align:left;border-bottom:2px solid #1A9E73">Descrizione</th><th style="background:#1A9E7320;padding:8px;border-bottom:2px solid #1A9E73">Misure</th><th style="background:#1A9E7320;padding:8px;border-bottom:2px solid #1A9E73">Qtà</th><th style="background:#1A9E7320;padding:8px;text-align:right;border-bottom:2px solid #1A9E73">Prezzo</th></tr>
      ${ord.righe.map((r, i) => `<tr><td style="padding:6px;border-bottom:1px solid #eee">${i + 1}</td><td style="padding:6px;border-bottom:1px solid #eee">${r.desc}</td><td style="padding:6px;border-bottom:1px solid #eee">${r.misure}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:center">${r.qta}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:right">&euro;${fmt(r.qta * r.prezzoUnit)}</td></tr>`).join("")}
    </table>
    <div style="text-align:right;font-size:14px;font-weight:800;margin-top:8px">TOTALE: &euro;${fmt(ord.totaleIva)}</div>

    <div class="stamp">
      <div style="font-size:14px;font-weight:800;color:#1A9E73">CONFERMATO E APPROVATO</div>
      <div style="font-size:11px;color:#666;margin-top:4px">Data conferma: ${ord.conferma.dataFirma ? new Date(ord.conferma.dataFirma).toLocaleDateString("it-IT") : new Date().toLocaleDateString("it-IT")}</div>
      <div style="font-size:11px;color:#666">Consegna prevista: ${ord.consegna.prevista ? new Date(ord.consegna.prevista).toLocaleDateString("it-IT") : "Da concordare"}</div>
      <div style="font-size:11px;color:#666">Pagamento: ${ord.pagamento.termini === "anticipato" ? "Anticipato" : ord.pagamento.termini.replace("_", " ").toUpperCase()}</div>
      ${ord.conferma.differenze ? `<div style="margin-top:8px;font-size:10px;color:#E8A020;font-weight:600"><I d={ICO.alertTriangle} /> Note: ${ord.conferma.differenze}</div>` : ""}
    </div>

    <div style="display:flex;justify-content:space-between;margin-top:40px">
      <div style="width:45%;border-top:1px solid #aaa;padding-top:8px;text-align:center;font-size:10px;color:#888">Firma ${az.nome || "committente"}<br>${ord.conferma.dataFirma || ""}</div>
      <div style="width:45%;border-top:1px solid #aaa;padding-top:8px;text-align:center;font-size:10px;color:#888">Per accettazione fornitore</div>
    </div>
    </body></html>`;

    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  };

  // Invio ordine/conferma via email/whatsapp

export function generaXmlSDI(fat: any, deps: DocDeps) {
  const { aziendaInfo } = deps;
  const aziendaDB = aziendaInfo;
    const az = aziendaDB;
    const progressivo = String(fat.numero).padStart(5, "0") + "_" + fat.anno;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<p:FatturaElettronica xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2" versione="FPR12">
  <FatturaElettronicaHeader>
    <DatiTrasmissione>
      <IdTrasmittente><IdPaese>IT</IdPaese><IdCodice>` + (az.piva || "00000000000") + `</IdCodice></IdTrasmittente>
      <ProgressivoInvio>` + progressivo + `</ProgressivoInvio>
      <FormatoTrasmissione>FPR12</FormatoTrasmissione>
      <CodiceDestinatario>` + (fat.sdi || "0000000") + `</CodiceDestinatario>
    </DatiTrasmissione>
    <CedentePrestatore>
      <DatiAnagrafici>
        <IdFiscaleIVA><IdPaese>IT</IdPaese><IdCodice>` + (az.piva || "") + `</IdCodice></IdFiscaleIVA>
        <Anagrafica><Denominazione>` + (az.ragioneSociale || "MASTRO SRL") + `</Denominazione></Anagrafica>
        <RegimeFiscale>RF01</RegimeFiscale>
      </DatiAnagrafici>
    </CedentePrestatore>
    <CessionarioCommittente>
      <DatiAnagrafici>
        <Anagrafica><Denominazione>` + fat.cliente + ` ` + (fat.cognome || "") + `</Denominazione></Anagrafica>
      </DatiAnagrafici>
    </CessionarioCommittente>
  </FatturaElettronicaHeader>
  <FatturaElettronicaBody>
    <DatiGenerali>
      <DatiGeneraliDocumento>
        <TipoDocumento>TD01</TipoDocumento>
        <Divisa>EUR</Divisa>
        <Data>` + (fat.dataISO || new Date().toISOString().split("T")[0]) + `</Data>
        <Numero>` + fat.numero + `/` + fat.anno + `</Numero>
        <ImportoTotaleDocumento>` + fat.importo.toFixed(2) + `</ImportoTotaleDocumento>
      </DatiGeneraliDocumento>
    </DatiGenerali>
    <DatiBeniServizi>
      <DettaglioLinee>
        <NumeroLinea>1</NumeroLinea>
        <Descrizione>Fornitura e posa serramenti (Rif. ` + fat.cmCode + `)</Descrizione>
        <Quantita>1.00</Quantita>
        <PrezzoUnitario>` + fat.imponibile.toFixed(2) + `</PrezzoUnitario>
        <PrezzoTotale>` + fat.imponibile.toFixed(2) + `</PrezzoTotale>
        <AliquotaIVA>` + fat.iva.toFixed(2) + `</AliquotaIVA>
      </DettaglioLinee>
    </DatiBeniServizi>
  </FatturaElettronicaBody>
</p:FatturaElettronica>`;
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = "IT" + (az.piva || "00000000000") + "_" + progressivo + ".xml";
    a.click(); URL.revokeObjectURL(url);
  };


  // === ONBOARDING MODAL "COSA VENDI?" ===
  const renderOnboarding = () => <OnboardingPanel />;


export function generaTrackingCliente(c: any, deps: DocDeps) {
  const { aziendaInfo, fattureDB, montaggiDB } = deps;
  const aziendaDB = aziendaInfo;
    const az = aziendaDB;
    const TRACK_SVG = {
      package: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
      factory: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20V8l6 4V8l6 4V8l6 4v12H2z"/><path d="M2 20h20"/></svg>',
      checkCircle: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      truck: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
      hammer: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0a2.12 2.12 0 010-3L12 9"/><path d="M17.64 15L22 10.64"/><path d="M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25V6.5L14.5 2.23a.5.5 0 00-.8.14l-1.02 2.45a2 2 0 00.44 2.17l5.08 4.56"/></svg>',
    };
    const trackSteps = [
      { id: "ordinato", label: "Ordinato", icon: "package", desc: "Il materiale è stato ordinato al fornitore" },
      { id: "produzione", label: "In Produzione", icon: "factory", desc: "I serramenti sono in fase di produzione" },
      { id: "pronto", label: "Pronto", icon: "checkCircle", desc: "Il materiale è pronto per la consegna" },
      { id: "consegnato", label: "Consegnato", icon: "truck", desc: "Il materiale è stato consegnato" },
      { id: "montato", label: "Montato", icon: "hammer", desc: "L'installazione è completata" },
    ];
    const curIdx = trackSteps.findIndex(s => s.id === c.trackingStato);
    const fatture = fattureDB.filter(f => f.cmId === c.id);
    const totFat = fatture.reduce((s, f) => s + f.importo, 0);
    const totPag = fatture.filter(f => f.pagata).reduce((s, f) => s + f.importo, 0);
    const montaggio = montaggiDB.find(m => m.cmId === c.id && m.stato !== "completato");
    const fmt = (n) => typeof n === "number" ? n.toLocaleString("it-IT", { minimumFractionDigits: 2 }) : "0,00";

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Tracking Ordine ${c.code} — ${az.nome || "MASTRO"}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F2F1EC;color:#1a1a1c;padding:16px;max-width:480px;margin:0 auto}
      .card{background:#fff;border-radius:16px;padding:20px;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,0.06)}
      .step{display:flex;align-items:flex-start;gap:12px;padding:14px 0;border-bottom:1px solid #f0f0f2}
      .step:last-child{border-bottom:none}
      .dot{width:36px;height:36px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
      .active .dot{background:#0D7C6B20} .done .dot{background:#1A9E7320} .pending .dot{background:#f0f0f2}
      .line{width:2px;height:20px;margin:0 17px;background:#e0e0e2}
      .done .line{background:#1A9E73} .active .line{background:#0D7C6B}
      .badge{display:inline-block;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700}
      h2{font-size:20px;font-weight:800;letter-spacing:-0.3px}
    </style></head><body>
    <div class="card" style="text-align:center">
      ${az.logo ? `<img src="${az.logo}" style="max-height:50px;max-width:180px;margin-bottom:8px" alt="">` : ""}
      <h2>${az.nome || "MASTRO"}</h2>
      <div style="font-size:12px;color:#8e8e93;margin-top:4px">${az.tel || ""} · ${az.email || ""}</div>
    </div>

    <div class="card">
      <div style="font-size:11px;color:#8e8e93;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Ordine</div>
      <h2>${c.code}</h2>
      <div style="font-size:13px;color:#8e8e93;margin-top:2px">${c.cliente} ${c.cognome || ""}</div>
      <div style="font-size:12px;color:#8e8e93">${c.indirizzo || ""}</div>
      ${c.dataPrevConsegna ? `<div style="margin-top:10px;padding:8px 12px;background:#0D7C6B10;border-radius:8px;font-size:12px;color:#0D7C6B;font-weight:600"><I d={ICO.calendar} /> Consegna prevista: ${new Date(c.dataPrevConsegna).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>` : ""}
      ${montaggio?.data ? `<div style="margin-top:6px;padding:8px 12px;background:#30b0c710;border-radius:8px;font-size:12px;color:#30b0c7;font-weight:600"><I d={ICO.wrench} /> Montaggio programmato: ${new Date(montaggio.data).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })} ore ${montaggio.oraInizio || "08:00"}</div>` : ""}
    </div>

    <div class="card">
      <div style="font-size:11px;color:#8e8e93;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">Stato avanzamento</div>
      ${trackSteps.map((st, i) => {
        const isDone = i < curIdx;
        const isActive = i === curIdx;
        const cls = isDone ? "done" : isActive ? "active" : "pending";
        return `<div class="step ${cls}">
          <div>
            <div class="dot">${TRACK_SVG[st.icon] || st.icon}</div>
            ${i < trackSteps.length - 1 ? `<div class="line"></div>` : ""}
          </div>
          <div style="padding-top:6px">
            <div style="font-size:14px;font-weight:700;color:${isDone ? "#1A9E73" : isActive ? "#0D7C6B" : "#c7c7cc"}">${st.label}</div>
            <div style="font-size:11px;color:#8e8e93;margin-top:2px">${st.desc}</div>
            ${isDone && c["tracking_" + st.id + "_data"] ? `<div style="font-size:10px;color:#1A9E73;margin-top:2px">✅ ${c["tracking_" + st.id + "_data"]}</div>` : ""}
            ${isActive ? `<span class="badge" style="background:#0D7C6B20;color:#0D7C6B;margin-top:4px">In corso</span>` : ""}
          </div>
        </div>`;
      }).join("")}
    </div>

    ${fatture.length > 0 ? `<div class="card">
      <div style="font-size:11px;color:#8e8e93;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Situazione pagamenti</div>
      ${fatture.map(f => `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f0f0f2">
        <div>
          <div style="font-size:12px;font-weight:600">${f.tipo === "acconto" ? "Acconto" : f.tipo === "saldo" ? "Saldo" : "Fattura"} N.${f.numero}/${f.anno}</div>
          <div style="font-size:10px;color:#8e8e93">${f.data}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:14px;font-weight:800">&euro;${fmt(f.importo)}</div>
          <div style="font-size:10px;color:${f.pagata ? "#1A9E73" : "#DC4444"};font-weight:600">${f.pagata ? "✅ Pagata" : "🕐 Da pagare"}</div>
        </div>
      </div>`).join("")}
      <div style="display:flex;justify-content:space-between;padding:10px 0 0;margin-top:4px">
        <span style="font-size:12px;color:#8e8e93">Totale: &euro;${fmt(totFat)}</span>
        <span style="font-size:12px;font-weight:700;color:${totPag >= totFat ? "#1A9E73" : "#E8A020"}">${totPag >= totFat ? "✅ Saldato" : `Da pagare: €${fmt(totFat - totPag)}`}</span>
      </div>
    </div>` : ""}

    <div style="text-align:center;font-size:10px;color:#c7c7cc;margin-top:16px;padding:12px">
      Pagina generata da MASTRO · ${new Date().toLocaleDateString("it-IT")}
    </div>
    </body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    return url;
  };

  // ═══ FATTURAZIONE ELETTRONICA XML SDI ═══


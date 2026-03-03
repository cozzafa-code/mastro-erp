// ═══════════════════════════════════════════════════════════
// MASTRO ERP — lib/pdf-preventivo.ts
// Generazione PDF Preventivo (481 righe estratte da MastroERP.tsx)
// ═══════════════════════════════════════════════════════════

import { tipoToMinCat } from "../components/mastro-constants";

interface PrevDeps {
  sistemiDB: any[];
  vetriDB: any[];
  coprifiliDB: any[];
  lamiereDB: any[];
  aziendaInfo: any;
  getVaniAttivi: (c: any) => any[];
}

export function generaPreventivoPDF(c: any, deps: PrevDeps) {
  const { sistemiDB, vetriDB, coprifiliDB, lamiereDB, aziendaInfo, getVaniAttivi } = deps;
    // Grid price lookup: find smallest grid cell where L>=vanoL and H>=vanoH (ceiling approach like real suppliers)
    const grigliaLookup = (griglia: any[], lmm: number, hmm: number): number | null => {
      if (!griglia || griglia.length === 0) return null;
      // Sort by L then H
      const sorted = [...griglia].sort((a, b) => a.l - b.l || a.h - b.h);
      // Find exact match first
      const exact = sorted.find(g => g.l === lmm && g.h === hmm);
      if (exact) return exact.prezzo;
      // Find ceiling: smallest grid cell that covers the window
      const ceiling = sorted.find(g => g.l >= lmm && g.h >= hmm);
      if (ceiling) return ceiling.prezzo;
      // If window is larger than any grid entry, find the largest grid entry
      const largest = sorted[sorted.length - 1];
      if (largest) return largest.prezzo;
      return null;
    };

    const calcolaVanoPDF = (v) => {
      const m = v.misure||{};
      const lc=(m.lCentro||0)/1000, hc=(m.hCentro||0)/1000;
      const lmm=m.lCentro||0, hmm=m.hCentro||0;
      const mq=lc*hc, perim=2*(lc+hc);
      const sysRec = sistemiDB.find(s=>(s.marca+" "+s.sistema)===v.sistema||s.sistema===v.sistema);
      // Get minimo mq for this tipologia
      const minCat = tipoToMinCat(v.tipo || "F1A");
      const minimoMq = sysRec?.minimiMq?.[minCat] || 0;
      const mqCalc = (minimoMq > 0 && mq > 0 && mq < minimoMq) ? minimoMq : mq;
      // Price: try grid first, fallback to €/mq with minimo applied
      let basePrezzoSer = 0;
      const gridPrice = sysRec?.griglia ? grigliaLookup(sysRec.griglia, lmm, hmm) : null;
      if (gridPrice !== null) {
        basePrezzoSer = gridPrice;
      } else {
        basePrezzoSer = mqCalc * parseFloat(sysRec?.prezzoMq||sysRec?.euroMq||c.prezzoMq||350);
      }
      let tot = basePrezzoSer;
      const vetroRec = vetriDB.find(g=>g.code===v.vetro||g.nome===v.vetro);
      if(vetroRec?.prezzoMq) tot += mq * parseFloat(vetroRec.prezzoMq);
      const copRec = coprifiliDB.find(cp=>cp.cod===v.coprifilo);
      if(copRec?.prezzoMl) tot += perim * parseFloat(copRec.prezzoMl);
      const lamRec = lamiereDB.find(l=>l.cod===v.lamiera);
      if(lamRec?.prezzoMl) tot += lc * parseFloat(lamRec.prezzoMl);
      const tapp=v.accessori?.tapparella; if(tapp?.attivo&&c.prezzoTapparella){const tmq=((tapp.l||m.lCentro||0)/1000)*((tapp.h||m.hCentro||0)/1000);tot+=tmq*parseFloat(c.prezzoTapparella);}
      const pers=v.accessori?.persiana; if(pers?.attivo&&c.prezzoPersiana){const pmq=((pers.l||m.lCentro||0)/1000)*((pers.h||m.hCentro||0)/1000);tot+=pmq*parseFloat(c.prezzoPersiana);}
      const zanz=v.accessori?.zanzariera; if(zanz?.attivo&&c.prezzoZanzariera){const zmq=((zanz.l||m.lCentro||0)/1000)*((zanz.h||m.hCentro||0)/1000);tot+=zmq*parseFloat(c.prezzoZanzariera);}
      // Voci libere
      if (v.vociLibere?.length > 0) v.vociLibere.forEach(vl => { tot += (vl.prezzo || 0) * (vl.qta || 1); });
      return { tot, mq, perim, sysRec, vetroRec, copRec, lamRec };
    };
    const vaniPDF = getVaniAttivi(c);
    const totale = vaniPDF.reduce((s,v)=>s+calcolaVanoPDF(v).tot, 0) + (c.vociLibere || []).reduce((s, vl) => s + ((vl.importo||0)*(vl.qta||1)), 0);
    const sconto = parseFloat(c.scontoPerc||c.sconto||0);
    const scontoVal = totale * sconto / 100;
    const imponibile = totale - scontoVal;
    const ivaPerc = parseFloat(c.ivaPerc||10);
    const iva = imponibile * ivaPerc / 100;
    const totIva = imponibile + iva;
    const oggi = new Date().toLocaleDateString("it-IT");
    const totalMq = vaniPDF.reduce((s,v)=>s+calcolaVanoPDF(v).mq, 0);
    const az = aziendaInfo;
    const fmt = (n: number) => n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const TIPI_LABEL: Record<string,string> = { F1A:"Finestra 1 anta", F2A:"Finestra 2 ante", PF1A:"Portafinestra 1 anta", PF2A:"Portafinestra 2 ante", SC2A:"Scorrevole 2 ante", SC4A:"Scorrevole 4 ante", VAS:"Vasistas", FIS:"Fisso", PB:"Porta blindata", PI:"Porta interna", PORTONE:"Portone", TDBR:"Tenda a bracci", TDCAD:"Tenda a caduta", TDCAP:"Cappottina", TDVER:"Tenda verticale", TDRUL:"Tenda a rullo", TDPERG:"Pergola bioclimatica", TDZIP:"Tenda ZIP/Screen", TDVELA:"Vela ombreggiante", VENEZIA:"Veneziana", TDS:"Tenda da sole", TDR:"Tenda a rullo", TVE:"Tenda veranda", PBC:"Pergola bioclimatica", PGA:"Pergola addossata", PGF:"Pergola freestanding", TCA:"Tenda a cappottina", TCB:"Tenda a bracci", ZTE:"Zanzariera tenda" };
    const TIPI_OUTDOOR = ["TDBR","TDCAD","TDCAP","TDVER","TDRUL","TDPERG","TDZIP","TDVELA","VENEZIA","TDS","TDR","TVE","PBC","PGA","PGF","TCA","TCB","ZTE"];
    const isOutdoor = (tipo: string) => TIPI_OUTDOOR.includes(tipo);

    // SVG technical drawing per tipo - IMPROVED
    const drawSVG = (tipo: string, w: number, h: number) => {
      // Use standard dimensions if 0
      const DEFAULTS: Record<string,number[]> = { F1A:[700,1200], F2A:[1200,1400], F3A:[1800,1400], PF1A:[800,2200], PF2A:[1400,2200], PF3A:[2100,2200], VAS:[700,500], SOPR:[800,400], FIS:[600,1000], FISTONDO:[600,600], SC2A:[1600,2200], SC4A:[2800,2200], ALZSC:[3000,2200], BLI:[900,2100], PI:[900,2100] };
      const [defW, defH] = DEFAULTS[tipo] || [1000, 1300];
      const ww = w > 0 ? w : defW;
      const hh = h > 0 ? h : defH;
      const vw=140, vh=Math.max(Math.min(Math.round(vw*(hh/Math.max(ww,1))),180), 60);
      const pad=5, iw=vw-pad*2, ih=vh-pad*2;
      // Frame
      let d = `<rect x="${pad}" y="${pad}" width="${iw}" height="${ih}" rx="1.5" fill="#f0f6ff" stroke="#333" stroke-width="2.5"/>`;
      // Internal frame
      d += `<rect x="${pad+3}" y="${pad+3}" width="${iw-6}" height="${ih-6}" rx="0.5" fill="none" stroke="#555" stroke-width="0.8"/>`;
      
      if (tipo.includes("SC") || tipo === "ALZSC") {
        // Scorrevole
        const mid=vw/2;
        d += `<rect x="${pad+5}" y="${pad+5}" width="${mid-pad-7}" height="${ih-10}" fill="#e8f0fe" stroke="#555" stroke-width="0.7"/>`;
        d += `<rect x="${mid+2}" y="${pad+5}" width="${mid-pad-7}" height="${ih-10}" fill="#e8f0fe" stroke="#555" stroke-width="0.7"/>`;
        // Rails
        d += `<line x1="${pad+5}" y1="${vh/2}" x2="${vw-pad-5}" y2="${vh/2}" stroke="#bbb" stroke-width="0.3" stroke-dasharray="2,2"/>`;
        // Handles
        d += `<rect x="${mid-10}" y="${vh/2-6}" width="3" height="12" rx="1" fill="#666"/>`;
        d += `<rect x="${mid+7}" y="${vh/2-6}" width="3" height="12" rx="1" fill="#666"/>`;
        // Arrows
        d += `<path d="M${mid-16},${vh/2} L${mid-22},${vh/2-3} L${mid-22},${vh/2+3}Z" fill="#999"/>`;
        d += `<path d="M${mid+16},${vh/2} L${mid+22},${vh/2-3} L${mid+22},${vh/2+3}Z" fill="#999"/>`;
      } else if (tipo.includes("2A") || tipo === "PF2A") {
        // 2 ante
        const mid=vw/2;
        d += `<line x1="${mid}" y1="${pad+3}" x2="${mid}" y2="${vh-pad-3}" stroke="#333" stroke-width="1.5"/>`;
        // Left pane
        d += `<rect x="${pad+5}" y="${pad+5}" width="${mid-pad-7}" height="${ih-10}" fill="#e8f0fe" stroke="#555" stroke-width="0.5"/>`;
        d += `<line x1="${pad+5}" y1="${pad+5}" x2="${mid-2}" y2="${vh-pad-5}" stroke="#ccc" stroke-width="0.4"/>`;
        d += `<line x1="${mid-2}" y1="${pad+5}" x2="${pad+5}" y2="${vh-pad-5}" stroke="#ccc" stroke-width="0.4"/>`;
        // Right pane
        d += `<rect x="${mid+2}" y="${pad+5}" width="${mid-pad-7}" height="${ih-10}" fill="#e8f0fe" stroke="#555" stroke-width="0.5"/>`;
        d += `<line x1="${mid+2}" y1="${pad+5}" x2="${vw-pad-5}" y2="${vh-pad-5}" stroke="#ccc" stroke-width="0.4"/>`;
        d += `<line x1="${vw-pad-5}" y1="${pad+5}" x2="${mid+2}" y2="${vh-pad-5}" stroke="#ccc" stroke-width="0.4"/>`;
        // Handles
        d += `<circle cx="${mid-8}" cy="${vh/2}" r="3" fill="none" stroke="#333" stroke-width="1"/>`;
        d += `<circle cx="${mid+8}" cy="${vh/2}" r="3" fill="none" stroke="#333" stroke-width="1"/>`;
        // Hinge indicators
        d += `<rect x="${pad+2}" y="${vh/3}" width="2" height="8" rx="1" fill="#888"/>`;
        d += `<rect x="${pad+2}" y="${vh*2/3}" width="2" height="8" rx="1" fill="#888"/>`;
        d += `<rect x="${vw-pad-4}" y="${vh/3}" width="2" height="8" rx="1" fill="#888"/>`;
        d += `<rect x="${vw-pad-4}" y="${vh*2/3}" width="2" height="8" rx="1" fill="#888"/>`;
      } else if (tipo === "VAS" || tipo === "SOPR") {
        // Vasistas / Sopraluce
        d += `<rect x="${pad+5}" y="${pad+5}" width="${iw-10}" height="${ih-10}" fill="#e8f0fe" stroke="#555" stroke-width="0.5"/>`;
        d += `<line x1="${pad+5}" y1="${vh-pad-5}" x2="${vw/2}" y2="${pad+5}" stroke="#ccc" stroke-width="0.4"/>`;
        d += `<line x1="${vw-pad-5}" y1="${vh-pad-5}" x2="${vw/2}" y2="${pad+5}" stroke="#ccc" stroke-width="0.4"/>`;
        // Handle bottom center
        d += `<rect x="${vw/2-5}" y="${vh-pad-9}" width="10" height="3" rx="1" fill="#666"/>`;
        // Hinge top
        d += `<rect x="${vw/3}" y="${pad+2}" width="8" height="2" rx="1" fill="#888"/>`;
        d += `<rect x="${vw*2/3-8}" y="${pad+2}" width="8" height="2" rx="1" fill="#888"/>`;
      } else if (tipo === "FIS" || tipo === "FISTONDO") {
        // Fisso
        d += `<rect x="${pad+5}" y="${pad+5}" width="${iw-10}" height="${ih-10}" fill="#e8f0fe" stroke="#555" stroke-width="0.5"/>`;
        // Glass dividers
        d += `<line x1="${vw/2}" y1="${pad+5}" x2="${vw/2}" y2="${vh-pad-5}" stroke="#ddd" stroke-width="0.3"/>`;
        d += `<line x1="${pad+5}" y1="${vh/2}" x2="${vw-pad-5}" y2="${vh/2}" stroke="#ddd" stroke-width="0.3"/>`;
        // "FISSO" label
        d += `<text x="${vw/2}" y="${vh/2+3}" text-anchor="middle" font-size="8" fill="#999" font-style="italic">fisso</text>`;
      } else if (tipo === "BLI") {
        // Porta blindata
        d += `<rect x="${pad+5}" y="${pad+5}" width="${iw-10}" height="${ih-10}" fill="#f5ece0" stroke="#555" stroke-width="0.7"/>`;
        // Panel details
        d += `<rect x="${pad+12}" y="${pad+15}" width="${iw-24}" height="${ih/4}" rx="2" fill="none" stroke="#987" stroke-width="0.5"/>`;
        d += `<rect x="${pad+12}" y="${vh/2-ih/8}" width="${iw-24}" height="${ih/4}" rx="2" fill="none" stroke="#987" stroke-width="0.5"/>`;
        // Handle
        d += `<rect x="${vw-pad-14}" y="${vh/2-8}" width="3" height="16" rx="1.5" fill="#666"/>`;
        // Lock
        d += `<circle cx="${vw-pad-12}" cy="${vh/2+14}" r="2.5" fill="none" stroke="#666" stroke-width="0.8"/>`;
      } else {
        // 1 anta standard (F1A, PF1A)
        d += `<rect x="${pad+5}" y="${pad+5}" width="${iw-10}" height="${ih-10}" fill="#e8f0fe" stroke="#555" stroke-width="0.5"/>`;
        // Opening diagonals
        d += `<line x1="${pad+5}" y1="${pad+5}" x2="${vw-pad-5}" y2="${vh-pad-5}" stroke="#ccc" stroke-width="0.4"/>`;
        d += `<line x1="${vw-pad-5}" y1="${pad+5}" x2="${pad+5}" y2="${vh-pad-5}" stroke="#ccc" stroke-width="0.4"/>`;
        // Handle
        d += `<circle cx="${vw-pad-12}" cy="${vh/2}" r="3" fill="none" stroke="#333" stroke-width="1"/>`;
        d += `<line x1="${vw-pad-12}" y1="${vh/2-3}" x2="${vw-pad-12}" y2="${vh/2-10}" stroke="#333" stroke-width="1"/>`;
        // Hinges left
        d += `<rect x="${pad+2}" y="${vh/3}" width="2" height="8" rx="1" fill="#888"/>`;
        d += `<rect x="${pad+2}" y="${vh*2/3}" width="2" height="8" rx="1" fill="#888"/>`;
      }
      // Dimension labels
      d += `<text x="${vw/2}" y="${vh+10}" text-anchor="middle" font-size="8" fill="#333" font-weight="700">${w} mm</text>`;
      d += `<text x="${vw+6}" y="${vh/2+3}" text-anchor="start" font-size="8" fill="#333" font-weight="700" transform="rotate(90,${vw+6},${vh/2})">${h} mm</text>`;
      return `<svg viewBox="0 0 ${vw+14} ${vh+14}" width="160" style="display:block;margin:6px auto;">${d}</svg>`;
    };

    // Build grouped sections by sistema
    const vaniWithCalc = vaniPDF.map((v, i) => {
      const { tot: sub, mq, perim, sysRec, vetroRec, copRec, lamRec } = calcolaVanoPDF(v);
      const m = v.misure||{};
      const lmm = m.lCentro||0, hmm = m.hCentro||0;
      const colInt = v.coloreInt || v.coloreInterno || v.colore || "Bianco";
      const colEst = v.coloreEst || v.coloreEsterno || v.colore || "Bianco";
      const vetroDesc = vetroRec ? vetroRec.code + (vetroRec.nome ? " " + vetroRec.nome : "") : (v.vetro || "");
      const sysKey = sysRec ? sysRec.id : (v.sistema || "nessuno");
      const sysName = sysRec ? (sysRec.marca ? sysRec.marca.toUpperCase() + " - " + sysRec.sistema.toUpperCase() : sysRec.sistema.toUpperCase()) : (v.sistema ? v.sistema.toUpperCase() : "");
      const tipoCode = v.tipo || "F1A";
      const tipoLabel = TIPI_LABEL[tipoCode] || tipoCode;
      const acc = v.accessori || {};
      let specs = '';
      const addS = (l: string, val: string) => { if (val) specs += `<tr><td class="sl">${l}</td><td class="sv"><b>${val}</b></td></tr>`; };
      // Posizione
      if (v.stanza || v.piano) addS("Posizione:", [v.stanza, v.piano ? "Piano " + v.piano : ""].filter(Boolean).join(", "));
      if ((v.pezzi || 1) > 1) addS("Quantità:", (v.pezzi || 1) + " elementi");
      addS("Colore interno:", colInt);
      addS("Colore esterno:", colEst);
      if (v.bicolore) addS("Finitura:", "Bicolore");
      if (vetroDesc) addS("Vetro:", vetroDesc);
      if (v.maniglia) addS("Martellina:", v.maniglia);
      addS("Superficie:", mq.toFixed(2).replace(".",",") + " m\u00b2");
      if (v.rifilDx) addS("Sagoma telaio dx:", v.rifilDx);
      if (v.rifilSotto || v.sagomaInf) addS("Sagoma telaio inf:", v.rifilSotto || v.sagomaInf || "");
      if (v.rifilSopra || v.sagomaSup) addS("Sagoma telaio sup:", v.rifilSopra || v.sagomaSup || "");
      if (v.rifilSx) addS("Sagoma telaio sx:", v.rifilSx);
      if (v.telaio) addS("Telaio fisso:", v.telaio);
      if (v.telaioAlaZ) addS("Telaio mobile:", v.telaioAlaZ);
      // Controtelaio dettagliato
      if (v.controtelaio && v.controtelaio !== "Nessuno") {
        let ctDesc = v.controtelaio;
        if (v.ctMarca) ctDesc += " — " + v.ctMarca;
        if (v.ctModello) ctDesc += " " + v.ctModello;
        addS("Controtelaio:", ctDesc);
        if (v.ctLarghezza || v.ctAltezza || v.ctSpessore) {
          const ctDims = [(v.ctLarghezza ? v.ctLarghezza + "mm L" : ""), (v.ctAltezza ? v.ctAltezza + "mm H" : ""), (v.ctSpessore ? v.ctSpessore + "mm sp." : "")].filter(Boolean).join(" × ");
          addS("Misure CT:", ctDims);
        }
        if (v.ctPosizione) addS("Posizione CT:", v.ctPosizione);
        if (v.ctNote) addS("Note CT:", v.ctNote);
      }
      // Cassonetto
      if (v.cassonetto) addS("Cassonetto:", v.cassonetto);
      // Coprifilo
      if (copRec) addS("Coprifilo:", copRec.nome || copRec.cod);
      else if (v.coprifilo) addS("Coprifilo:", v.coprifilo);
      // Soglia
      if (v.soglia) addS("Soglia:", v.soglia);
      // Davanzale
      if (v.davanzale) addS("Davanzale:", v.davanzale);
      if (lamRec) addS("Lamiera:", lamRec.nome || lamRec.cod);
      addS("Trasmitt. termica:", (v.trasmittanzaUw || sysRec?.uw || "1,2") + " W/m\u00b2K");
      if (acc.tapparella?.attivo) addS("Tapparella:", (acc.tapparella.tipo || "PVC") + (acc.tapparella.colore ? " " + acc.tapparella.colore : ""));
      if (acc.persiana?.attivo) addS("Persiana:", (acc.persiana.tipo || "Alluminio") + (acc.persiana.colore ? " " + acc.persiana.colore : ""));
      if (acc.zanzariera?.attivo) addS("Zanzariera:", (acc.zanzariera.tipo || "Rullo") + (acc.zanzariera.colore ? " " + acc.zanzariera.colore : ""));
      if (v.note && !v.note.startsWith("\ud83d\udd34")) addS("Note:", v.note);
      // Voci libere
      if (v.vociLibere?.length > 0) {
        v.vociLibere.forEach(vl => {
          const vlTot = (vl.prezzo || 0) * (vl.qta || 1);
          const unitaLabel = { pz: "pz", mq: "mq", ml: "ml", kg: "kg", forfait: "forfait" }[vl.unita] || vl.unita || "pz";
          addS("📦 " + (vl.descrizione || "Voce extra") + ":", `€${(vl.prezzo||0).toFixed(2)}/${unitaLabel} × ${vl.qta||1} = <b style="color:#1a7f37">€${vlTot.toFixed(2)}</b>`);
        });
      }
      return { ...v, idx: i, sub, mq, sysKey, sysName, sysRec, tipoCode, tipoLabel, lmm, hmm, specs };
    });

    // Group by system
    const groups: Record<string, typeof vaniWithCalc> = {};
    vaniWithCalc.forEach(v => {
      const k = String(v.sysKey);
      if (!groups[k]) groups[k] = [];
      groups[k].push(v);
    });

    // Build HTML sections
    let globalIdx = 0;
    const sectionsHtml = Object.entries(groups).map(([key, vani]) => {
      const sys = vani[0].sysRec;
      const sysName = vani[0].sysName || "Senza sistema assegnato";
      const subTot = vani.reduce((s, v) => s + v.sub, 0);
      const subMq = vani.reduce((s, v) => s + v.mq, 0);

      // System header with profile image
      const sysHeader = `<div style="margin-top:16px;margin-bottom:8px;padding:10px 14px;background:#f5f8fc;border:1.5px solid #0D7C6B30;border-radius:6px;display:flex;align-items:center;gap:14px;page-break-inside:avoid">
        ${sys?.immagineProfilo ? `<img src="${sys.immagineProfilo}" style="height:65px;max-width:140px;object-fit:contain;border-radius:4px;background:#fff;padding:4px;border:1px solid #ddd" alt=""/>` : `<div style="width:60px;height:60px;background:#e8f0fe;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:28px"><I d={ICO.grid} /></div>`}
        <div style="flex:1">
          <div style="font-size:14px;font-weight:900;color:#0D7C6B;letter-spacing:-0.3px">${sysName}</div>
          ${sys ? `<div style="font-size:9px;color:#666;margin-top:2px">${sys.euroMq ? "€" + sys.euroMq + "/m² base" : ""} ${sys.uw ? " · Uw " + sys.uw + " W/m²K" : ""}</div>` : ""}
          <div style="font-size:9px;color:#888;margin-top:1px">${vani.length} element${vani.length > 1 ? "i" : "o"} · ${subMq.toFixed(2).replace(".",",")} m²</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:13px;font-weight:900;color:#1a1a1c">&euro; ${fmt(subTot)}</div>
          <div style="font-size:8px;color:#888">subtotale</div>
        </div>
      </div>`;

      // Vani rows
      const rows = vani.map(v => {
        globalIdx++;
        return `<div style="display:flex;gap:10px;padding:10px 8px;border-bottom:1px solid #eee;page-break-inside:avoid">
          <div style="width:180px;text-align:center;flex-shrink:0">
            <div style="font-size:22px;font-weight:900;color:#0D7C6B;margin-bottom:2px">${String(globalIdx).padStart(2,"0")}</div>
            ${drawSVG(v.tipoCode, v.lmm, v.hmm)}
            <div style="font-size:7.5px;color:#999;font-style:italic;margin-top:1px">Vista interna</div>
            <div style="font-size:9px;font-weight:700;color:#333;margin-top:2px">${v.tipoLabel}${(v.pezzi || 1) > 1 ? ` × ${v.pezzi}` : ""}</div>
            <div style="font-size:8px;color:#555;font-weight:600">${v.stanza || ""}${v.stanza && v.piano ? ", " : ""}${v.piano ? "Piano " + v.piano : ""}</div>
          </div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
              <div><span style="font-size:11px;font-weight:700">${v.lmm} × ${v.hmm} mm</span>${v.nome ? `<span style="font-size:9px;color:#666;margin-left:6px">${v.nome}</span>` : ""}</div>
              <div style="font-size:12px;font-weight:900;color:#1a1a1c">&euro; ${fmt(v.sub)}${(v.pezzi || 1) > 1 ? `<div style="font-size:8px;color:#888;text-align:right">×${v.pezzi} = &euro;${fmt(v.sub * (v.pezzi || 1))}</div>` : ""}</div>
            </div>
            <table class="st"><tbody>${v.specs}</tbody></table>
            ${Object.values(v.foto || {}).filter(f => f.tipo === "foto" && f.dataUrl).length > 0 ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">${Object.values(v.foto || {}).filter(f => f.tipo === "foto" && f.dataUrl).slice(0, 4).map(f => `<img src="${f.dataUrl}" style="width:60px;height:45px;object-fit:cover;border-radius:3px;border:1px solid #ddd" alt=""/>`).join("")}${Object.values(v.foto || {}).filter(f => f.tipo === "foto" && f.dataUrl).length > 4 ? `<div style="width:60px;height:45px;background:#f0f0f0;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#666">+${Object.values(v.foto || {}).filter(f => f.tipo === "foto" && f.dataUrl).length - 4}</div>` : ""}</div>` : ""}
          </div>
        </div>`;
      }).join("");

      return sysHeader + `<div style="border:1px solid #ddd;border-radius:4px;overflow:hidden;margin-bottom:6px">${rows}</div>`;
    }).join("");

    // Extra rows (trasporto, voci libere commessa)
    let extraHtml = '';
    // Voci libere della commessa
    if ((c.vociLibere || []).length > 0) {
      extraHtml += `<div style="margin-top:12px;padding:10px 14px;background:#f9f9f9;border:1px solid #ddd;border-radius:4px">
        <div style="font-size:11px;font-weight:800;color:#333;margin-bottom:6px">LAVORI E ACCESSORI</div>
        ${(c.vociLibere || []).map(vl => {
          const vlTot = (vl.importo || 0) * (vl.qta || 1);
          return `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #eee;font-size:10px">
            <div><span style="font-weight:600">${vl.desc || "Voce"}</span> <span style="color:#888">×${vl.qta || 1}</span></div>
            <div style="font-weight:700">&euro; ${fmt(vlTot)}</div>
          </div>`;
        }).join("")}
      </div>`;
    }
    if (c.trasporto && parseFloat(c.trasporto) > 0) {
      extraHtml += `<div style="margin-top:8px;padding:10px 14px;background:#f9f9f9;border:1px solid #ddd;border-radius:4px;display:flex;justify-content:space-between;align-items:center">
        <div><div style="font-size:11px;font-weight:700"><I d={ICO.truck} /> Trasporto</div><div style="font-size:9px;color:#666">${c.trasportoNote || "Trasporto e scarico"}</div></div>
        <div style="font-size:12px;font-weight:900">&euro; ${fmt(parseFloat(c.trasporto))}</div>
      </div>`;
    }
    // Detrazione fiscale
    const detrId = c.detrazione || "nessuna";
    const DETR_MAP = { "50": "Detrazione Ristrutturazione 50%", "65": "Ecobonus 65%", "75": "Detrazione Barriere Architettoniche 75%", "110": "Superbonus 110%" };
    if (detrId !== "nessuna" && DETR_MAP[detrId]) {
      const detrPerc = parseInt(detrId);
      const detrVal = imponibile * detrPerc / 100;
      extraHtml += `<div style="margin-top:8px;padding:10px 14px;background:#e8f5e9;border:1px solid #4caf5040;border-radius:4px;display:flex;justify-content:space-between;align-items:center">
        <div><div style="font-size:11px;font-weight:700;color:#2e7d32"><I d={ICO.building} /> ${DETR_MAP[detrId]}</div><div style="font-size:9px;color:#666">Importo detraibile su imponibile</div></div>
        <div style="text-align:right"><div style="font-size:12px;font-weight:900;color:#2e7d32">&minus; &euro; ${fmt(detrVal)}</div><div style="font-size:8px;color:#888">Costo effettivo: &euro; ${fmt(totIva - detrVal)}</div></div>
      </div>`;
    }

    const scontoRow = sconto > 0 ? `<tr><td class="tl" style="color:#D08008">Sconto ${sconto}%</td><td class="tv" style="color:#D08008">&minus; ${fmt(scontoVal)}</td></tr>` : '';
    const noteHtml = c.notePreventivo ? `<div style="border:1px solid #ddd;padding:10px 12px;margin:10px 0;font-size:9.5px;color:#444;line-height:1.5"><b>Note:</b> ${c.notePreventivo}</div>` : '';
    const firmaHtml = c.firmaCliente ? `<img src="${c.firmaCliente}" style="max-height:55px;max-width:100%;display:block;margin:0 auto 4px"/>` : '<div style="border-bottom:1px solid #666;height:45px;margin-bottom:4px"></div>';

    const html = `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"/><title>Preventivo ${c.code}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
@page{size:A4;margin:12mm 10mm 15mm 10mm}
body{font-family:'Segoe UI',Arial,Helvetica,sans-serif;color:#1a1a1c;font-size:10px;line-height:1.35;background:#fff}
.pg{max-width:210mm;margin:0 auto;padding:12px 16px}
/* HEADER */
.hd{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;margin-bottom:14px;border-bottom:3px solid #0D7C6B}
.an{font-size:20px;font-weight:900;color:#0D7C6B;letter-spacing:-0.3px}
.ai{font-size:9px;color:#555;line-height:1.6}
/* CLIENT */
.cl-s{margin-bottom:12px;display:flex;justify-content:space-between}
.cl-l{font-size:9px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px}
.cl-n{font-size:13px;font-weight:800}
.cl-a{font-size:10px;color:#555}
.pi{font-size:10px;line-height:1.6}.pi b{color:#0D7C6B}
.intro{font-size:10px;color:#444;margin:10px 0 8px;font-style:italic}
/* TABLE */
.pt{width:100%;border-collapse:collapse;margin-bottom:8px;border:1px solid #ccc}
.pt thead th{background:#f0f0f0;border:1px solid #ccc;padding:5px 7px;font-size:8.5px;font-weight:700;text-transform:uppercase;color:#444;text-align:center}
.ir{border-bottom:1px solid #ddd}.ir2{border-bottom:1.5px solid #aaa}
.cn{width:150px;padding:8px;vertical-align:top;border-right:1px solid #ddd;text-align:center}
.n0{font-size:26px;font-weight:900;color:#0D7C6B;margin-bottom:4px}
.cv{font-size:7.5px;color:#999;font-style:italic;margin-top:2px}
.ct{font-size:9px;font-weight:700;color:#333;margin-top:3px;text-transform:uppercase}
.cs{font-size:8px;color:#888}
.csys{font-size:8px;font-weight:700;color:#0D7C6B;margin-top:2px;line-height:1.2}
.cd{padding:5px 7px;vertical-align:top;border-bottom:1px solid #eee}
.dv{font-size:11px;font-weight:700}
.cp,.cq,.ce{width:70px;padding:5px 7px;text-align:right;vertical-align:top;border-left:1px solid #ddd;font-size:10px}
.ce{font-weight:800}
.csp{padding:0 7px 7px;border-bottom:none}
.st{border-collapse:collapse;width:100%}
.st td{padding:1.5px 5px;font-size:9.5px;vertical-align:top}
.st .sl{color:#666;width:130px;white-space:nowrap}
.st .sv b{font-weight:700;color:#1a1a1c}
/* TOTALS */
.ts{margin-top:4px;display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}
.qi{font-size:10px;color:#555;padding-top:6px}.qi b{color:#1a1a1c}
.tt{border-collapse:collapse;min-width:250px}
.tt td{padding:4px 10px;font-size:10px}
.tl{text-align:right;color:#555;border:1px solid #ddd;background:#fafafa}
.tv{text-align:right;font-weight:700;border:1px solid #ddd;min-width:85px}
.tf .tl,.tf .tv{font-size:14px;font-weight:900;background:#f0f0f0;border:2px solid #333}
.tf .tv{color:#0D7C6B}
/* CONDIZIONI */
.ct2{font-size:10px;font-weight:800;text-transform:uppercase;text-align:center;margin:14px 0 8px;letter-spacing:.5px}
.cst{font-size:9px;font-weight:700;text-align:center;margin-bottom:6px;color:#555}
.ctx{font-size:9px;color:#444;line-height:1.6;margin-bottom:8px}.ctx b{color:#1a1a1c}
/* FIRMA */
.fs{display:flex;gap:36px;margin-top:20px;padding-top:14px;border-top:1.5px solid #ccc}
.fb{flex:1;text-align:center}.fl{font-size:8.5px;color:#555}
/* FOOTER */
.ft{margin-top:14px;padding:10px 0;border-top:2px solid #0D7C6B;display:flex;justify-content:space-between;font-size:8px;color:#888}
.ft b{color:#555}
/* PRINT */
.pb{display:block;margin:0 auto 12px;padding:10px 28px;background:#0D7C6B;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit}
@media print{.pb{display:none!important}.pg{padding:0;margin:0}}
</style></head><body>
<div class="pg">
<button class="pb" onclick="window.print()"><I d={ICO.printer} /> Stampa / Salva PDF</button>
<div class="no-print" style="position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:2px solid #0D7C6B;padding:10px 16px;display:flex;gap:8px;z-index:999;box-shadow:0 -4px 20px rgba(0,0,0,0.15)">
  <button onclick="window.print()" style="flex:1;padding:10px;background:#0D7C6B;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer"><I d={ICO.printer} /> Stampa PDF</button>
  <button onclick="if(navigator.share){navigator.share({title:'Preventivo ${c.code}',text:'Preventivo per ${c.cliente}',url:window.location.href}).catch(()=>{})}else{navigator.clipboard.writeText(document.title);alert('Link copiato!')}" style="flex:1;padding:10px;background:#1A9E73;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer"><I d={ICO.upload} /> Condividi</button>
  <button onclick="window.close()" style="padding:10px 16px;background:#DC4444;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">✕</button>
</div>

<div class="hd">
  <div>
    ${az.logo?`<img src="${az.logo}" style="height:48px;max-width:120px;object-fit:contain;margin-bottom:6px;display:block" alt=""/>`:''}
    <div class="an">${az.ragione||"La Tua Azienda"}</div>
    <div class="ai">${az.indirizzo||""}<br/>Tel. ${az.telefono||""}${az.email?" &middot; "+az.email:""}${az.piva?"<br/>P.IVA "+az.piva:""}${az.cciaa?" &middot; REA "+az.cciaa:""}${(az as any).pec?"<br/>PEC: "+(az as any).pec:""}</div>
  </div>
  <div style="text-align:right">

  </div>
</div>

<div class="cl-s">
  <div>
    <div class="cl-l">Spett.le</div>
    <div class="cl-n">${c.cliente} ${c.cognome||""}</div>
    <div class="cl-a">${c.indirizzo||""}</div>
    ${c.telefono?`<div class="cl-a">Tel. ${c.telefono}</div>`:""}
    ${c.email?`<div class="cl-a">${c.email}</div>`:""}
  </div>
  <div style="text-align:right">
    <div class="pi">Preventivo n. <b>${c.code.replace("CM-","")}</b></div>
    <div class="pi">Riferimento ordine <b>${c.cliente} ${c.cognome||""}</b></div>
    <div class="pi">Data: <b>${oggi}</b></div>
  </div>
</div>

<div class="intro">A seguito della Vostra gentile richiesta Vi rimettiamo il presente preventivo:</div>

${sectionsHtml}
${extraHtml}

<div class="ts">
  <div class="qi">Quadratura: <b>${totalMq.toFixed(2).replace(".",",")} m&sup2;</b></div>
  <table class="tt">
    <tr><td class="tl">Imponibile:</td><td class="tv">${fmt(imponibile)}</td></tr>
    ${scontoRow}
    <tr><td class="tl">I.V.A. ${ivaPerc}%:</td><td class="tv">${fmt(iva)}</td></tr>
    <tr class="tf"><td class="tl">Totale iva inclusa:</td><td class="tv">&euro; ${fmt(totIva)}</td></tr>
  </table>
</div>

${noteHtml}

${(() => {
  const nl2br = (s: string) => s.replace(/\n/g, "<br/>");
  const defFornitura = (az.ragione?az.ragione.toUpperCase():"L'AZIENDA") + ", NELL'ESECUZIONE DELLA PRODUZIONE E' GARANTE DELL'OSSERVANZA SCRUPOLOSA DELLA REGOLA D'ARTE E DELLE NORME VIGENTI.";
  const defPagamento = "<b>1. Pagamento</b><br/>&middot; 50% acconto alla firma del contratto previa ricezione di ns fattura di acconto<br/>&middot; 50% a SALDO, se non diversamente autorizzato a mezzo mail, a comunicazione merce pronta previa ricezione ns fattura a saldo fornitura.";
  const defConsegna = "<b>2. Tempi di consegna per tipologia di prodotto:</b><br/>&middot; PVC: BATTENTE STANDARD 30 GG.<br/>&middot; PVC: PORTE 35 GG.<br/>&middot; PVC: ALZANTI SCORREVOLI 40 GG.<br/>&middot; PVC: SCORREVOLE PARALLELO/RIBALTA E SCORRE 35 GG.<br/>&middot; PVC: FUORI SQUADRO 50 GG.<br/>&middot; ALLUMINIO: 45/50 GG LAVORATIVI.<br/><br/>Il contratto aggiornato datato e sottoscritto dal cliente con accettazione dei disegni tecnici allegati ed avviato dopo aver avviato l'ordine al fornitore dei materiali, non potranno pi&ugrave; essere accettate variazioni di alcun tipo.";
  const defContratto = "(I prezzi si intendono IVA esclusa)<br/><br/><b>1. Qualificazione giuridica del contratto</b><br/>Il contratto &egrave; ad ogni utile effetto di legge una compravendita in quanto la fornitura del materiale &egrave; prevalente.<br/><br/><b>2. Conclusione del contratto</b><br/>Il presente contratto si conclude con la sua sottoscrizione da parte dell'Acquirente e del Venditore.<br/><br/><b>3. Misure</b><br/>L'Acquirente &egrave; responsabile nel caso in cui abbia dato misure inesatte o non abbia comunicato tempestivamente variazioni.<br/><br/><b>4. Consegna</b><br/>La data di consegna ha natura meramente indicativa e non tassativa.<br/><br/><b>5. Garanzia</b><br/>I manufatti sono coperti da garanzia a norma di legge.<br/><br/><b>6. Trattamento dati</b><br/>Il trattamento dei dati personali viene svolto nel rispetto del D. Lgs. n. 196/2003.";
  const defDettagli = (vaniPDF.length > 0 && vaniPDF[0].sistema ? "Telai e strutture di manovra, sistema " + vaniPDF[0].sistema + ", colorazione \"" + (vaniPDF[0].coloreInt || vaniPDF[0].coloreEst || vaniPDF[0].colore || "Bianco") + "\"." : "Come da specifiche indicate per ogni singola voce del preventivo.") + "<br/><br/><b>Documenti da allegare alla consegna:</b><br/>- Dichiarazione di Prestazione;<br/>- Dichiarazione energetica;<br/>- Etichetta CE;<br/>- Manuale d'uso e manutenzione.";
  
  const txFornitura = az.condFornitura ? nl2br(az.condFornitura) : defFornitura;
  const txPagamento = az.condPagamento ? nl2br(az.condPagamento) : defPagamento;
  const txConsegna = az.condConsegna ? nl2br(az.condConsegna) : defConsegna;
  const txContratto = az.condContratto ? nl2br(az.condContratto) : defContratto;
  const txDettagli = az.condDettagli ? nl2br(az.condDettagli) : defDettagli;

  return `
<div class="ct2">CONDIZIONI GENERALI DI FORNITURA:</div>
<div class="ctx">${txFornitura}</div>

<div class="cst">CONDIZIONI PAGAMENTO E CONSEGNA (parte del preventivo)</div>
<div class="ctx">${txPagamento}<br/><br/>${txConsegna}</div>

<div class="ct2">CONDIZIONI GENERALI DI CONTRATTO</div>
<div class="ctx">${txContratto}</div>

<div class="ctx" style="margin-top:10px">
<b>Dettagli tecnici:</b><br/>
${txDettagli}<br/><br/>
${az.indirizzo ? (az.indirizzo.split(",").pop()?.trim() || "") + ", " : ""}${oggi}<br/><br/>
<div style="text-align:right;font-style:italic">Distinti saluti.</div>
</div>`;
})()}

<div class="fs">
  <div class="fb"><div style="border-bottom:1px solid #666;height:45px;margin-bottom:4px"></div><div class="fl">Firma tecnico / Timbro azienda</div></div>
  <div class="fb">${firmaHtml}<div class="fl">Firma cliente per accettazione${c.dataFirma?" &mdash; "+c.dataFirma:""}</div></div>
</div>

<div class="ft">
  <div><b>Indirizzo:</b><br/>${az.indirizzo||""}</div>
  <div><b>Contatti:</b><br/>Tel. ${az.telefono||""}${az.email?"<br/>"+az.email:""}</div>
  <div><b>Dati Aziendali:</b><br/>${az.ragione||""}${az.piva?"<br/>P.IVA "+az.piva:""}${az.iban?"<br/>IBAN: "+az.iban:""}</div>
</div>
<div style="text-align:center;font-size:7px;color:#bbb;margin-top:6px">Documento generato con MASTRO ERP &mdash; mastro.app</div>
</div>
</body></html>`;

    const blob = new Blob([html], {type:"text/html"});
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
}

// ═══════════════════════════════════════════════════════════
// MASTRO ERP — lib/pdf-condivisibile.ts
// Preventivo condivisibile + AI PDF extraction
// ═══════════════════════════════════════════════════════════

import { TIPOLOGIE_RAPIDE } from "@/components/mastro-constants";
import { supabase } from "@/lib/supabase";

interface CondDeps {
  aziendaInfo: any;
  calcolaVanoPrezzo: (v: any, c: any) => number;
  getVaniAttivi: (c: any) => any[];
}

export async function generaPreventivoCondivisibile(c: any, deps: CondDeps) {
  const { aziendaInfo, calcolaVanoPrezzo, getVaniAttivi } = deps;
  const aziendaDB = aziendaInfo;
    const vani = getVaniAttivi(c);
    const fmt = (n) => typeof n === "number" ? n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0,00";
    // Calcola prezzi reali dai sistemi/griglie
    const vaniConPrezzi = vani.map(v => ({ ...v, _prezzo: calcolaVanoPrezzo(v, c) }));
    const subtot = vaniConPrezzi.reduce((s, v) => s + v._prezzo, 0) + (c.vociLibere || []).reduce((s, vl) => s + ((vl.importo || 0) * (vl.qta || 1)), 0);
    const iva = subtot * 0.1;
    const tot = subtot + iva;

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1d1d1f;max-width:600px;margin:0 auto;padding:16px;background:#F2F1EC}
      .card{background:#fff;border-radius:14px;padding:18px;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08)}
      .header{text-align:center;margin-bottom:16px}
      .logo{max-height:50px;margin-bottom:8px}
      .title{font-size:22px;font-weight:800;color:#1d1d1f}
      .sub{font-size:12px;color:#86868b}
      .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px}
      .row:last-child{border:none}
      .total{font-size:18px;font-weight:800;color:#0D7C6B;text-align:right;padding:12px 0}
      .btn{width:100%;padding:16px;border-radius:12px;border:none;font-size:16px;font-weight:700;cursor:pointer;margin-top:8px;font-family:inherit}
      .btn-green{background:#1A9E73;color:#fff}
      .btn-outline{background:#fff;color:#0D7C6B;border:2px solid #0D7C6B}
      canvas{border:1px solid #e5e5ea;border-radius:10px;background:#fff;touch-action:none}
      .firma-done{background:#f0fdf4;border:2px solid #1A9E73;border-radius:12px;padding:16px;text-align:center}
    </style></head><body>
    <div class="header">
      ${aziendaDB.logo ? `<img src="${aziendaDB.logo}" class="logo"/><br>` : ""}
      <div class="title">${aziendaDB.nome || "MASTRO"}</div>
      <div class="sub">${aziendaDB.indirizzo || ""}<br>${aziendaDB.tel || ""} · ${aziendaDB.email || ""}</div>
    </div>

    <div class="card">
      <div style="font-size:11px;text-transform:uppercase;color:#86868b;letter-spacing:1px;margin-bottom:8px">Preventivo</div>
      <div style="font-size:16px;font-weight:700">${c.code}</div>
      <div style="font-size:13px;color:#86868b;margin-top:2px">Per: ${c.cliente} ${c.cognome || ""}</div>
      <div style="font-size:12px;color:#86868b">${c.indirizzo || ""}</div>
      <div style="font-size:11px;color:#86868b;margin-top:4px">Data: ${new Date().toLocaleDateString("it-IT")}</div>
    </div>

    <div class="card">
      <div style="font-size:11px;text-transform:uppercase;color:#86868b;letter-spacing:1px;margin-bottom:10px">Riepilogo fornitura</div>
      ${vaniConPrezzi.map((v, i) => {
        const tipLabel = TIPOLOGIE_RAPIDE.find(t => t.code === v.tipo)?.label || v.tipo || "Vano";
        return `<div class="row">
          <div><strong>${i + 1}. ${tipLabel}</strong><br><span style="font-size:11px;color:#86868b">${v.stanza || ""} ${v.piano || ""} — ${v.misure?.lCentro || 0}×${v.misure?.hCentro || 0} mm</span></div>
          <div style="font-weight:700;white-space:nowrap">&euro;${fmt(v._prezzo)}</div>
        </div>`;
      }).join("")}
      ${(c.vociLibere || []).map(vl => `<div class="row"><div>${vl.desc}</div><div style="font-weight:700">&euro;${fmt(vl.importo)}</div></div>`).join("")}
      <div style="border-top:2px solid #e5e5ea;margin-top:8px;padding-top:8px">
        <div class="row"><span>Imponibile</span><span style="font-weight:600">&euro;${fmt(subtot)}</span></div>
        <div class="row"><span>IVA 10%</span><span>&euro;${fmt(iva)}</span></div>
      </div>
      <div class="total">TOTALE: &euro;${fmt(tot)}</div>
    </div>

    ${c.condPagamento ? `<div class="card"><div style="font-size:11px;text-transform:uppercase;color:#86868b;letter-spacing:1px;margin-bottom:6px">Condizioni di pagamento</div><div style="font-size:12px;line-height:1.5">${c.condPagamento.replace(/\n/g, "<br>")}</div></div>` : ""}

    <div class="card" id="firma-section">
      <div style="font-size:11px;text-transform:uppercase;color:#86868b;letter-spacing:1px;margin-bottom:10px">Firma di accettazione</div>
      <div id="firma-pad" style="text-align:center">
        <canvas id="sigCanvas" width="340" height="150" style="width:100%;max-width:340px"></canvas>
        <div style="font-size:10px;color:#86868b;margin-top:4px">Firma con il dito o con il mouse</div>
        <div style="display:flex;gap:8px;margin-top:10px">
          <button class="btn btn-outline" onclick="clearSig()" style="flex:1;padding:10px;font-size:13px">Cancella</button>
          <button class="btn btn-green" onclick="confirmSig()" style="flex:1;padding:10px;font-size:13px">✅ Conferma e Firma</button>
        </div>
      </div>
      <div id="firma-done" class="firma-done" style="display:none">
        <div style="font-size:24px;margin-bottom:6px">✅</div>
        <div style="font-size:16px;font-weight:700;color:#1A9E73">Preventivo Firmato!</div>
        <div style="font-size:12px;color:#86868b;margin-top:4px">Grazie per la conferma. Riceverà aggiornamenti sull'avanzamento del suo ordine.</div>
        <img id="firma-img" style="max-height:60px;margin-top:10px" alt=""/>
      </div>
    </div>

    <div style="text-align:center;font-size:10px;color:#ccc;margin-top:16px">Generato con MASTRO · ${new Date().toLocaleDateString("it-IT")}</div>

    <script>
    const canvas=document.getElementById('sigCanvas'),ctx=canvas.getContext('2d');
    let drawing=false,lastX=0,lastY=0,hasDrawn=false;
    ctx.strokeStyle='#1d1d1f';ctx.lineWidth=2;ctx.lineCap='round';
    function getPos(e){const r=canvas.getBoundingClientRect();const t=e.touches?e.touches[0]:e;return{x:t.clientX-r.left,y:t.clientY-r.top};}
    canvas.addEventListener('mousedown',e=>{drawing=true;const p=getPos(e);lastX=p.x;lastY=p.y;});
    canvas.addEventListener('mousemove',e=>{if(!drawing)return;hasDrawn=true;const p=getPos(e);ctx.beginPath();ctx.moveTo(lastX,lastY);ctx.lineTo(p.x,p.y);ctx.stroke();lastX=p.x;lastY=p.y;});
    canvas.addEventListener('mouseup',()=>drawing=false);
    canvas.addEventListener('touchstart',e=>{e.preventDefault();drawing=true;const p=getPos(e);lastX=p.x;lastY=p.y;},{passive:false});
    canvas.addEventListener('touchmove',e=>{e.preventDefault();if(!drawing)return;hasDrawn=true;const p=getPos(e);ctx.beginPath();ctx.moveTo(lastX,lastY);ctx.lineTo(p.x,p.y);ctx.stroke();lastX=p.x;lastY=p.y;},{passive:false});
    canvas.addEventListener('touchend',()=>drawing=false);
    function clearSig(){ctx.clearRect(0,0,canvas.width,canvas.height);hasDrawn=false;}
    function confirmSig(){
      if(!hasDrawn){alert('Firma prima di confermare');return;}
      const img=canvas.toDataURL();
      document.getElementById('firma-pad').style.display='none';
      document.getElementById('firma-done').style.display='block';
      document.getElementById('firma-img').src=img;
    }
    <\/script>
    </body></html>`;

    // Upload to Supabase Storage per URL pubblico condivisibile
    const fileName = `preventivo_${c.code}_${Date.now()}.html`;
    try {
      const blob = new Blob([html], { type: "text/html" });
      const { data: uploadData, error } = await supabase.storage
        .from("preventivi")
        .upload(`public/${fileName}`, blob, { contentType: "text/html", upsert: true });
      
      if (!error && uploadData) {
        const { data: urlData } = supabase.storage.from("preventivi").getPublicUrl(`public/${fileName}`);
        const publicUrl = urlData?.publicUrl;
        if (publicUrl) {
          // Salva URL nella commessa
          setCantieri(cs => cs.map(x => x.id === c.id ? { ...x, linkPreventivo: publicUrl } : x));
          setSelectedCM(p => p?.id === c.id ? { ...p, linkPreventivo: publicUrl } : p);
          
          // Apri link + offri invio WhatsApp
          window.open(publicUrl, "_blank");
          
          // Auto-WhatsApp
          const tel = (c.telefono || "").replace(/\D/g, "");
          if (tel) {
            const msg = `Gentile ${c.cliente}, ecco il preventivo per ${c.code}:\n${publicUrl}\n\nPuò visionarlo e firmarlo direttamente dal suo telefono.\n\nCordiali saluti,\n${aziendaDB.nome || "MASTRO"}`;
            setTimeout(() => {
              if (confirm("Inviare il link via WhatsApp al cliente?")) {
                window.open(`https://wa.me/${tel.startsWith("39") ? tel : "39" + tel}?text=${encodeURIComponent(msg)}`, "_blank");
              }
            }, 500);
          }
          return publicUrl;
        }
      }
    } catch (e) { console.warn("Upload Supabase non riuscito, uso blob locale:", e); }
    
    // Fallback: blob locale se Supabase non disponibile
    const blobFallback = new Blob([html], { type: "text/html" });
    const urlFallback = URL.createObjectURL(blobFallback);
    window.open(urlFallback, "_blank");
    return urlFallback;
}

export async function estraiDatiPDF(file: File): Promise<any> {
    
    // Estrazione locale robusta — funziona anche offline
    try {
      const text = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string || "");
        reader.onerror = () => resolve("");
        reader.readAsText(file);
        setTimeout(() => resolve(""), 3000); // 3s max
      });
      
      if (text && text.length > 20) {
        // Totale
        const totMatch = text.match(/(?:TOTALE|Totale\s*(?:Documento|Ordine|Generale)?|Tot\.?\s*\u20ac?)\s*[\u20ac:]?\s*([\d.,]+)/i);
        if (totMatch) { const val = parseFloat(totMatch[1].replace(/\./g, "").replace(",", ".")); if (val > 0 && val < 1000000) extracted.totale = val; }
        // Imponibile
        const impMatch = text.match(/(?:Imponibile|Subtotale|Sub\s*tot)\s*[\u20ac:]?\s*([\d.,]+)/i);
        if (impMatch) { const val = parseFloat(impMatch[1].replace(/\./g, "").replace(",", ".")); if (val > 0) extracted.imponibile = val; }
        // Settimane
        const settMatch = text.match(/(\d{1,2})\s*(?:settiman[ea]|sett\.?|weeks?)/i);
        if (settMatch) extracted.settimane = parseInt(settMatch[1]);
        const giorniMatch = text.match(/(\d{1,3})\s*(?:giorni?\s*(?:lavorativ|lavor))/i);
        if (giorniMatch) extracted.settimane = Math.ceil(parseInt(giorniMatch[1]) / 5);
        // Data consegna
        const consMatch = text.match(/(?:consegna|delivery|spedizione)\s*(?:prevista)?:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
        if (consMatch) { const parts = consMatch[1].split(/[\/\-]/); if (parts.length === 3) { const y = parts[2].length === 2 ? "20" + parts[2] : parts[2]; extracted.dataConsegna = y + "-" + parts[1].padStart(2, "0") + "-" + parts[0].padStart(2, "0"); } }
        // Fornitore
        const fornMatch = text.match(/(?:Da|From|Fornitore|Ragione\s*Sociale)[:\s]+([^\n]{3,50})/i);
        if (fornMatch) extracted.fornitoreNome = fornMatch[1].trim();
        // Pagamento
        const pagMatch = text.match(/(\d{2,3})\s*(?:gg|giorni)\s*(?:FM|D\.?F\.?|f\.?m\.?)?/i);
        if (pagMatch) { const days = parseInt(pagMatch[1]); extracted.pagamento = days <= 30 ? "30gg_fm" : days <= 60 ? "60gg_fm" : "90gg_fm"; }
        if (text.match(/anticip/i)) extracted.pagamento = "anticipato";
        
        extracted.text = text.slice(0, 2000); // keep snippet for classification
      }
    } catch (e) { console.warn("Estrazione fallback:", e); }
    
    // Per immagini, estrai info dal nome file
    if (file.type.startsWith("image/")) {
      const fname = file.name.toLowerCase();
      if (fname.match(/conferma|order/i)) extracted.fornitoreNome = "Da conferma";
      if (fname.match(/fattura|invoice/i)) extracted.totale = extracted.totale || 0;
      // Crea URL locale per preview
      try { extracted.previewUrl = URL.createObjectURL(file); } catch(e) {}
    }
    
    return extracted;
}

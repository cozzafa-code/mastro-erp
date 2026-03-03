"use client";
// @ts-nocheck
// ═══════════════════════════════════════════════════════════
// MASTRO ERP — FotoMisure v2
// UX mobile-first: input grande, numpad, drag preciso,
// preview sotto il bottone, salvataggio chiaro
// ═══════════════════════════════════════════════════════════
import React, { useState, useRef, useCallback, useEffect } from "react";
import { FM, ICO, I, FF } from "./mastro-constants";

const COLORS = ["#DC4444", "#3B7FE0", "#D08008", "#1A9E73", "#af52de", "#fff"];

export default function FotoMisure({ imageUrl, onSave, onClose, T }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [tool, setTool] = useState("line");
  const [color, setColor] = useState("#DC4444");
  const [annotations, setAnnotations] = useState([]);
  const [drawing, setDrawing] = useState(null);
  const [inputModal, setInputModal] = useState(null); // { ...pos, type }
  const [inputValue, setInputValue] = useState("");
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const fileRef = useRef(null);
  const inputRef = useRef(null);
  const [localImg, setLocalImg] = useState(imageUrl || null);
  const [dragPreview, setDragPreview] = useState(null);
  const [undoStack, setUndoStack] = useState([]);

  // ─── Image Load ───
  const onImgLoad = useCallback(() => {
    const img = imgRef.current, canvas = canvasRef.current;
    if (!img || !canvas) return;
    const maxW = window.innerWidth;
    const maxH = window.innerHeight - 200;
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
    const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
    canvas.width = w; canvas.height = h;
    setImgSize({ w, h });
    setLoaded(true);
  }, []);

  // ─── Redraw ───
  const redraw = useCallback(() => {
    const canvas = canvasRef.current, img = imgRef.current;
    if (!canvas || !img || !loaded) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    annotations.forEach(a => {
      ctx.save();
      if (a.type === "line") drawCoted(ctx, a.x1, a.y1, a.x2, a.y2, a.text, a.color);
      else if (a.type === "point") drawPoint(ctx, a.x, a.y, a.text, a.color);
      else if (a.type === "text") drawLabel(ctx, a.x, a.y, a.text, a.color);
      ctx.restore();
    });

    // Live drag preview
    if (dragPreview && drawing) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(drawing.startX, drawing.startY);
      ctx.lineTo(dragPreview.x, dragPreview.y);
      ctx.stroke();
      ctx.setLineDash([]);
      // Live length
      const dx = dragPreview.x - drawing.startX, dy = dragPreview.y - drawing.startY;
      const len = Math.sqrt(dx*dx + dy*dy);
      if (len > 20) {
        const mx = (drawing.startX + dragPreview.x) / 2, my = (drawing.startY + dragPreview.y) / 2;
        ctx.font = "bold 12px 'JetBrains Mono', monospace";
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(mx - 20, my - 10, 40, 20);
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(Math.round(len) + "px", mx, my);
      }
      ctx.restore();
    }
  }, [annotations, loaded, drawing, dragPreview, color]);

  useEffect(() => { redraw(); }, [redraw]);

  // ─── Drawing functions ───
  function drawCoted(ctx, x1, y1, x2, y2, text, col) {
    const dx = x2-x1, dy = y2-y1, angle = Math.atan2(dy, dx);
    ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    // End ticks
    const tl = 10, perp = angle + Math.PI/2;
    for (const [px,py] of [[x1,y1],[x2,y2]]) {
      ctx.beginPath();
      ctx.moveTo(px - Math.cos(perp)*tl, py - Math.sin(perp)*tl);
      ctx.lineTo(px + Math.cos(perp)*tl, py + Math.sin(perp)*tl);
      ctx.stroke();
    }
    // Label
    const mx = (x1+x2)/2, my = (y1+y2)/2;
    const label = text || "";
    if (label) {
      ctx.font = "bold 15px 'JetBrains Mono', monospace";
      const tw = ctx.measureText(label).width + 12;
      const offX = -Math.sin(angle)*16, offY = Math.cos(angle)*16;
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.beginPath(); ctx.roundRect(mx+offX-tw/2, my-offY-11, tw, 22, 4); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(mx+offX-tw/2, my-offY-11, tw, 22, 4); ctx.stroke();
      ctx.fillStyle = col; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(label, mx+offX, my-offY);
    }
  }

  function drawPoint(ctx, x, y, text, col) {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.5; ctx.stroke();
    if (text) {
      ctx.font = "bold 13px 'JetBrains Mono', monospace";
      const tw = ctx.measureText(text).width + 10;
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.beginPath(); ctx.roundRect(x+12, y-12, tw, 24, 4); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(x+12, y-12, tw, 24, 4); ctx.stroke();
      ctx.fillStyle = col; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(text, x+17, y);
    }
  }

  function drawLabel(ctx, x, y, text, col) {
    ctx.font = "bold 14px 'JetBrains Mono', monospace";
    const tw = ctx.measureText(text).width + 12;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.roundRect(x-2, y-13, tw, 26, 6); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(text, x+4, y);
  }

  // ─── Touch handlers ───
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] || e.changedTouches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  };

  const handleStart = (e) => {
    e.preventDefault();
    if (inputModal) return;
    const pos = getPos(e);
    if (tool === "eraser") { undo(); return; }
    if (tool === "text" || tool === "point") {
      openInput(pos, tool === "point" ? "point" : "text", pos);
      return;
    }
    setDrawing({ startX: pos.x, startY: pos.y });
    setDragPreview(null);
  };

  const handleMove = (e) => {
    if (!drawing) return;
    e.preventDefault();
    setDragPreview(getPos(e));
  };

  const handleEnd = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const pos = getPos(e);
    const dx = pos.x - drawing.startX, dy = pos.y - drawing.startY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    setDragPreview(null);
    if (dist < 15) {
      openInput(pos, "point", pos);
    } else {
      openInput({ x: (drawing.startX+pos.x)/2, y: (drawing.startY+pos.y)/2 }, "line", { x1: drawing.startX, y1: drawing.startY, x2: pos.x, y2: pos.y });
    }
    setDrawing(null);
  };

  // ─── Input modal (bottom sheet with numpad) ───
  const openInput = (displayPos, type, coords) => {
    setInputModal({ type, coords, displayPos });
    setInputValue("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const confirmInput = () => {
    if (!inputModal) return;
    const { type, coords } = inputModal;
    const text = inputValue.trim();
    setUndoStack(prev => [...prev, [...annotations]]);
    if (type === "line") {
      setAnnotations(prev => [...prev, { type: "line", x1: coords.x1, y1: coords.y1, x2: coords.x2, y2: coords.y2, text, color }]);
    } else if (type === "point") {
      setAnnotations(prev => [...prev, { type: "point", x: coords.x, y: coords.y, text, color }]);
    } else {
      if (text) setAnnotations(prev => [...prev, { type: "text", x: coords.x, y: coords.y, text, color }]);
    }
    setInputModal(null);
    setInputValue("");
  };

  const skipInput = () => {
    // Save without text (for lines, still show the line)
    if (inputModal?.type === "line") {
      setUndoStack(prev => [...prev, [...annotations]]);
      const { coords } = inputModal;
      setAnnotations(prev => [...prev, { type: "line", x1: coords.x1, y1: coords.y1, x2: coords.x2, y2: coords.y2, text: "", color }]);
    }
    setInputModal(null);
    setInputValue("");
  };

  const undo = () => {
    if (undoStack.length > 0) {
      setAnnotations(undoStack[undoStack.length - 1]);
      setUndoStack(prev => prev.slice(0, -1));
    } else if (annotations.length > 0) {
      setAnnotations(prev => prev.slice(0, -1));
    }
  };

  // ─── Numpad digit helper ───
  const appendDigit = (d) => setInputValue(prev => prev + d);
  const backspace = () => setInputValue(prev => prev.slice(0, -1));

  // ─── Quick prefixes ───
  const quickLabels = [
    { label: "L", prefix: "L:" },
    { label: "H", prefix: "H:" },
    { label: "Ø", prefix: "Ø:" },
    { label: "Sp", prefix: "Sp:" },
    { label: "mm", suffix: true },
  ];

  // ─── Save ───
  const saveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL("image/jpeg", 0.85), annotations);
  };

  // ─── File input ───
  const takePhoto = () => fileRef.current?.click();
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setLocalImg(ev.target.result); setAnnotations([]); setUndoStack([]); setLoaded(false); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const ACC = T?.acc || "#D08008";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000", display: "flex", flexDirection: "column" }}>

      {/* ═══ HEADER ═══ */}
      <div style={{ padding: "10px 12px", background: "#111", display: "flex", alignItems: "center", gap: 8, flexShrink: 0, borderBottom: "1px solid #222" }}>
        <div onClick={onClose} style={{ padding: 6, cursor: "pointer" }}>
          <I d={ICO.back} s={20} c="#fff" />
        </div>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: FF }}>📸 Foto Misure</span>
        <div style={{ fontSize: 10, color: "#666", fontFamily: FM }}>{annotations.length} segni</div>
        {localImg && (
          <div onClick={saveImage} style={{ padding: "7px 16px", borderRadius: 8, background: "#1A9E73", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
            ✓ Salva
          </div>
        )}
      </div>

      {/* ═══ CANVAS AREA ═══ */}
      <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", background: "#0a0a0a" }}>
        {!localImg ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div onClick={takePhoto} style={{ width: 90, height: 90, borderRadius: "50%", background: "linear-gradient(135deg, #DC4444, #B83030)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", cursor: "pointer", boxShadow: "0 4px 30px rgba(220,68,68,0.4)" }}>
              <I d={ICO.camera} s={36} c="#fff" />
            </div>
            <div style={{ fontSize: 16, color: "#fff", fontWeight: 700 }}>Scatta foto infisso</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 6, lineHeight: 1.5 }}>Trascina una linea per quotare{"\n"}Tocca per un punto con misura</div>
          </div>
        ) : (
          <>
            <img ref={imgRef} src={localImg} onLoad={onImgLoad} style={{ display: "none" }} />
            <canvas
              ref={canvasRef}
              onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
              onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd}
              style={{ touchAction: "none", cursor: tool === "line" ? "crosshair" : "pointer" }}
            />
          </>
        )}
      </div>

      {/* ═══ INPUT MODAL — bottom sheet con numpad ═══ */}
      {inputModal && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20, background: "#1a1a1a", borderRadius: "16px 16px 0 0", padding: "12px 16px 24px", boxShadow: "0 -4px 30px rgba(0,0,0,0.5)" }}>
          {/* Handle */}
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#333", margin: "0 auto 10px" }} />
          
          {/* Type label */}
          <div style={{ fontSize: 10, color: "#666", fontWeight: 700, textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
            {inputModal.type === "line" ? "📏 Inserisci misura della linea" : inputModal.type === "point" ? "📍 Inserisci valore del punto" : "📝 Inserisci nota"}
          </div>

          {/* Quick prefix buttons */}
          <div style={{ display: "flex", gap: 6, marginBottom: 10, justifyContent: "center" }}>
            {quickLabels.map(q => (
              <div key={q.label} onClick={() => {
                if (q.suffix) setInputValue(prev => prev + " mm");
                else setInputValue(prev => q.prefix + prev.replace(/^[A-ZØ]+:/i, ""));
              }} style={{ padding: "6px 12px", borderRadius: 8, background: inputValue.startsWith(q.prefix) ? color + "30" : "rgba(255,255,255,0.06)", border: "1px solid " + (inputValue.startsWith(q.prefix) ? color : "#333"), color: inputValue.startsWith(q.prefix) ? color : "#888", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FM }}>
                {q.label}
              </div>
            ))}
          </div>

          {/* Big input display */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
            <div style={{ flex: 1, padding: "14px 16px", borderRadius: 12, background: "#000", border: "2px solid " + color, fontSize: 24, fontWeight: 800, fontFamily: FM, color: "#fff", textAlign: "center", minHeight: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {inputValue || <span style={{ color: "#444" }}>{inputModal.type === "line" ? "1200" : "valore"}</span>}
            </div>
          </div>

          {/* Numpad */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 10 }}>
            {["1","2","3","⌫","4","5","6","","7","8","9","0"].map((d, i) => {
              if (d === "") return <div key={i} />;
              if (d === "⌫") return (
                <div key={d} onClick={backspace} style={{ padding: "14px 0", borderRadius: 10, background: "rgba(255,255,255,0.06)", color: "#888", textAlign: "center", fontSize: 18, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <I d={ICO.back} s={18} c="#888" />
                </div>
              );
              return (
                <div key={d} onClick={() => appendDigit(d)} style={{ padding: "14px 0", borderRadius: 10, background: "rgba(255,255,255,0.08)", color: "#fff", textAlign: "center", fontSize: 20, fontWeight: 700, cursor: "pointer", fontFamily: FM, userSelect: "none" }}>
                  {d}
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <div onClick={skipInput} style={{ flex: 1, padding: "12px 0", borderRadius: 10, background: "rgba(255,255,255,0.06)", color: "#888", textAlign: "center", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {inputModal.type === "line" ? "Solo linea" : "Annulla"}
            </div>
            <div onClick={confirmInput} style={{ flex: 2, padding: "12px 0", borderRadius: 10, background: color, color: "#fff", textAlign: "center", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
              ✓ Conferma {inputValue ? `"${inputValue}"` : ""}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TOOLBAR ═══ */}
      {localImg && !inputModal && (
        <div style={{ padding: "8px 12px 22px", background: "#111", flexShrink: 0, borderTop: "1px solid #222" }}>
          {/* Tools row */}
          <div style={{ display: "flex", gap: 4, marginBottom: 8, justifyContent: "center" }}>
            {[
              { id: "line", label: "Linea", icon: "📏" },
              { id: "point", label: "Punto", icon: "📍" },
              { id: "text", label: "Nota", icon: "📝" },
            ].map(t => (
              <div key={t.id} onClick={() => setTool(t.id)} style={{
                display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 10, cursor: "pointer",
                background: tool === t.id ? color + "20" : "rgba(255,255,255,0.05)",
                border: "1.5px solid " + (tool === t.id ? color : "#333"),
                color: tool === t.id ? "#fff" : "#777",
              }}>
                <span style={{ fontSize: 15 }}>{t.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{t.label}</span>
              </div>
            ))}
            <div onClick={undo} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 10, cursor: "pointer", background: "rgba(255,255,255,0.05)", border: "1.5px solid #333" }}>
              <I d={ICO.back} s={15} c="#777" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#777" }}>Annulla</span>
            </div>
            <div onClick={takePhoto} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", borderRadius: 10, cursor: "pointer", background: "rgba(255,255,255,0.05)", border: "1.5px solid #333" }}>
              <I d={ICO.camera} s={15} c="#777" />
            </div>
          </div>

          {/* Colors */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => setColor(c)} style={{
                width: 26, height: 26, borderRadius: 13, background: c, cursor: "pointer",
                border: color === c ? "3px solid " + (c === "#fff" ? "#333" : "#fff") : "2px solid #333",
                boxShadow: color === c ? "0 0 10px " + c + "60" : "none",
              }} />
            ))}
          </div>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={onFileChange} />
    </div>
  );
}

"use client";
// @ts-nocheck
// ═══════════════════════════════════════════════════════════
// MASTRO ERP — FotoMisure v1
// Scatta foto infisso, annota misure sopra con canvas
// Tap+drag = linea cotata, tap = punto con label
// ═══════════════════════════════════════════════════════════
import React, { useState, useRef, useCallback, useEffect } from "react";
import { FM, ICO, I, Ico, FF } from "./mastro-constants";

const COLORS = ["#DC4444", "#3B7FE0", "#D08008", "#0D7C6B", "#af52de"];
const TOOLS = [
  { id: "line", label: "Linea", icon: ICO.ruler },
  { id: "point", label: "Punto", icon: ICO.mapPin },
  { id: "text", label: "Nota", icon: ICO.edit },
  { id: "eraser", label: "Annulla", icon: ICO.back },
];

export default function FotoMisure({ imageUrl, onSave, onClose, T }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [tool, setTool] = useState("line");
  const [color, setColor] = useState("#DC4444");
  const [annotations, setAnnotations] = useState([]);
  const [drawing, setDrawing] = useState(null); // {startX, startY}
  const [textInput, setTextInput] = useState(null); // {x, y, text}
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [canvasScale, setCanvasScale] = useState(1);
  const fileRef = useRef(null);
  const [localImg, setLocalImg] = useState(imageUrl || null);

  // Load image
  const onImgLoad = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const maxW = window.innerWidth;
    const maxH = window.innerHeight - 160;
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);

    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);

    canvas.width = w;
    canvas.height = h;
    setImgSize({ w, h });
    setCanvasScale(scale);
    setLoaded(true);
    redraw(w, h, scale, []);
  }, []);

  // Redraw canvas
  const redraw = useCallback((w, h, scale, annots) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    // Draw annotations
    (annots || annotations).forEach(a => {
      ctx.save();
      if (a.type === "line") {
        drawCotedLine(ctx, a.x1, a.y1, a.x2, a.y2, a.text, a.color);
      } else if (a.type === "point") {
        drawPoint(ctx, a.x, a.y, a.text, a.color);
      } else if (a.type === "text") {
        drawLabel(ctx, a.x, a.y, a.text, a.color);
      }
      ctx.restore();
    });
  }, [annotations]);

  useEffect(() => {
    if (loaded) redraw(imgSize.w, imgSize.h, canvasScale, annotations);
  }, [annotations, loaded]);

  // Coted line with dimension
  function drawCotedLine(ctx, x1, y1, x2, y2, text, col) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);

    // Main line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // End ticks (perpendicular)
    const tickLen = 8;
    const perp = angle + Math.PI / 2;
    for (const [px, py] of [[x1, y1], [x2, y2]]) {
      ctx.beginPath();
      ctx.moveTo(px - Math.cos(perp) * tickLen, py - Math.sin(perp) * tickLen);
      ctx.lineTo(px + Math.cos(perp) * tickLen, py + Math.sin(perp) * tickLen);
      ctx.stroke();
    }

    // Text background + label at midpoint
    const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2;
    const label = text || Math.round(len) + "";
    ctx.font = "bold 14px 'JetBrains Mono', monospace";
    const metrics = ctx.measureText(label);
    const pad = 4;
    const tw = metrics.width + pad * 2;
    const th = 18;

    // Offset above line
    const offX = -Math.sin(angle) * 14;
    const offY = Math.cos(angle) * 14;

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillRect(midX + offX - tw / 2, midY - offY - th / 2, tw, th);
    ctx.strokeStyle = col;
    ctx.lineWidth = 1;
    ctx.strokeRect(midX + offX - tw / 2, midY - offY - th / 2, tw, th);

    ctx.fillStyle = col;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, midX + offX, midY - offY);
  }

  function drawPoint(ctx, x, y, text, col) {
    // Circle
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label
    if (text) {
      ctx.font = "bold 12px 'JetBrains Mono', monospace";
      const tw = ctx.measureText(text).width + 8;
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillRect(x + 10, y - 10, tw, 20);
      ctx.strokeStyle = col;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 10, y - 10, tw, 20);
      ctx.fillStyle = col;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x + 14, y);
    }
  }

  function drawLabel(ctx, x, y, text, col) {
    ctx.font = "bold 13px 'JetBrains Mono', monospace";
    const tw = ctx.measureText(text).width + 10;
    ctx.fillStyle = col + "E0";
    const radius = 6;
    ctx.beginPath();
    ctx.roundRect(x - 2, y - 12, tw, 24, radius);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + 3, y);
  }

  // Touch / click handlers
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] || e.changedTouches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const handleStart = (e) => {
    e.preventDefault();
    const pos = getPos(e);

    if (tool === "eraser") {
      setAnnotations(prev => prev.slice(0, -1));
      return;
    }

    if (tool === "text") {
      setTextInput({ x: pos.x, y: pos.y, text: "" });
      return;
    }

    if (tool === "point") {
      setTextInput({ x: pos.x, y: pos.y, text: "", isPoint: true });
      return;
    }

    // Line: start drawing
    setDrawing({ startX: pos.x, startY: pos.y });
  };

  const handleEnd = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const pos = getPos(e);
    const dx = pos.x - drawing.startX;
    const dy = pos.y - drawing.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 10) {
      // Too short, treat as point
      setTextInput({ x: drawing.startX, y: drawing.startY, text: "", isPoint: true });
      setDrawing(null);
      return;
    }

    // Show input for dimension
    setTextInput({
      x: (drawing.startX + pos.x) / 2,
      y: (drawing.startY + pos.y) / 2,
      text: "",
      isLine: true,
      x1: drawing.startX, y1: drawing.startY,
      x2: pos.x, y2: pos.y,
    });
    setDrawing(null);
  };

  const confirmText = () => {
    if (!textInput) return;
    const { text } = textInput;

    if (textInput.isLine) {
      setAnnotations(prev => [...prev, { type: "line", x1: textInput.x1, y1: textInput.y1, x2: textInput.x2, y2: textInput.y2, text: text || "", color }]);
    } else if (textInput.isPoint) {
      setAnnotations(prev => [...prev, { type: "point", x: textInput.x, y: textInput.y, text: text || "", color }]);
    } else {
      if (text) setAnnotations(prev => [...prev, { type: "text", x: textInput.x, y: textInput.y, text, color }]);
    }
    setTextInput(null);
  };

  // Save annotated image
  const saveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    onSave(dataUrl, annotations);
  };

  // Take photo
  const takePhoto = () => { fileRef.current?.click(); };
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setLocalImg(ev.target.result); setAnnotations([]); setLoaded(false); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Quick measure buttons
  const QUICK = ["L:", "H:", "P:", "Ø:", "Sp:"];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ padding: "10px 16px", background: "#111", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div onClick={onClose} style={{ padding: 6, cursor: "pointer" }}>
          <I d={ICO.back} s={20} c="#fff" />
        </div>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: "#fff" }}>Foto + Misure</span>
        {localImg && (
          <div onClick={saveImage} style={{ padding: "6px 14px", borderRadius: 8, background: T?.acc || "#D08008", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Salva
          </div>
        )}
      </div>

      {/* Canvas area */}
      <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {!localImg ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div onClick={takePhoto} style={{ width: 80, height: 80, borderRadius: 40, background: T?.acc || "#D08008", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", cursor: "pointer", boxShadow: "0 4px 20px rgba(208,128,8,0.4)" }}>
              <I d={ICO.camera} s={32} c="#fff" />
            </div>
            <div style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>Scatta foto infisso</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Poi annota le misure direttamente sopra</div>
          </div>
        ) : (
          <>
            <img
              ref={imgRef}
              src={localImg}
              onLoad={onImgLoad}
              style={{ display: "none" }}
            />
            <canvas
              ref={canvasRef}
              onTouchStart={handleStart}
              onTouchEnd={handleEnd}
              onMouseDown={handleStart}
              onMouseUp={handleEnd}
              style={{ touchAction: "none", cursor: tool === "line" ? "crosshair" : tool === "eraser" ? "pointer" : "crosshair" }}
            />
          </>
        )}

        {/* Text input overlay */}
        {textInput && (
          <div style={{ position: "absolute", left: Math.min(textInput.x, (imgSize.w || 300) - 180), top: Math.min(textInput.y + 20, (imgSize.h || 400) - 60), zIndex: 10 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
              {QUICK.map(q => (
                <div key={q} onClick={() => setTextInput(prev => ({ ...prev, text: prev.text + q }))}
                  style={{ padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FM }}>
                  {q}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <input
                autoFocus
                value={textInput.text}
                onChange={e => setTextInput(prev => ({ ...prev, text: e.target.value }))}
                onKeyDown={e => { if (e.key === "Enter") confirmText(); }}
                placeholder={textInput.isLine ? "es. 1200" : textInput.isPoint ? "es. L:1200" : "nota..."}
                style={{ width: 140, padding: "8px 10px", borderRadius: 8, border: "2px solid " + color, background: "rgba(0,0,0,0.8)", color: "#fff", fontSize: 14, fontFamily: FM, fontWeight: 700, outline: "none" }}
              />
              <div onClick={confirmText} style={{ padding: "8px 12px", borderRadius: 8, background: color, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center" }}>
                ✓
              </div>
              <div onClick={() => setTextInput(null)} style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.1)", color: "#888", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center" }}>
                ✕
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      {localImg && (
        <div style={{ padding: "8px 16px 20px", background: "#111", flexShrink: 0 }}>
          {/* Tools */}
          <div style={{ display: "flex", gap: 6, marginBottom: 8, justifyContent: "center" }}>
            {TOOLS.map(t => (
              <div key={t.id} onClick={() => { if (t.id === "eraser") { setAnnotations(prev => prev.slice(0, -1)); } else { setTool(t.id); } }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 12px", borderRadius: 10, background: tool === t.id && t.id !== "eraser" ? color + "30" : "rgba(255,255,255,0.08)", cursor: "pointer", border: tool === t.id && t.id !== "eraser" ? "1px solid " + color : "1px solid transparent" }}>
                <I d={t.icon} s={18} c={tool === t.id && t.id !== "eraser" ? color : "#888"} />
                <span style={{ fontSize: 9, fontWeight: 600, color: tool === t.id && t.id !== "eraser" ? "#fff" : "#888" }}>{t.label}</span>
              </div>
            ))}
            <div onClick={takePhoto}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 12px", borderRadius: 10, background: "rgba(255,255,255,0.08)", cursor: "pointer" }}>
              <I d={ICO.camera} s={18} c="#888" />
              <span style={{ fontSize: 9, fontWeight: 600, color: "#888" }}>Nuova</span>
            </div>
          </div>
          {/* Colors */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => setColor(c)}
                style={{ width: 28, height: 28, borderRadius: 14, background: c, cursor: "pointer", border: color === c ? "3px solid #fff" : "3px solid transparent", boxShadow: color === c ? "0 0 8px " + c : "none" }} />
            ))}
          </div>
          {/* Counter */}
          <div style={{ textAlign: "center", marginTop: 6, fontSize: 10, color: "#666" }}>
            {annotations.length} annotazion{annotations.length === 1 ? "e" : "i"}
          </div>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={onFileChange} />
    </div>
  );
}

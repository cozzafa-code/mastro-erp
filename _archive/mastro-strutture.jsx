import { useState, useRef, useEffect, useCallback } from "react"
import * as THREE from "three"

// ══════════════════════════════════════════════════════════════════
//  MASTRO STRUTTURE — Configuratore Pianta → Lati → 3D
//  Pergole, Verande, Box Doccia, Strutture Ferro, Armadi Alluminio
// ══════════════════════════════════════════════════════════════════

const DS = {
  bg: "#F2F1EC", topbar: "#1A1A1C", amber: "#D08008", amberL: "#D0800815",
  green: "#1A9E73", greenL: "#1A9E7315", red: "#DC4444", redL: "#DC444415",
  blue: "#3B7FE0", blueL: "#3B7FE015", card: "#FFFFFF", bdr: "#E2E0DA",
  text: "#1A1A1C", sub: "#6B6860", sub2: "#9B978E", white: "#FFFFFF",
  r: 8, r2: 12, shadow: "0 2px 12px rgba(0,0,0,0.08)",
}

const FONT = "'JetBrains Mono', monospace"
const FONTB = "'Inter', system-ui, sans-serif"

// Structure types with default configs
const TIPI = [
  { id: "pergola", n: "Pergola Bioclimatica", icon: "☀️", defW: 4000, defD: 3000, defH: 2800, colStruct: "#3A3A3A", hasRoof: true, roofType: "lamelle" },
  { id: "veranda", n: "Veranda Balcone", icon: "🏠", defW: 3000, defD: 2000, defH: 2500, colStruct: "#E8E4DA", hasRoof: true, roofType: "vetro" },
  { id: "ferro", n: "Struttura in Ferro", icon: "🔩", defW: 3000, defD: 2500, defH: 2700, colStruct: "#2C2C2C", hasRoof: false, roofType: "none" },
  { id: "box_alu", n: "Box / Armadio Alluminio", icon: "📦", defW: 2000, defD: 1000, defH: 2200, colStruct: "#C0C0C0", hasRoof: true, roofType: "pannello" },
  { id: "box_doccia", n: "Box Doccia", icon: "🚿", defW: 1200, defD: 800, defH: 2100, colStruct: "#D0D0D0", hasRoof: false, roofType: "none" },
  { id: "cancello", n: "Cancello / Recinzione", icon: "🚪", defW: 4000, defD: 100, defH: 1800, colStruct: "#1A1A1A", hasRoof: false, roofType: "none" },
]

// Elements that can be placed on sides
const ELEMENTI = [
  { id: "vetro_fisso", n: "Vetro Fisso", icon: "▫️", color: "#A8D8EA", opacity: 0.4 },
  { id: "vetro_scorr", n: "Vetro Scorrevole", icon: "↔️", color: "#7BC8F6", opacity: 0.4 },
  { id: "porta", n: "Porta", icon: "🚪", color: "#C4A882", opacity: 0.7 },
  { id: "pannello", n: "Pannello Cieco", icon: "▪️", color: "#8B8680", opacity: 0.85 },
  { id: "lamelle", n: "Lamelle / Frangisole", icon: "☰", color: "#A0A0A0", opacity: 0.6 },
  { id: "persiana", n: "Persiana", icon: "▤", color: "#6B8E6B", opacity: 0.7 },
  { id: "rete", n: "Rete / Zanzariera", icon: "▦", color: "#D0D0D0", opacity: 0.3 },
  { id: "vuoto", n: "Aperto (niente)", icon: "○", color: "transparent", opacity: 0 },
]

const COLORI_STRUCT = [
  { n: "Antracite RAL 7016", h: "#3A4048" },
  { n: "Bianco RAL 9010", h: "#EDE9DF" },
  { n: "Nero RAL 9005", h: "#151518" },
  { n: "Marrone RAL 8017", h: "#46342E" },
  { n: "Grigio RAL 7035", h: "#BFC1BE" },
  { n: "Verde RAL 6005", h: "#104538" },
  { n: "Corten", h: "#8B4513" },
  { n: "Noce", h: "#7D5D3C" },
]

let _uid = 0
const uid = () => `s${++_uid}`

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function MastroStrutture() {
  const [fase, setFase] = useState("tipo") // tipo | pianta | lati | 3d
  const [tipo, setTipo] = useState(null)
  const [struttura, setStruttura] = useState(null)

  const initStruttura = (t) => {
    const tip = TIPI.find(x => x.id === t)
    setTipo(tip)
    // Default rectangular shape
    const W = tip.defW, D = tip.defD, H = tip.defH
    setStruttura({
      tipo: t,
      W, D, H,
      colStruct: tip.colStruct,
      roofType: tip.roofType,
      // Pianta points (mm) — rectangle default
      pianta: [
        { x: 0, y: 0 },
        { x: W, y: 0 },
        { x: W, y: D },
        { x: 0, y: D },
      ],
      // Sides — auto-generated from pianta
      lati: [],
      // Will be computed from pianta
    })
    setFase("pianta")
  }

  // Compute sides from pianta points
  const computeLati = useCallback((s) => {
    if (!s) return s
    const pts = s.pianta
    const lati = pts.map((p, i) => {
      const next = pts[(i + 1) % pts.length]
      const dx = next.x - p.x, dy = next.y - p.y
      const lunghezza = Math.round(Math.sqrt(dx * dx + dy * dy))
      const existing = s.lati?.[i]
      return {
        id: existing?.id || uid(),
        nome: existing?.nome || `Lato ${i + 1}`,
        lunghezza,
        altezza: s.H,
        elementi: existing?.elementi || [],
        fromPt: p,
        toPt: next,
      }
    })
    return { ...s, lati }
  }, [])

  const updateStruttura = (fn) => {
    setStruttura(prev => {
      const next = typeof fn === "function" ? fn(prev) : fn
      return computeLati(next)
    })
  }

  useEffect(() => {
    if (struttura && struttura.lati.length === 0) {
      setStruttura(computeLati(struttura))
    }
  }, [struttura, computeLati])

  return (
    <div style={{ width: "100vw", height: "100vh", background: DS.bg, display: "flex", flexDirection: "column", fontFamily: FONTB, color: DS.text, overflow: "hidden" }}>
      {/* TOPBAR */}
      <div style={{ height: 52, background: DS.topbar, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, flexShrink: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: DS.amber, fontFamily: FONT, letterSpacing: 1 }}>MASTRO</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", opacity: 0.7 }}>STRUTTURE</span>
        <div style={{ flex: 1 }} />
        {/* Fase tabs */}
        {struttura && (
          <div style={{ display: "flex", gap: 2 }}>
            {[
              { k: "tipo", l: "1. TIPO", ok: true },
              { k: "pianta", l: "2. PIANTA", ok: !!struttura },
              { k: "lati", l: "3. LATI", ok: !!struttura },
              { k: "3d", l: "4. 3D", ok: !!struttura },
            ].map(f => (
              <button key={f.k} onClick={() => f.ok && setFase(f.k)}
                style={{
                  padding: "6px 16px", borderRadius: 6, border: "none", cursor: f.ok ? "pointer" : "default",
                  background: fase === f.k ? DS.amber : "rgba(255,255,255,0.1)",
                  color: fase === f.k ? "#fff" : f.ok ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)",
                  fontSize: 11, fontWeight: 700, fontFamily: FONT, letterSpacing: 0.5,
                  transition: "all 0.2s",
                }}>
                {f.l}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {fase === "tipo" && <FaseTipo onSelect={initStruttura} />}
        {fase === "pianta" && struttura && <FasePianta struttura={struttura} tipo={tipo} onUpdate={updateStruttura} onNext={() => setFase("lati")} />}
        {fase === "lati" && struttura && <FaseLati struttura={struttura} tipo={tipo} onUpdate={updateStruttura} onNext={() => setFase("3d")} />}
        {fase === "3d" && struttura && <Fase3D struttura={struttura} tipo={tipo} />}
      </div>
    </div>
  )
}

// ─── FASE 1: SCELTA TIPO ──────────────────────────────────────
function FaseTipo({ onSelect }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32, padding: 40 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", margin: 0 }}>Cosa vuoi progettare?</h1>
        <p style={{ fontSize: 14, color: DS.sub, textAlign: "center", marginTop: 8 }}>Scegli il tipo di struttura per iniziare</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 720 }}>
        {TIPI.map(t => (
          <button key={t.id} onClick={() => onSelect(t.id)}
            style={{
              padding: "28px 20px", borderRadius: DS.r2, border: `2px solid ${DS.bdr}`, background: DS.card,
              cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
              boxShadow: DS.shadow, transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = DS.amber; e.currentTarget.style.transform = "translateY(-2px)" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = DS.bdr; e.currentTarget.style.transform = "none" }}>
            <span style={{ fontSize: 36 }}>{t.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{t.n}</span>
            <span style={{ fontSize: 11, color: DS.sub, fontFamily: FONT }}>
              {t.defW}×{t.defD}mm
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── FASE 2: PIANTA ───────────────────────────────────────────
function FasePianta({ struttura, tipo, onUpdate, onNext }) {
  const svgRef = useRef(null)
  const [dragIdx, setDragIdx] = useState(null)
  const [hoverIdx, setHoverIdx] = useState(null)
  const [editDim, setEditDim] = useState(null) // {idx, field}

  const pts = struttura.pianta
  const scale = 0.12 // mm to px
  const pad = 80

  // Compute bounding box
  const minX = Math.min(...pts.map(p => p.x)), maxX = Math.max(...pts.map(p => p.x))
  const minY = Math.min(...pts.map(p => p.y)), maxY = Math.max(...pts.map(p => p.y))
  const svgW = (maxX - minX) * scale + pad * 2
  const svgH = (maxY - minY) * scale + pad * 2

  const toSvg = (p) => ({ x: (p.x - minX) * scale + pad, y: (p.y - minY) * scale + pad })

  const handleMouseDown = (idx, e) => {
    e.preventDefault()
    setDragIdx(idx)
  }

  const handleMouseMove = useCallback((e) => {
    if (dragIdx === null) return
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const mx = (e.clientX - rect.left - pad) / scale + minX
    const my = (e.clientY - rect.top - pad) / scale + minY
    // Snap to 50mm grid
    const snapped = { x: Math.round(mx / 50) * 50, y: Math.round(my / 50) * 50 }
    onUpdate(prev => {
      const newPts = [...prev.pianta]
      newPts[dragIdx] = snapped
      // Update W and D from bounding box
      const xs = newPts.map(p => p.x), ys = newPts.map(p => p.y)
      return { ...prev, pianta: newPts, W: Math.max(...xs) - Math.min(...xs), D: Math.max(...ys) - Math.min(...ys) }
    })
  }, [dragIdx, scale, minX, minY, pad, onUpdate])

  const handleMouseUp = useCallback(() => setDragIdx(null), [])

  useEffect(() => {
    if (dragIdx !== null) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp) }
    }
  }, [dragIdx, handleMouseMove, handleMouseUp])

  // Add point on edge
  const addPoint = (idx) => {
    const p1 = pts[idx], p2 = pts[(idx + 1) % pts.length]
    const mid = { x: Math.round((p1.x + p2.x) / 2 / 50) * 50, y: Math.round((p1.y + p2.y) / 2 / 50) * 50 }
    onUpdate(prev => {
      const newPts = [...prev.pianta]
      newPts.splice(idx + 1, 0, mid)
      return { ...prev, pianta: newPts }
    })
  }

  // Remove point
  const removePoint = (idx) => {
    if (pts.length <= 3) return
    onUpdate(prev => {
      const newPts = prev.pianta.filter((_, i) => i !== idx)
      return { ...prev, pianta: newPts }
    })
  }

  // Dimension editing
  const handleDimClick = (idx) => {
    setEditDim({ idx, value: "" })
  }

  const applyDim = (idx, newLen) => {
    if (!newLen || isNaN(newLen)) { setEditDim(null); return }
    const p1 = pts[idx], p2 = pts[(idx + 1) % pts.length]
    const dx = p2.x - p1.x, dy = p2.y - p1.y
    const oldLen = Math.sqrt(dx * dx + dy * dy)
    if (oldLen === 0) { setEditDim(null); return }
    const ratio = newLen / oldLen
    onUpdate(prev => {
      const newPts = [...prev.pianta]
      newPts[(idx + 1) % newPts.length] = {
        x: Math.round((p1.x + dx * ratio) / 50) * 50,
        y: Math.round((p1.y + dy * ratio) / 50) * 50,
      }
      return { ...prev, pianta: newPts }
    })
    setEditDim(null)
  }

  // Preset shapes
  const setShape = (shape) => {
    const W = struttura.W, D = struttura.D
    let newPts
    if (shape === "rect") newPts = [{ x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: D }, { x: 0, y: D }]
    else if (shape === "L") newPts = [{ x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: D * 0.6 }, { x: W * 0.5, y: D * 0.6 }, { x: W * 0.5, y: D }, { x: 0, y: D }]
    else if (shape === "U") newPts = [{ x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: D }, { x: W * 0.7, y: D }, { x: W * 0.7, y: D * 0.4 }, { x: W * 0.3, y: D * 0.4 }, { x: W * 0.3, y: D }, { x: 0, y: D }]
    else if (shape === "trap") newPts = [{ x: W * 0.1, y: 0 }, { x: W * 0.9, y: 0 }, { x: W, y: D }, { x: 0, y: D }]
    onUpdate(prev => ({ ...prev, pianta: newPts.map(p => ({ x: Math.round(p.x / 50) * 50, y: Math.round(p.y / 50) * 50 })) }))
  }

  return (
    <div style={{ height: "100%", display: "flex" }}>
      {/* LEFT PANEL */}
      <div style={{ width: 260, borderRight: `1px solid ${DS.bdr}`, padding: 20, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", background: DS.card }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: DS.sub, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Struttura</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>{tipo.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{tipo.n}</span>
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: DS.sub, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Dimensioni base</div>
          {[
            { k: "W", l: "Larghezza" },
            { k: "D", l: "Profondità" },
            { k: "H", l: "Altezza" },
          ].map(d => (
            <div key={d.k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: DS.sub, width: 70 }}>{d.l}</span>
              <input type="number" value={struttura[d.k]} step={50}
                onChange={e => {
                  const v = parseInt(e.target.value) || 0
                  onUpdate(prev => {
                    const ratio_w = d.k === "W" ? v / prev.W : 1
                    const ratio_d = d.k === "D" ? v / prev.D : 1
                    const newPts = prev.pianta.map(p => ({
                      x: Math.round(p.x * ratio_w / 50) * 50,
                      y: Math.round(p.y * ratio_d / 50) * 50,
                    }))
                    return { ...prev, [d.k]: v, pianta: newPts }
                  })
                }}
                style={{ flex: 1, padding: "5px 8px", borderRadius: 6, border: `1px solid ${DS.bdr}`, fontSize: 13, fontFamily: FONT, textAlign: "right" }}
              />
              <span style={{ fontSize: 10, color: DS.sub2 }}>mm</span>
            </div>
          ))}
        </div>

        {/* Shape presets */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: DS.sub, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Forma pianta</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              { k: "rect", l: "Rettangolo", svg: "M4,4 L28,4 L28,20 L4,20 Z" },
              { k: "L", l: "Forma L", svg: "M4,4 L28,4 L28,14 L16,14 L16,20 L4,20 Z" },
              { k: "U", l: "Forma U", svg: "M4,4 L28,4 L28,20 L22,20 L22,10 L10,10 L10,20 L4,20 Z" },
              { k: "trap", l: "Trapezio", svg: "M8,4 L24,4 L28,20 L4,20 Z" },
            ].map(s => (
              <button key={s.k} onClick={() => setShape(s.k)}
                style={{ padding: "8px 6px", borderRadius: 6, border: `1px solid ${DS.bdr}`, background: DS.bg, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <svg width={32} height={24} viewBox="0 0 32 24"><path d={s.svg} fill="none" stroke={DS.amber} strokeWidth={1.5} /></svg>
                <span style={{ fontSize: 9, fontWeight: 600, color: DS.sub }}>{s.l}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: DS.sub, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Colore struttura</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
            {COLORI_STRUCT.map(c => (
              <button key={c.h} onClick={() => onUpdate(prev => ({ ...prev, colStruct: c.h }))} title={c.n}
                style={{
                  width: 36, height: 36, borderRadius: 8, background: c.h, border: struttura.colStruct === c.h ? `3px solid ${DS.amber}` : `2px solid ${DS.bdr}`,
                  cursor: "pointer", transition: "all 0.15s",
                }} />
            ))}
          </div>
        </div>

        {/* Roof type */}
        {tipo.hasRoof && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: DS.sub, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Copertura</div>
            <div style={{ display: "flex", gap: 4 }}>
              {["lamelle", "vetro", "pannello", "policarbonato"].map(r => (
                <button key={r} onClick={() => onUpdate(prev => ({ ...prev, roofType: r }))}
                  style={{
                    flex: 1, padding: "6px 4px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer",
                    border: struttura.roofType === r ? `2px solid ${DS.amber}` : `1px solid ${DS.bdr}`,
                    background: struttura.roofType === r ? DS.amberL : DS.bg,
                    color: struttura.roofType === r ? DS.amber : DS.sub,
                    textTransform: "capitalize",
                  }}>{r}</button>
              ))}
            </div>
          </div>
        )}

        <div style={{ flex: 1 }} />
        <button onClick={onNext}
          style={{ padding: "12px 20px", borderRadius: DS.r, border: "none", background: DS.amber, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Avanti → Lati
        </button>
      </div>

      {/* SVG CANVAS */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAF5", overflow: "auto", position: "relative" }}>
        <div style={{ position: "absolute", top: 12, left: 12, fontSize: 11, color: DS.sub, fontFamily: FONT }}>
          PIANTA — Vista dall'alto · Griglia 50mm · Trascina i vertici
        </div>
        <svg ref={svgRef} width={Math.max(svgW, 500)} height={Math.max(svgH, 400)}
          style={{ cursor: dragIdx !== null ? "grabbing" : "default" }}>
          {/* Grid */}
          <defs>
            <pattern id="grid50" width={50 * scale} height={50 * scale} patternUnits="userSpaceOnUse">
              <path d={`M ${50 * scale} 0 L 0 0 0 ${50 * scale}`} fill="none" stroke="#E0DDD5" strokeWidth={0.5} />
            </pattern>
            <pattern id="grid500" width={500 * scale} height={500 * scale} patternUnits="userSpaceOnUse">
              <path d={`M ${500 * scale} 0 L 0 0 0 ${500 * scale}`} fill="none" stroke="#D0CCC0" strokeWidth={1} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid50)" />
          <rect width="100%" height="100%" fill="url(#grid500)" />

          {/* Floor fill */}
          <polygon
            points={pts.map(p => { const s = toSvg(p); return `${s.x},${s.y}` }).join(" ")}
            fill={struttura.colStruct + "15"} stroke={struttura.colStruct} strokeWidth={3}
          />

          {/* Dimension lines */}
          {pts.map((p, i) => {
            const next = pts[(i + 1) % pts.length]
            const s1 = toSvg(p), s2 = toSvg(next)
            const mx = (s1.x + s2.x) / 2, my = (s1.y + s2.y) / 2
            const dx = s2.x - s1.x, dy = s2.y - s1.y
            const len = Math.round(Math.sqrt((next.x - p.x) ** 2 + (next.y - p.y) ** 2))
            // Offset dimension text outside the shape
            const nx = -dy, ny = dx
            const nl = Math.sqrt(nx * nx + ny * ny) || 1
            const off = 22
            const tx = mx + (nx / nl) * off, ty = my + (ny / nl) * off
            const angle = Math.atan2(dy, dx) * 180 / Math.PI
            const displayAngle = (angle > 90 || angle < -90) ? angle + 180 : angle

            return (
              <g key={`dim-${i}`}>
                {/* Dimension line */}
                <line x1={s1.x} y1={s1.y} x2={s2.x} y2={s2.y} stroke={DS.amber} strokeWidth={1} strokeDasharray="4,3" opacity={0.6} />
                {/* Clickable dimension */}
                <g transform={`translate(${tx},${ty}) rotate(${displayAngle})`} style={{ cursor: "pointer" }} onClick={() => handleDimClick(i)}>
                  <rect x={-30} y={-10} width={60} height={20} rx={4} fill={DS.card} stroke={DS.amber} strokeWidth={1} />
                  {editDim?.idx === i ? (
                    <foreignObject x={-28} y={-9} width={56} height={18}>
                      <input autoFocus type="number" defaultValue={len} style={{ width: "100%", height: "100%", border: "none", background: "transparent", textAlign: "center", fontSize: 10, fontFamily: FONT, fontWeight: 700, color: DS.amber }}
                        onBlur={e => applyDim(i, parseInt(e.target.value))}
                        onKeyDown={e => { if (e.key === "Enter") applyDim(i, parseInt(e.target.value)) }}
                      />
                    </foreignObject>
                  ) : (
                    <text textAnchor="middle" dy={4} fontSize={10} fontFamily={FONT} fontWeight={700} fill={DS.amber}>{len}</text>
                  )}
                </g>
                {/* Lato label */}
                <text x={mx} y={my} textAnchor="middle" dy={-8} fontSize={8} fill={DS.sub2} fontFamily={FONT}>L{i + 1}</text>
                {/* Add point on edge */}
                <circle cx={mx} cy={my} r={6} fill={DS.green} opacity={hoverIdx === `e${i}` ? 0.8 : 0} style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoverIdx(`e${i}`)} onMouseLeave={() => setHoverIdx(null)}
                  onClick={(e) => { e.stopPropagation(); addPoint(i) }} />
                {hoverIdx === `e${i}` && <text x={mx} y={my} textAnchor="middle" dy={3.5} fontSize={9} fill="#fff" fontWeight={700} style={{ pointerEvents: "none" }}>+</text>}
              </g>
            )
          })}

          {/* Vertices */}
          {pts.map((p, i) => {
            const s = toSvg(p)
            return (
              <g key={`v-${i}`}>
                <circle cx={s.x} cy={s.y} r={hoverIdx === `v${i}` || dragIdx === i ? 10 : 7}
                  fill={dragIdx === i ? DS.amber : DS.card} stroke={DS.amber} strokeWidth={2.5}
                  style={{ cursor: "grab", transition: "r 0.15s" }}
                  onMouseDown={(e) => handleMouseDown(i, e)}
                  onMouseEnter={() => setHoverIdx(`v${i}`)} onMouseLeave={() => setHoverIdx(null)}
                  onDoubleClick={() => removePoint(i)}
                />
                <text x={s.x} y={s.y} textAnchor="middle" dy={3.5} fontSize={8} fontFamily={FONT} fontWeight={700}
                  fill={dragIdx === i ? "#fff" : DS.amber} style={{ pointerEvents: "none" }}>
                  {i + 1}
                </text>
                {/* Coordinates */}
                <text x={s.x} y={s.y + 18} textAnchor="middle" fontSize={7} fontFamily={FONT} fill={DS.sub2}>
                  {p.x},{p.y}
                </text>
              </g>
            )
          })}

          {/* North arrow */}
          <g transform="translate(30, 30)">
            <line x1={0} y1={15} x2={0} y2={-10} stroke={DS.sub} strokeWidth={1.5} markerEnd="url(#arrow)" />
            <text x={0} y={-14} textAnchor="middle" fontSize={8} fontWeight={700} fill={DS.sub}>N</text>
          </g>
        </svg>
      </div>
    </div>
  )
}

// ─── FASE 3: LATI ─────────────────────────────────────────────
function FaseLati({ struttura, tipo, onUpdate, onNext }) {
  const [selLato, setSelLato] = useState(0)
  const [dragEl, setDragEl] = useState(null) // dragging element
  const [addMode, setAddMode] = useState(null) // element type being added

  const lato = struttura.lati[selLato]
  if (!lato) return null

  const scaleX = 0.15 // mm to px for width
  const scaleY = 0.15
  const sW = lato.lunghezza * scaleX
  const sH = lato.altezza * scaleY
  const padX = 60, padY = 50
  const svgW = sW + padX * 2
  const svgH = sH + padY * 2

  // Add element to current side
  const addElemento = (tipoEl, x, w) => {
    onUpdate(prev => {
      const newLati = [...prev.lati]
      const l = { ...newLati[selLato] }
      l.elementi = [...l.elementi, {
        id: uid(),
        tipo: tipoEl,
        x: x || 200, // mm from left
        y: 0,
        w: w || Math.round(lato.lunghezza * 0.3),
        h: lato.altezza,
      }]
      newLati[selLato] = l
      return { ...prev, lati: newLati }
    })
  }

  const removeElemento = (elId) => {
    onUpdate(prev => {
      const newLati = [...prev.lati]
      const l = { ...newLati[selLato] }
      l.elementi = l.elementi.filter(e => e.id !== elId)
      newLati[selLato] = l
      return { ...prev, lati: newLati }
    })
  }

  const updateElemento = (elId, changes) => {
    onUpdate(prev => {
      const newLati = [...prev.lati]
      const l = { ...newLati[selLato] }
      l.elementi = l.elementi.map(e => e.id === elId ? { ...e, ...changes } : e)
      newLati[selLato] = l
      return { ...prev, lati: newLati }
    })
  }

  const handleSvgClick = (e) => {
    if (!addMode) return
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const mx = (e.clientX - rect.left - padX) / scaleX
    addElemento(addMode, Math.round(mx / 50) * 50, Math.round(lato.lunghezza * 0.25 / 50) * 50)
    setAddMode(null)
  }

  return (
    <div style={{ height: "100%", display: "flex" }}>
      {/* LEFT — Lato list */}
      <div style={{ width: 220, borderRight: `1px solid ${DS.bdr}`, background: DS.card, overflowY: "auto" }}>
        <div style={{ padding: "16px 16px 8px", fontSize: 11, fontWeight: 700, color: DS.sub, textTransform: "uppercase", letterSpacing: 1 }}>
          Lati ({struttura.lati.length})
        </div>
        {struttura.lati.map((l, i) => (
          <div key={l.id} onClick={() => setSelLato(i)}
            style={{
              padding: "12px 16px", cursor: "pointer", borderLeft: `3px solid ${selLato === i ? DS.amber : "transparent"}`,
              background: selLato === i ? DS.amberL : "transparent", transition: "all 0.15s",
            }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{l.nome}</div>
            <div style={{ fontSize: 11, color: DS.sub, fontFamily: FONT }}>{l.lunghezza}mm · {l.elementi.length} elementi</div>
          </div>
        ))}

        {/* Mini pianta */}
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: DS.sub, marginBottom: 6 }}>PIANTA</div>
          <svg width={180} height={120} viewBox={`-10 -10 ${struttura.W * 0.04 + 20} ${struttura.D * 0.04 + 20}`}>
            <polygon points={struttura.pianta.map(p => `${p.x * 0.04},${p.y * 0.04}`).join(" ")}
              fill="#f5f4ef" stroke={DS.sub} strokeWidth={1} />
            {struttura.pianta.map((p, i) => {
              const next = struttura.pianta[(i + 1) % struttura.pianta.length]
              const mx = (p.x + next.x) / 2 * 0.04, my = (p.y + next.y) / 2 * 0.04
              return (
                <g key={i}>
                  <line x1={p.x * 0.04} y1={p.y * 0.04} x2={next.x * 0.04} y2={next.y * 0.04}
                    stroke={selLato === i ? DS.amber : DS.sub} strokeWidth={selLato === i ? 3 : 1} />
                  <circle cx={mx} cy={my} r={selLato === i ? 5 : 3} fill={selLato === i ? DS.amber : DS.sub2}
                    style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setSelLato(i) }} />
                  <text x={mx} y={my + 3} textAnchor="middle" fontSize={5} fill="#fff" fontWeight={700} style={{ pointerEvents: "none" }}>{i + 1}</text>
                </g>
              )
            })}
          </svg>
        </div>

        <div style={{ padding: "0 16px 16px" }}>
          <button onClick={onNext}
            style={{ width: "100%", padding: "12px", borderRadius: DS.r, border: "none", background: DS.amber, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Avanti → 3D
          </button>
        </div>
      </div>

      {/* CENTER — Side editor */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Element toolbar */}
        <div style={{ padding: "10px 16px", borderBottom: `1px solid ${DS.bdr}`, background: DS.card, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: DS.sub, marginRight: 8 }}>INSERISCI:</span>
          {ELEMENTI.map(el => (
            <button key={el.id} onClick={() => setAddMode(addMode === el.id ? null : el.id)}
              style={{
                padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                border: addMode === el.id ? `2px solid ${DS.amber}` : `1px solid ${DS.bdr}`,
                background: addMode === el.id ? DS.amberL : DS.bg,
                color: addMode === el.id ? DS.amber : DS.text,
              }}>
              {el.icon} {el.n}
            </button>
          ))}
        </div>

        {addMode && (
          <div style={{ padding: "6px 16px", background: DS.amberL, fontSize: 12, color: DS.amber, fontWeight: 600 }}>
            👆 Clicca sulla parete per posizionare: {ELEMENTI.find(e => e.id === addMode)?.n}
          </div>
        )}

        {/* SVG Side View */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAF5", overflow: "auto" }}>
          <svg width={Math.max(svgW, 400)} height={Math.max(svgH, 300)} onClick={handleSvgClick}
            style={{ cursor: addMode ? "crosshair" : "default" }}>
            {/* Structure frame */}
            <rect x={padX} y={padY} width={sW} height={sH} fill="none" stroke={struttura.colStruct} strokeWidth={6} />

            {/* Ground */}
            <line x1={padX - 20} y1={padY + sH} x2={padX + sW + 20} y2={padY + sH} stroke="#888" strokeWidth={2} />
            <line x1={padX - 20} y1={padY + sH + 4} x2={padX + sW + 20} y2={padY + sH + 4} stroke="#aaa" strokeWidth={1} strokeDasharray="6,3" />

            {/* Elements */}
            {lato.elementi.map(el => {
              const elDef = ELEMENTI.find(e => e.id === el.tipo)
              const ex = padX + el.x * scaleX
              const ey = padY + el.y * scaleY
              const ew = el.w * scaleX
              const eh = el.h * scaleY

              return (
                <g key={el.id}>
                  <rect x={ex} y={ey} width={ew} height={eh}
                    fill={elDef?.color || "#ccc"} fillOpacity={elDef?.opacity || 0.5}
                    stroke={struttura.colStruct} strokeWidth={2} rx={1}
                  />
                  {/* Glass lines for vetro */}
                  {el.tipo.includes("vetro") && (
                    <>
                      <line x1={ex + 4} y1={ey + 4} x2={ex + ew - 4} y2={ey + eh - 4} stroke="#fff" strokeWidth={0.5} opacity={0.4} />
                      <line x1={ex + ew - 4} y1={ey + 4} x2={ex + 4} y2={ey + eh - 4} stroke="#fff" strokeWidth={0.5} opacity={0.4} />
                    </>
                  )}
                  {/* Lamelle lines */}
                  {el.tipo === "lamelle" && Array.from({ length: Math.floor(eh / 12) }).map((_, li) => (
                    <line key={li} x1={ex + 3} y1={ey + li * 12 + 6} x2={ex + ew - 3} y2={ey + li * 12 + 6}
                      stroke={struttura.colStruct} strokeWidth={1.5} opacity={0.5} />
                  ))}
                  {/* Persiana lines */}
                  {el.tipo === "persiana" && Array.from({ length: Math.floor(eh / 8) }).map((_, li) => (
                    <line key={li} x1={ex + 2} y1={ey + li * 8 + 4} x2={ex + ew - 2} y2={ey + li * 8 + 4}
                      stroke="#556B2F" strokeWidth={1} opacity={0.4} />
                  ))}
                  {/* Scorrevole arrows */}
                  {el.tipo === "vetro_scorr" && (
                    <text x={ex + ew / 2} y={ey + eh / 2 + 4} textAnchor="middle" fontSize={16} fill={struttura.colStruct} opacity={0.4}>↔</text>
                  )}
                  {/* Porta handle */}
                  {el.tipo === "porta" && (
                    <circle cx={ex + ew * 0.85} cy={ey + eh * 0.55} r={3} fill={struttura.colStruct} />
                  )}
                  {/* Net pattern */}
                  {el.tipo === "rete" && (
                    <pattern id={`net-${el.id}`} width={6} height={6} patternUnits="userSpaceOnUse">
                      <path d="M0,0 L6,6 M6,0 L0,6" stroke="#999" strokeWidth={0.3} />
                    </pattern>
                  )}
                  {/* Label */}
                  <text x={ex + ew / 2} y={ey - 6} textAnchor="middle" fontSize={9} fontFamily={FONT} fontWeight={600} fill={DS.sub}>
                    {elDef?.n || el.tipo}
                  </text>
                  {/* Dimensions */}
                  <text x={ex + ew / 2} y={ey + eh + 14} textAnchor="middle" fontSize={8} fontFamily={FONT} fill={DS.amber}>
                    {el.w}×{el.h}
                  </text>
                  {/* Delete button */}
                  <circle cx={ex + ew - 2} cy={ey + 2} r={7} fill={DS.red} opacity={0.8} style={{ cursor: "pointer" }}
                    onClick={(e) => { e.stopPropagation(); removeElemento(el.id) }} />
                  <text x={ex + ew - 2} y={ey + 5.5} textAnchor="middle" fontSize={9} fill="#fff" fontWeight={700} style={{ pointerEvents: "none" }}>×</text>
                </g>
              )
            })}

            {/* Width dimension */}
            <g>
              <line x1={padX} y1={padY - 20} x2={padX + sW} y2={padY - 20} stroke={DS.amber} strokeWidth={1} />
              <line x1={padX} y1={padY - 25} x2={padX} y2={padY - 15} stroke={DS.amber} strokeWidth={1} />
              <line x1={padX + sW} y1={padY - 25} x2={padX + sW} y2={padY - 15} stroke={DS.amber} strokeWidth={1} />
              <text x={padX + sW / 2} y={padY - 26} textAnchor="middle" fontSize={12} fontFamily={FONT} fontWeight={700} fill={DS.amber}>
                {lato.lunghezza} mm
              </text>
            </g>

            {/* Height dimension */}
            <g>
              <line x1={padX - 20} y1={padY} x2={padX - 20} y2={padY + sH} stroke={DS.amber} strokeWidth={1} />
              <line x1={padX - 25} y1={padY} x2={padX - 15} y2={padY} stroke={DS.amber} strokeWidth={1} />
              <line x1={padX - 25} y1={padY + sH} x2={padX - 15} y2={padY + sH} stroke={DS.amber} strokeWidth={1} />
              <text x={padX - 30} y={padY + sH / 2} textAnchor="middle" fontSize={12} fontFamily={FONT} fontWeight={700} fill={DS.amber}
                transform={`rotate(-90, ${padX - 30}, ${padY + sH / 2})`}>
                {lato.altezza} mm
              </text>
            </g>

            {/* Side name */}
            <text x={padX + sW / 2} y={20} textAnchor="middle" fontSize={14} fontWeight={800} fill={DS.text}>
              {lato.nome} — Prospetto frontale
            </text>
          </svg>
        </div>

        {/* Element edit bar */}
        {lato.elementi.length > 0 && (
          <div style={{ padding: "10px 16px", borderTop: `1px solid ${DS.bdr}`, background: DS.card, display: "flex", gap: 12, overflowX: "auto" }}>
            {lato.elementi.map(el => {
              const elDef = ELEMENTI.find(e => e.id === el.tipo)
              return (
                <div key={el.id} style={{ display: "flex", gap: 6, alignItems: "center", padding: "6px 10px", borderRadius: 8, border: `1px solid ${DS.bdr}`, background: DS.bg, whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: 14 }}>{elDef?.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{elDef?.n}</span>
                  <input type="number" value={el.x} step={50} onChange={e => updateElemento(el.id, { x: parseInt(e.target.value) || 0 })}
                    style={{ width: 55, padding: "2px 4px", borderRadius: 4, border: `1px solid ${DS.bdr}`, fontSize: 10, fontFamily: FONT, textAlign: "right" }} />
                  <span style={{ fontSize: 9, color: DS.sub }}>x</span>
                  <input type="number" value={el.w} step={50} onChange={e => updateElemento(el.id, { w: parseInt(e.target.value) || 0 })}
                    style={{ width: 55, padding: "2px 4px", borderRadius: 4, border: `1px solid ${DS.bdr}`, fontSize: 10, fontFamily: FONT, textAlign: "right" }} />
                  <span style={{ fontSize: 9, color: DS.sub }}>×</span>
                  <input type="number" value={el.h} step={50} onChange={e => updateElemento(el.id, { h: parseInt(e.target.value) || 0 })}
                    style={{ width: 55, padding: "2px 4px", borderRadius: 4, border: `1px solid ${DS.bdr}`, fontSize: 10, fontFamily: FONT, textAlign: "right" }} />
                  <span style={{ fontSize: 9, color: DS.sub }}>mm</span>
                  <button onClick={() => removeElemento(el.id)}
                    style={{ padding: "2px 6px", borderRadius: 4, border: "none", background: DS.redL, color: DS.red, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✕</button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── FASE 4: 3D RENDERING ─────────────────────────────────────
function Fase3D({ struttura, tipo }) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const [rotating, setRotating] = useState(true)
  const [wireframe, setWireframe] = useState(false)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // Clean previous
    while (container.firstChild) container.removeChild(container.firstChild)

    const width = container.clientWidth
    const height = container.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#F5F4F0")
    scene.fog = new THREE.Fog("#F5F4F0", 15, 30)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    const maxDim = Math.max(struttura.W, struttura.D, struttura.H) / 1000
    camera.position.set(maxDim * 1.8, maxDim * 1.2, maxDim * 1.8)
    camera.lookAt(0, struttura.H / 2000, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambient)
    const sun = new THREE.DirectionalLight(0xffffff, 0.8)
    sun.position.set(5, 8, 5)
    sun.castShadow = true
    sun.shadow.mapSize.width = 2048
    sun.shadow.mapSize.height = 2048
    scene.add(sun)
    const fill = new THREE.DirectionalLight(0x8888ff, 0.2)
    fill.position.set(-3, 4, -3)
    scene.add(fill)

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(20, 20)
    const groundMat = new THREE.MeshLambertMaterial({ color: 0xE8E6DE })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Grid
    const grid = new THREE.GridHelper(10, 20, 0xD0CCC0, 0xE0DCD4)
    grid.position.y = 0.001
    scene.add(grid)

    // Structure color
    const structColor = new THREE.Color(struttura.colStruct)
    const structMat = new THREE.MeshPhongMaterial({ color: structColor, wireframe })

    // Build structure from pianta
    const pts = struttura.pianta
    const scale3D = 1 / 1000 // mm to meters
    const H = struttura.H * scale3D
    const postSize = 0.06 // 60mm posts
    const beamSize = 0.05

    // Vertical posts at each vertex
    const postGeo = new THREE.BoxGeometry(postSize, H, postSize)
    pts.forEach(p => {
      const post = new THREE.Mesh(postGeo, structMat)
      post.position.set(p.x * scale3D, H / 2, p.y * scale3D)
      post.castShadow = true
      scene.add(post)
    })

    // Horizontal beams (top) connecting posts
    pts.forEach((p, i) => {
      const next = pts[(i + 1) % pts.length]
      const dx = (next.x - p.x) * scale3D
      const dz = (next.y - p.y) * scale3D
      const len = Math.sqrt(dx * dx + dz * dz)
      const angle = Math.atan2(dz, dx)

      // Top beam
      const beamGeo = new THREE.BoxGeometry(len, beamSize, beamSize)
      const beam = new THREE.Mesh(beamGeo, structMat)
      beam.position.set(
        (p.x + next.x) / 2 * scale3D,
        H - beamSize / 2,
        (p.y + next.y) / 2 * scale3D
      )
      beam.rotation.y = -angle
      beam.castShadow = true
      scene.add(beam)

      // Bottom beam
      const beamB = new THREE.Mesh(beamGeo, structMat.clone())
      beamB.material.color = structColor
      beamB.position.set(
        (p.x + next.x) / 2 * scale3D,
        beamSize / 2,
        (p.y + next.y) / 2 * scale3D
      )
      beamB.rotation.y = -angle
      scene.add(beamB)
    })

    // Wall elements (from lati)
    struttura.lati.forEach((lato, li) => {
      const p = lato.fromPt, next = lato.toPt
      const dx = (next.x - p.x) * scale3D
      const dz = (next.y - p.y) * scale3D
      const wallLen = Math.sqrt(dx * dx + dz * dz)
      const angle = Math.atan2(dz, dx)

      lato.elementi.forEach(el => {
        const elDef = ELEMENTI.find(e => e.id === el.tipo)
        if (!elDef || el.tipo === "vuoto") return

        const elW = el.w * scale3D
        const elH = el.h * scale3D
        const elX = el.x * scale3D + elW / 2
        const elY = el.y * scale3D + elH / 2

        // Position along the wall
        const t = elX / wallLen
        const wx = p.x * scale3D + dx * t
        const wz = p.y * scale3D + dz * t

        let mat
        if (el.tipo.includes("vetro")) {
          mat = new THREE.MeshPhysicalMaterial({
            color: 0xA8D8EA, transparent: true, opacity: 0.3,
            roughness: 0, metalness: 0.1, wireframe,
          })
        } else if (el.tipo === "porta") {
          mat = new THREE.MeshPhongMaterial({ color: 0xC4A882, wireframe })
        } else if (el.tipo === "pannello") {
          mat = new THREE.MeshPhongMaterial({ color: structColor, wireframe })
        } else if (el.tipo === "lamelle") {
          // Create multiple lamelle
          const nLam = Math.floor(elH / 0.08)
          for (let j = 0; j < nLam; j++) {
            const lamGeo = new THREE.BoxGeometry(elW, 0.02, 0.04)
            const lam = new THREE.Mesh(lamGeo, new THREE.MeshPhongMaterial({ color: structColor, wireframe }))
            const ly = j * 0.08 + 0.04
            lam.position.set(wx, ly, wz)
            lam.rotation.y = -angle
            lam.castShadow = true
            scene.add(lam)
          }
          return
        } else {
          mat = new THREE.MeshPhongMaterial({ color: new THREE.Color(elDef.color), transparent: true, opacity: elDef.opacity, wireframe })
        }

        const panelGeo = new THREE.BoxGeometry(elW, elH, 0.01)
        const panel = new THREE.Mesh(panelGeo, mat)
        panel.position.set(wx, elY, wz)
        panel.rotation.y = -angle
        panel.castShadow = true
        scene.add(panel)
      })
    })

    // Roof
    if (tipo.hasRoof && struttura.roofType !== "none") {
      const xs = pts.map(p => p.x * scale3D)
      const zs = pts.map(p => p.y * scale3D)
      const minRX = Math.min(...xs) - 0.05
      const maxRX = Math.max(...xs) + 0.05
      const minRZ = Math.min(...zs) - 0.05
      const maxRZ = Math.max(...zs) + 0.05
      const rW = maxRX - minRX, rD = maxRZ - minRZ

      if (struttura.roofType === "lamelle") {
        const nBeams = Math.floor(rD / 0.15)
        for (let i = 0; i <= nBeams; i++) {
          const bGeo = new THREE.BoxGeometry(rW, 0.008, 0.12)
          const bMat = new THREE.MeshPhongMaterial({ color: structColor, wireframe })
          const b = new THREE.Mesh(bGeo, bMat)
          b.position.set((minRX + maxRX) / 2, H + 0.004, minRZ + i * (rD / nBeams))
          b.castShadow = true
          scene.add(b)
        }
      } else if (struttura.roofType === "vetro") {
        const roofGeo = new THREE.BoxGeometry(rW, 0.01, rD)
        const roofMat = new THREE.MeshPhysicalMaterial({ color: 0xA8D8EA, transparent: true, opacity: 0.25, roughness: 0, wireframe })
        const roof = new THREE.Mesh(roofGeo, roofMat)
        roof.position.set((minRX + maxRX) / 2, H, (minRZ + maxRZ) / 2)
        scene.add(roof)
      } else if (struttura.roofType === "pannello" || struttura.roofType === "policarbonato") {
        const roofGeo = new THREE.BoxGeometry(rW, 0.015, rD)
        const roofMat = new THREE.MeshPhongMaterial({
          color: struttura.roofType === "policarbonato" ? 0xE0E0D0 : structColor,
          transparent: struttura.roofType === "policarbonato", opacity: 0.7, wireframe,
        })
        const roof = new THREE.Mesh(roofGeo, roofMat)
        roof.position.set((minRX + maxRX) / 2, H, (minRZ + maxRZ) / 2)
        roof.castShadow = true
        scene.add(roof)
      }
    }

    // Center scene
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length * scale3D
    const cz = pts.reduce((s, p) => s + p.y, 0) / pts.length * scale3D
    scene.children.forEach(obj => {
      if (obj !== ground && obj !== grid && !(obj instanceof THREE.Light)) {
        obj.position.x -= cx
        obj.position.z -= cz
      }
    })
    camera.lookAt(0, H / 2, 0)

    // Simple orbit
    let theta = Math.PI / 4, phi = Math.PI / 4, dist = maxDim * 2.5
    let isDragging = false, lastX = 0, lastY = 0

    const onDown = (e) => { isDragging = true; lastX = e.clientX; lastY = e.clientY }
    const onUp = () => { isDragging = false }
    const onMove = (e) => {
      if (!isDragging) return
      theta -= (e.clientX - lastX) * 0.005
      phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.01, phi - (e.clientY - lastY) * 0.005))
      lastX = e.clientX; lastY = e.clientY
    }
    const onWheel = (e) => { dist = Math.max(1, Math.min(15, dist + e.deltaY * 0.003)) }

    renderer.domElement.addEventListener("mousedown", onDown)
    renderer.domElement.addEventListener("mouseup", onUp)
    renderer.domElement.addEventListener("mousemove", onMove)
    renderer.domElement.addEventListener("wheel", onWheel)

    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)
      if (rotating && !isDragging) theta += 0.003
      camera.position.set(
        dist * Math.sin(phi) * Math.cos(theta),
        dist * Math.cos(phi),
        dist * Math.sin(phi) * Math.sin(theta)
      )
      camera.lookAt(0, H / 2, 0)
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", onResize)
      renderer.domElement.removeEventListener("mousedown", onDown)
      renderer.domElement.removeEventListener("mouseup", onUp)
      renderer.domElement.removeEventListener("mousemove", onMove)
      renderer.domElement.removeEventListener("wheel", onWheel)
      renderer.dispose()
    }
  }, [struttura, tipo, wireframe, rotating])

  return (
    <div style={{ height: "100%", position: "relative" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      {/* Controls overlay */}
      <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 8 }}>
        <button onClick={() => setRotating(!rotating)}
          style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${DS.bdr}`, background: DS.card, fontSize: 12, fontWeight: 600, cursor: "pointer", boxShadow: DS.shadow }}>
          {rotating ? "⏸ Ferma" : "▶ Ruota"}
        </button>
        <button onClick={() => setWireframe(!wireframe)}
          style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${DS.bdr}`, background: DS.card, fontSize: 12, fontWeight: 600, cursor: "pointer", boxShadow: DS.shadow }}>
          {wireframe ? "◼ Solido" : "◻ Wireframe"}
        </button>
      </div>

      {/* Info overlay */}
      <div style={{ position: "absolute", bottom: 16, left: 16, padding: "12px 16px", borderRadius: DS.r, background: "rgba(255,255,255,0.95)", boxShadow: DS.shadow, maxWidth: 300 }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{tipo.icon} {tipo.n}</div>
        <div style={{ fontSize: 11, color: DS.sub, fontFamily: FONT }}>
          {struttura.W}×{struttura.D}×{struttura.H}mm · {struttura.lati.length} lati · {struttura.lati.reduce((s, l) => s + l.elementi.length, 0)} elementi
        </div>
        <div style={{ fontSize: 11, color: DS.sub, marginTop: 4 }}>
          🖱️ Trascina per ruotare · Scroll per zoom
        </div>
      </div>

      {/* Riepilogo lati */}
      <div style={{ position: "absolute", top: 16, right: 16, padding: "12px 16px", borderRadius: DS.r, background: "rgba(255,255,255,0.95)", boxShadow: DS.shadow, maxWidth: 200 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: DS.sub, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Riepilogo lati</div>
        {struttura.lati.map((l, i) => (
          <div key={l.id} style={{ fontSize: 11, marginBottom: 3, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600 }}>{l.nome}</span>
            <span style={{ fontFamily: FONT, color: DS.sub, fontSize: 10 }}>{l.lunghezza}mm · {l.elementi.length}el</span>
          </div>
        ))}
      </div>
    </div>
  )
}

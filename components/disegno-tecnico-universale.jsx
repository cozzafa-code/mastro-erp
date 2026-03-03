import { useState, useRef, useEffect, useCallback } from "react"

// ═══ MASTRO DS ═══
const C = {
  bg: "#F2F1EC", card: "#fff", tx: "#1A1A1C", sub: "#8E8E93",
  acc: "#D08008", accLt: "#D0800815", grn: "#1A9E73", red: "#DC4444",
  blu: "#3B7FE0", pur: "#8B5CF6", bdr: "#E5E5E7", teal: "#0D9488",
  wall: "#3A3A3C", wallF: "#E5E4DF", glass: "#D6EEFF", steel: "#8899AA",
}
const FF = "'Inter',system-ui,sans-serif"
const FM = "'JetBrains Mono',monospace"

// ═══ TEMPLATE DEFINITIONS ═══
const TEMPLATES = [
  { id: "finestra", icon: "🪟", label: "Finestra", cat: "Serramenti",
    dims: { w: 1200, h: 1400, profMuro: 350, spSx: 120, spDx: 120, arch: 80, davH: 40, davSporg: 30, cassH: 0, cassP: 0 },
    frontColor: C.glass, frontStroke: C.blu },
  { id: "porta", icon: "🚪", label: "Porta", cat: "Serramenti",
    dims: { w: 900, h: 2200, profMuro: 350, spSx: 100, spDx: 100, arch: 80, davH: 0, davSporg: 0, cassH: 0, cassP: 0 },
    frontColor: C.acc + "15", frontStroke: C.acc },
  { id: "portafinestra", icon: "🚪", label: "Portafinestra", cat: "Serramenti",
    dims: { w: 1400, h: 2200, profMuro: 350, spSx: 120, spDx: 120, arch: 80, davH: 0, davSporg: 0, cassH: 250, cassP: 300 },
    frontColor: C.glass, frontStroke: C.blu },
  { id: "boxcaldaia", icon: "🔥", label: "Box caldaia", cat: "Vani tecnici",
    dims: { w: 800, h: 1200, d: 600, profMuro: 200, spSx: 0, spDx: 0, arch: 0, davH: 0, davSporg: 0, cassH: 0, cassP: 0 },
    frontColor: "#FEE2E2", frontStroke: C.red },
  { id: "nicchia", icon: "🕳️", label: "Nicchia", cat: "Vani tecnici",
    dims: { w: 600, h: 900, d: 400, profMuro: 300, spSx: 0, spDx: 0, arch: 0, davH: 0, davSporg: 0, cassH: 0, cassP: 0 },
    frontColor: "#F3F4F6", frontStroke: C.sub },
  { id: "pergola", icon: "🌿", label: "Pergola bioclimatica", cat: "Strutture esterne",
    dims: { w: 4000, h: 3000, d: 3500, profMuro: 0, pilastro: 120, traverso: 80, lamelle: 40, pendenza: 2, spSx: 0, spDx: 0, arch: 0, davH: 0, davSporg: 0, cassH: 0, cassP: 0 },
    frontColor: "#ECFDF5", frontStroke: C.grn },
  { id: "tettoia", icon: "🏠", label: "Tettoia / Pensilina", cat: "Strutture esterne",
    dims: { w: 3000, h: 2800, d: 2000, profMuro: 0, pilastro: 100, pendenza: 5, spSx: 0, spDx: 0, arch: 0, davH: 0, davSporg: 0, cassH: 0, cassP: 0 },
    frontColor: "#FEF3C7", frontStroke: C.acc },
  { id: "veranda", icon: "🏡", label: "Veranda / Serra", cat: "Chiusure",
    dims: { w: 3600, h: 2600, d: 2400, profMuro: 200, pilastro: 80, muretto: 900, spSx: 0, spDx: 0, arch: 0, davH: 0, davSporg: 0, cassH: 0, cassP: 0 },
    frontColor: C.glass + "80", frontStroke: C.teal },
  { id: "chiusura_balcone", icon: "🏢", label: "Chiusura balcone", cat: "Chiusure",
    dims: { w: 3000, h: 2400, d: 1200, profMuro: 200, pilastro: 60, muretto: 1000, parapetto: 1100, spSx: 0, spDx: 0, arch: 0, davH: 0, davSporg: 0, cassH: 0, cassP: 0 },
    frontColor: C.glass + "60", frontStroke: C.blu },
  { id: "libero", icon: "✏️", label: "Disegno libero", cat: "Altro",
    dims: { w: 2000, h: 2000, d: 1000, profMuro: 300, spSx: 0, spDx: 0, arch: 0, davH: 0, davSporg: 0, cassH: 0, cassP: 0 },
    frontColor: "#F9FAFB", frontStroke: C.sub },
]

// ═══ EDITABLE QUOTA ═══
function Q({ x1, y1, x2, y2, value, color = C.acc, fs = 10, side = "top", onEdit, label }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  useEffect(() => setVal(value), [value])

  const isH = Math.abs(y2 - y1) < Math.abs(x2 - x1)
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
  const ext = 4
  const off = side === "top" || side === "left" ? -13 : 13
  const tx = isH ? mx : mx + off
  const ty = isH ? my + off : my
  const rot = isH ? 0 : -90

  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1} />
      {isH ? <>
        <line x1={x1} y1={y1 - ext} x2={x1} y2={y1 + ext} stroke={color} strokeWidth={1} />
        <line x1={x2} y1={y2 - ext} x2={x2} y2={y2 + ext} stroke={color} strokeWidth={1} />
      </> : <>
        <line x1={x1 - ext} y1={y1} x2={x1 + ext} y2={y1} stroke={color} strokeWidth={1} />
        <line x1={x2 - ext} y1={y2} x2={x2 + ext} y2={y2} stroke={color} strokeWidth={1} />
      </>}
      {editing ? (
        <foreignObject x={tx - 30} y={ty - 10} width={60} height={20}>
          <input autoFocus type="number" value={val}
            onChange={e => setVal(e.target.value)}
            onBlur={() => { setEditing(false); onEdit?.(parseInt(val) || 0); }}
            onKeyDown={e => e.key === "Enter" && (setEditing(false), onEdit?.(parseInt(val) || 0))}
            style={{ width: "100%", height: "100%", border: `1.5px solid ${color}`, borderRadius: 3, textAlign: "center", fontSize: 10, fontWeight: 700, fontFamily: FM, background: "#fff", color: C.tx, outline: "none", padding: 0 }} />
        </foreignObject>
      ) : (
        <g onClick={() => onEdit && setEditing(true)} style={onEdit ? { cursor: "pointer" } : undefined}>
          {value ? (
            <text x={tx} y={ty + 3} textAnchor="middle" fontSize={fs} fontWeight={700} fontFamily={FM} fill={color}
              transform={rot ? `rotate(${rot},${tx},${ty + 3})` : undefined}>{value}</text>
          ) : (
            <text x={tx} y={ty + 3} textAnchor="middle" fontSize={fs - 1} fontWeight={500} fontFamily={FM} fill={color + "80"}
              transform={rot ? `rotate(${rot},${tx},${ty + 3})` : undefined}>—</text>
          )}
        </g>
      )}
    </g>
  )
}

// ═══ VISTA: PROSPETTO FRONTALE ═══
function VistaProspetto({ tmpl, dims, setD, freeLines, addFreeLine }) {
  const sc = Math.min(0.14, 280 / Math.max(dims.w, dims.h))
  const W = dims.w * sc, H = dims.h * sc
  const spSx = (dims.spSx || 0) * sc, spDx = (dims.spDx || 0) * sc
  const archH = (dims.arch || 0) * sc, davH = dims.davH ? 10 : 0
  const pilW = (dims.pilastro || 0) * sc
  const murH = (dims.muretto || 0) * sc
  const isStruct = ["pergola", "tettoia", "veranda", "chiusura_balcone"].includes(tmpl.id)
  const isVano = ["finestra", "porta", "portafinestra"].includes(tmpl.id)
  const isBox = ["boxcaldaia", "nicchia"].includes(tmpl.id)

  const pad = 55
  const totalW = isVano ? spSx + W + spDx : W
  const totalH = isVano ? archH + H + davH : H
  const svgW = totalW + pad * 2 + 30, svgH = totalH + pad * 2 + 30
  const ox = pad + (isVano ? spSx : 0), oy = pad + (isVano ? archH : 0)

  const [drawMode, setDrawMode] = useState(false)
  const [lineStart, setLineStart] = useState(null)
  const svgRef = useRef(null)

  const getSvgPt = (e) => {
    const r = svgRef.current?.getBoundingClientRect()
    return r ? { x: e.clientX - r.left, y: e.clientY - r.top } : { x: 0, y: 0 }
  }

  const handleClick = (e) => {
    if (!drawMode) return
    const pt = getSvgPt(e)
    if (!lineStart) { setLineStart(pt) }
    else { addFreeLine?.("front", { x1: lineStart.x, y1: lineStart.y, x2: pt.x, y2: pt.y }); setLineStart(null) }
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Mini toolbar */}
      <div style={{ display: "flex", gap: 4, padding: "6px 10px", alignItems: "center", borderBottom: `1px solid ${C.bdr}` }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: C.sub, flex: 1 }}>PROSPETTO FRONTALE</span>
        <div onClick={() => { setDrawMode(!drawMode); setLineStart(null); }}
          style={{ padding: "3px 8px", borderRadius: 5, border: `1px solid ${drawMode ? C.red : C.bdr}`, background: drawMode ? C.red + "12" : C.card, fontSize: 9, fontWeight: 700, color: drawMode ? C.red : C.sub, cursor: "pointer" }}>
          {drawMode ? "✕ Chiudi" : "✏️ Linea"}
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: 8, background: "#FAFAF7" }}>
        <svg ref={svgRef} width={svgW} height={svgH} onClick={handleClick}
          style={{ background: "#fff", borderRadius: 8, border: `1px solid ${C.bdr}`, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", cursor: drawMode ? "crosshair" : "default" }}>

          {/* ═══ VANO (finestra/porta) ═══ */}
          {isVano && <>
            {/* Muro */}
            <rect x={pad} y={pad} width={totalW} height={totalH} fill={C.wallF} stroke={C.wall} strokeWidth={2} rx={1} />
            {/* Spallette */}
            {spSx > 0 && <rect x={pad} y={pad} width={spSx} height={totalH} fill={C.wall + "20"} stroke={C.wall} strokeWidth={1} />}
            {spDx > 0 && <rect x={pad + spSx + W} y={pad} width={spDx} height={totalH} fill={C.wall + "20"} stroke={C.wall} strokeWidth={1} />}
            {/* Architrave */}
            {archH > 0 && <rect x={pad} y={pad} width={totalW} height={archH} fill={C.wall + "15"} stroke={C.wall} strokeWidth={1} />}
            {/* Davanzale */}
            {davH > 0 && <rect x={pad - 4} y={oy + H} width={totalW + 8} height={davH} rx={1} fill={C.acc + "20"} stroke={C.acc} strokeWidth={1.2} />}
            {/* Luce */}
            <rect x={ox} y={oy} width={W} height={H} fill={tmpl.frontColor} stroke={tmpl.frontStroke} strokeWidth={1} strokeDasharray="4,2" rx={1} />
            <line x1={ox} y1={oy + H / 2} x2={ox + W} y2={oy + H / 2} stroke={tmpl.frontStroke + "25"} strokeWidth={0.5} strokeDasharray="2,2" />
            <line x1={ox + W / 2} y1={oy} x2={ox + W / 2} y2={oy + H} stroke={tmpl.frontStroke + "25"} strokeWidth={0.5} strokeDasharray="2,2" />
            {/* Quote */}
            <Q x1={ox} y1={pad - 18} x2={ox + W} y2={pad - 18} value={dims.w} color={C.acc} fs={10} side="top" onEdit={v => setD("w", v)} />
            <Q x1={pad - 18} y1={oy} x2={pad - 18} y2={oy + H} value={dims.h} color={C.acc} fs={10} side="left" onEdit={v => setD("h", v)} />
            {spSx > 0 && <Q x1={pad} y1={oy + H + davH + 14} x2={ox} y2={oy + H + davH + 14} value={dims.spSx} color={C.pur} fs={8} side="bottom" onEdit={v => setD("spSx", v)} />}
            {spDx > 0 && <Q x1={ox + W} y1={oy + H + davH + 14} x2={pad + totalW} y2={oy + H + davH + 14} value={dims.spDx} color={C.pur} fs={8} side="bottom" onEdit={v => setD("spDx", v)} />}
            {archH > 0 && <Q x1={pad + totalW + 14} y1={pad} x2={pad + totalW + 14} y2={oy} value={dims.arch} color={C.pur} fs={8} side="right" onEdit={v => setD("arch", v)} />}
            <text x={ox + W / 2} y={oy + H / 2 + 3} textAnchor="middle" fontSize={8} fill={tmpl.frontStroke + "50"} fontFamily={FM}>LUCE</text>
          </>}

          {/* ═══ STRUTTURE ESTERNE (pergola/tettoia) ═══ */}
          {(tmpl.id === "pergola" || tmpl.id === "tettoia") && <>
            {/* Pilastri */}
            <rect x={pad} y={pad} width={pilW} height={H} fill={C.steel + "40"} stroke={C.steel} strokeWidth={1.5} />
            <rect x={pad + W - pilW} y={pad} width={pilW} height={H} fill={C.steel + "40"} stroke={C.steel} strokeWidth={1.5} />
            {/* Traverso superiore */}
            <rect x={pad} y={pad} width={W} height={pilW * 0.6} fill={tmpl.frontColor} stroke={tmpl.frontStroke} strokeWidth={1.5} rx={1} />
            {/* Lamelle/copertura */}
            {tmpl.id === "pergola" && Array.from({ length: Math.max(2, Math.floor(W / 30)) }).map((_, i, a) => {
              const lx = pad + pilW + (i * (W - pilW * 2)) / (a.length - 1)
              return <line key={i} x1={lx} y1={pad + pilW * 0.6} x2={lx} y2={pad + pilW * 0.6 + 6} stroke={C.grn} strokeWidth={2} />
            })}
            {/* Luce apertura */}
            <rect x={pad + pilW} y={pad + pilW * 0.6} width={W - pilW * 2} height={H - pilW * 0.6}
              fill="none" stroke={tmpl.frontStroke + "40"} strokeWidth={0.8} strokeDasharray="4,2" />
            {/* Quote */}
            <Q x1={pad} y1={pad - 18} x2={pad + W} y2={pad - 18} value={dims.w} color={C.acc} fs={10} side="top" onEdit={v => setD("w", v)} />
            <Q x1={pad - 18} y1={pad} x2={pad - 18} y2={pad + H} value={dims.h} color={C.acc} fs={10} side="left" onEdit={v => setD("h", v)} />
            {/* Pilastro quota */}
            <Q x1={pad} y1={pad + H + 14} x2={pad + pilW} y2={pad + H + 14} value={dims.pilastro} color={C.steel} fs={8} side="bottom" onEdit={v => setD("pilastro", v)} />
            <text x={pad + W / 2} y={pad + H / 2} textAnchor="middle" fontSize={9} fill={tmpl.frontStroke + "40"} fontFamily={FM}>{tmpl.label.toUpperCase()}</text>
          </>}

          {/* ═══ VERANDA / CHIUSURA BALCONE ═══ */}
          {(tmpl.id === "veranda" || tmpl.id === "chiusura_balcone") && <>
            {/* Muretto base */}
            {murH > 0 && <rect x={pad} y={pad + H - murH} width={W} height={murH} fill={C.wallF} stroke={C.wall} strokeWidth={1.5} />}
            {/* Pilastri */}
            <rect x={pad} y={pad} width={pilW} height={H} fill={C.steel + "40"} stroke={C.steel} strokeWidth={1.5} />
            <rect x={pad + W - pilW} y={pad} width={pilW} height={H} fill={C.steel + "40"} stroke={C.steel} strokeWidth={1.5} />
            {/* Traverso sup */}
            <rect x={pad} y={pad} width={W} height={pilW * 0.5} fill={C.steel + "25"} stroke={C.steel} strokeWidth={1} />
            {/* Vetrate */}
            <rect x={pad + pilW} y={pad + pilW * 0.5} width={W - pilW * 2} height={H - murH - pilW * 0.5}
              fill={C.glass + "60"} stroke={C.teal} strokeWidth={1} strokeDasharray="4,2" />
            {/* Montanti vetro */}
            {Array.from({ length: Math.max(1, Math.floor((W - pilW * 2) / 80)) }).map((_, i, a) => {
              if (i === 0) return null
              const mx = pad + pilW + (i * (W - pilW * 2)) / a.length
              return <line key={i} x1={mx} y1={pad + pilW * 0.5} x2={mx} y2={pad + H - murH} stroke={C.teal + "60"} strokeWidth={1} />
            })}
            {/* Quote */}
            <Q x1={pad} y1={pad - 18} x2={pad + W} y2={pad - 18} value={dims.w} color={C.acc} fs={10} side="top" onEdit={v => setD("w", v)} />
            <Q x1={pad - 18} y1={pad} x2={pad - 18} y2={pad + H} value={dims.h} color={C.acc} fs={10} side="left" onEdit={v => setD("h", v)} />
            {murH > 0 && <Q x1={pad + W + 14} y1={pad + H - murH} x2={pad + W + 14} y2={pad + H} value={dims.muretto} color={C.wall} fs={8} side="right" onEdit={v => setD("muretto", v)} />}
            <text x={pad + W / 2} y={pad + H / 2} textAnchor="middle" fontSize={9} fill={tmpl.frontStroke + "40"} fontFamily={FM}>{tmpl.label.toUpperCase()}</text>
          </>}

          {/* ═══ BOX / NICCHIA ═══ */}
          {isBox && <>
            <rect x={pad} y={pad} width={W} height={H} fill={tmpl.frontColor} stroke={tmpl.frontStroke} strokeWidth={2} rx={2} />
            {/* Hatch */}
            {Array.from({ length: Math.ceil(W / 12) }).map((_, i) => (
              <line key={i} x1={pad + i * 12} y1={pad} x2={pad + i * 12 + H * 0.3} y2={pad + H} stroke={tmpl.frontStroke + "15"} strokeWidth={0.5} />
            ))}
            <rect x={pad + 8} y={pad + 8} width={W - 16} height={H - 16} fill="none" stroke={tmpl.frontStroke + "40"} strokeWidth={0.8} strokeDasharray="3,2" />
            <Q x1={pad} y1={pad - 18} x2={pad + W} y2={pad - 18} value={dims.w} color={C.acc} fs={10} side="top" onEdit={v => setD("w", v)} />
            <Q x1={pad - 18} y1={pad} x2={pad - 18} y2={pad + H} value={dims.h} color={C.acc} fs={10} side="left" onEdit={v => setD("h", v)} />
            <text x={pad + W / 2} y={pad + H / 2 + 3} textAnchor="middle" fontSize={9} fill={tmpl.frontStroke + "60"} fontFamily={FM}>{tmpl.label.toUpperCase()}</text>
          </>}

          {/* ═══ LIBERO ═══ */}
          {tmpl.id === "libero" && <>
            <rect x={pad} y={pad} width={W} height={H} fill="none" stroke={C.sub + "40"} strokeWidth={1} strokeDasharray="4,2" />
            <Q x1={pad} y1={pad - 18} x2={pad + W} y2={pad - 18} value={dims.w} color={C.acc} fs={10} side="top" onEdit={v => setD("w", v)} />
            <Q x1={pad - 18} y1={pad} x2={pad - 18} y2={pad + H} value={dims.h} color={C.acc} fs={10} side="left" onEdit={v => setD("h", v)} />
            <text x={pad + W / 2} y={pad + H / 2} textAnchor="middle" fontSize={10} fill={C.sub + "40"} fontFamily={FM}>DISEGNO LIBERO</text>
          </>}

          {/* Free lines overlay */}
          {(freeLines || []).filter(l => l.view === "front").map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={C.red} strokeWidth={1.5} />
          ))}
          {lineStart && <circle cx={lineStart.x} cy={lineStart.y} r={3} fill={C.red} />}
        </svg>
      </div>
    </div>
  )
}

// ═══ VISTA: PIANTA DALL'ALTO ═══
function VistaPianta({ tmpl, dims, setD, freeLines, addFreeLine }) {
  const sc = Math.min(0.12, 240 / Math.max(dims.w, dims.d || dims.w))
  const W = dims.w * sc, D = (dims.d || dims.profMuro || 600) * sc
  const wallT = (dims.profMuro || 300) * sc
  const pilW = (dims.pilastro || 0) * sc
  const isVano = ["finestra", "porta", "portafinestra"].includes(tmpl.id)
  const isStruct = ["pergola", "tettoia", "veranda", "chiusura_balcone"].includes(tmpl.id)
  const isBox = ["boxcaldaia", "nicchia"].includes(tmpl.id)

  const pad = 50
  const svgW = Math.max(W, D) + pad * 2 + 40, svgH = D + pad * 2 + 40

  const [drawMode, setDrawMode] = useState(false)
  const [lineStart, setLineStart] = useState(null)
  const svgRef = useRef(null)
  const getSvgPt = (e) => { const r = svgRef.current?.getBoundingClientRect(); return r ? { x: e.clientX - r.left, y: e.clientY - r.top } : { x: 0, y: 0 } }
  const handleClick = (e) => { if (!drawMode) return; const pt = getSvgPt(e); if (!lineStart) setLineStart(pt); else { addFreeLine?.("plan", { x1: lineStart.x, y1: lineStart.y, x2: pt.x, y2: pt.y }); setLineStart(null); } }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 4, padding: "6px 10px", alignItems: "center", borderBottom: `1px solid ${C.bdr}` }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: C.sub, flex: 1 }}>PIANTA DALL'ALTO</span>
        <div onClick={() => { setDrawMode(!drawMode); setLineStart(null); }}
          style={{ padding: "3px 8px", borderRadius: 5, border: `1px solid ${drawMode ? C.red : C.bdr}`, background: drawMode ? C.red + "12" : C.card, fontSize: 9, fontWeight: 700, color: drawMode ? C.red : C.sub, cursor: "pointer" }}>
          {drawMode ? "✕ Chiudi" : "✏️ Linea"}
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: 8, background: "#FAFAF7" }}>
        <svg ref={svgRef} width={svgW} height={svgH} onClick={handleClick}
          style={{ background: "#fff", borderRadius: 8, border: `1px solid ${C.bdr}`, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", cursor: drawMode ? "crosshair" : "default" }}>

          {isVano && <>
            {/* Muro pieno in pianta */}
            <rect x={pad} y={pad} width={W} height={wallT} fill={C.wallF} stroke={C.wall} strokeWidth={2} />
            {/* Hatch */}
            {Array.from({ length: Math.ceil(W / 8) }).map((_, i) => (
              <line key={i} x1={pad + i * 8} y1={pad} x2={pad + i * 8 + wallT * 0.6} y2={pad + wallT} stroke={C.wall + "18"} strokeWidth={0.5} />
            ))}
            {/* Apertura */}
            <rect x={pad + (W - dims.w * sc) / 2 + (dims.spSx || 0) * sc} y={pad} width={(dims.w - (dims.spSx || 0) - (dims.spDx || 0)) * sc} height={wallT}
              fill={C.glass + "50"} stroke={C.blu} strokeWidth={1} strokeDasharray="3,2" />
            {/* INT/EST labels */}
            <text x={pad + W / 2} y={pad - 8} textAnchor="middle" fontSize={8} fill={C.red} fontWeight={700} fontFamily={FM}>ESTERNO</text>
            <text x={pad + W / 2} y={pad + wallT + 16} textAnchor="middle" fontSize={8} fill={C.blu} fontWeight={700} fontFamily={FM}>INTERNO</text>
            {/* Quote */}
            <Q x1={pad} y1={pad + wallT + 28} x2={pad + W} y2={pad + wallT + 28} value={dims.w} color={C.acc} fs={10} side="bottom" onEdit={v => setD("w", v)} />
            <Q x1={pad - 16} y1={pad} x2={pad - 16} y2={pad + wallT} value={dims.profMuro} color={C.wall} fs={9} side="left" onEdit={v => setD("profMuro", v)} />
          </>}

          {(isStruct || tmpl.id === "veranda" || tmpl.id === "chiusura_balcone") && <>
            {/* Pilastri in pianta */}
            <rect x={pad} y={pad} width={pilW} height={pilW} fill={C.steel + "50"} stroke={C.steel} strokeWidth={1.5} />
            <rect x={pad + W - pilW} y={pad} width={pilW} height={pilW} fill={C.steel + "50"} stroke={C.steel} strokeWidth={1.5} />
            <rect x={pad} y={pad + D - pilW} width={pilW} height={pilW} fill={C.steel + "50"} stroke={C.steel} strokeWidth={1.5} />
            <rect x={pad + W - pilW} y={pad + D - pilW} width={pilW} height={pilW} fill={C.steel + "50"} stroke={C.steel} strokeWidth={1.5} />
            {/* Perimetro */}
            <rect x={pad} y={pad} width={W} height={D} fill="none" stroke={tmpl.frontStroke + "40"} strokeWidth={1} strokeDasharray="4,2" />
            {/* Muretto */}
            {(dims.muretto || 0) > 0 && <rect x={pad} y={pad + D - 8} width={W} height={8} fill={C.wallF} stroke={C.wall} strokeWidth={1} />}
            {/* Quote */}
            <Q x1={pad} y1={pad + D + 18} x2={pad + W} y2={pad + D + 18} value={dims.w} color={C.acc} fs={10} side="bottom" onEdit={v => setD("w", v)} />
            <Q x1={pad - 18} y1={pad} x2={pad - 18} y2={pad + D} value={dims.d} color={C.acc} fs={10} side="left" onEdit={v => setD("d", v)} />
            <text x={pad + W / 2} y={pad + D / 2} textAnchor="middle" fontSize={9} fill={tmpl.frontStroke + "40"} fontFamily={FM}>PIANTA</text>
          </>}

          {isBox && <>
            <rect x={pad} y={pad} width={W} height={D} fill={tmpl.frontColor} stroke={tmpl.frontStroke} strokeWidth={1.5} rx={2} />
            <Q x1={pad} y1={pad + D + 18} x2={pad + W} y2={pad + D + 18} value={dims.w} color={C.acc} fs={10} side="bottom" onEdit={v => setD("w", v)} />
            <Q x1={pad - 18} y1={pad} x2={pad - 18} y2={pad + D} value={dims.d} color={C.acc} fs={10} side="left" onEdit={v => setD("d", v)} />
          </>}

          {tmpl.id === "libero" && <>
            <rect x={pad} y={pad} width={W} height={D} fill="none" stroke={C.sub + "40"} strokeWidth={1} strokeDasharray="4,2" />
            <Q x1={pad} y1={pad + D + 18} x2={pad + W} y2={pad + D + 18} value={dims.w} color={C.acc} fs={10} side="bottom" onEdit={v => setD("w", v)} />
            <Q x1={pad - 18} y1={pad} x2={pad - 18} y2={pad + D} value={dims.d} color={C.acc} fs={10} side="left" onEdit={v => setD("d", v)} />
          </>}

          {(freeLines || []).filter(l => l.view === "plan").map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={C.red} strokeWidth={1.5} />
          ))}
          {lineStart && <circle cx={lineStart.x} cy={lineStart.y} r={3} fill={C.red} />}
        </svg>
      </div>
    </div>
  )
}

// ═══ VISTA: SEZIONE LATERALE ═══
function VistaSezione({ tmpl, dims, setD }) {
  const sc = Math.min(0.16, 200 / Math.max(dims.h, dims.profMuro || 400))
  const H = dims.h * sc
  const wallD = (dims.profMuro || 350) * sc
  const cassH = (dims.cassH || 0) * sc
  const pilW = (dims.pilastro || 0) * sc
  const murH = (dims.muretto || 0) * sc
  const isVano = ["finestra", "porta", "portafinestra"].includes(tmpl.id)
  const isStruct = ["pergola", "tettoia"].includes(tmpl.id)
  const D = (dims.d || 2000) * sc

  const pad = 50
  const svgW = Math.max(wallD, D) + pad * 2 + 60
  const svgH = H + cassH + pad * 2 + 30

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 4, padding: "6px 10px", alignItems: "center", borderBottom: `1px solid ${C.bdr}` }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: C.sub, flex: 1 }}>SEZIONE LATERALE</span>
      </div>
      <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: 8, background: "#FAFAF7" }}>
        <svg width={svgW} height={svgH}
          style={{ background: "#fff", borderRadius: 8, border: `1px solid ${C.bdr}`, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>

          {isVano && <>
            {/* Muro taglio */}
            <rect x={pad} y={pad + cassH} width={wallD} height={H} fill={C.wallF} stroke={C.wall} strokeWidth={2} />
            {Array.from({ length: Math.ceil(wallD / 7) }).map((_, i) => (
              <line key={i} x1={pad + i * 7} y1={pad + cassH} x2={pad + i * 7 + H * 0.2} y2={pad + cassH + H} stroke={C.wall + "18"} strokeWidth={0.5} />
            ))}
            {/* Apertura */}
            <rect x={pad} y={pad + cassH + 15} width={wallD} height={H - 30}
              fill={C.glass + "30"} stroke={C.blu} strokeWidth={0.8} strokeDasharray="3,2" />
            {/* Cassonetto */}
            {cassH > 0 && <>
              <rect x={pad + 3} y={pad} width={wallD - 6} height={cassH} fill="#E8E4D8" stroke={C.wall} strokeWidth={1} strokeDasharray="3,2" rx={2} />
              <text x={pad + wallD / 2} y={pad + cassH / 2 + 3} textAnchor="middle" fontSize={6} fill={C.sub} fontFamily={FM}>CASS.</text>
              <Q x1={pad + wallD + 10} y1={pad} x2={pad + wallD + 10} y2={pad + cassH} value={dims.cassH} color={C.sub} fs={8} side="right" onEdit={v => setD("cassH", v)} />
            </>}
            {/* Davanzale */}
            {dims.davH > 0 && <rect x={pad - 4} y={pad + cassH + H} width={wallD + 8} height={6} rx={1} fill={C.acc + "25"} stroke={C.acc} strokeWidth={1} />}
            {/* INT/EST */}
            <text x={pad - 12} y={pad + cassH + H / 2} textAnchor="middle" fontSize={7} fill={C.blu} fontWeight={700} fontFamily={FM} transform={`rotate(-90,${pad - 12},${pad + cassH + H / 2})`}>INT</text>
            <text x={pad + wallD + 12} y={pad + cassH + H / 2} textAnchor="middle" fontSize={7} fill={C.red} fontWeight={700} fontFamily={FM} transform={`rotate(-90,${pad + wallD + 12},${pad + cassH + H / 2})`}>EST</text>
            {/* Quote */}
            <Q x1={pad} y1={pad + cassH + H + 18} x2={pad + wallD} y2={pad + cassH + H + 18} value={dims.profMuro} color={C.wall} fs={9} side="bottom" onEdit={v => setD("profMuro", v)} />
            <Q x1={pad - 24} y1={pad + cassH} x2={pad - 24} y2={pad + cassH + H} value={dims.h} color={C.acc} fs={9} side="left" />
          </>}

          {(isStruct || tmpl.id === "veranda" || tmpl.id === "chiusura_balcone") && <>
            {/* Pilastro sezione */}
            <rect x={pad} y={pad} width={pilW || 8} height={H} fill={C.steel + "40"} stroke={C.steel} strokeWidth={1.5} />
            {/* Copertura in sezione */}
            <rect x={pad} y={pad} width={D} height={pilW * 0.5 || 6} fill={tmpl.frontColor} stroke={tmpl.frontStroke} strokeWidth={1} />
            {/* Pendenza */}
            {(dims.pendenza || 0) > 0 && <line x1={pad} y1={pad} x2={pad + D} y2={pad + (dims.pendenza || 2) * D / 100} stroke={tmpl.frontStroke} strokeWidth={1.5} />}
            {/* Muretto */}
            {murH > 0 && <rect x={pad + D - 8} y={pad + H - murH} width={8} height={murH} fill={C.wallF} stroke={C.wall} strokeWidth={1} />}
            {/* Quote */}
            <Q x1={pad} y1={pad + H + 18} x2={pad + D} y2={pad + H + 18} value={dims.d} color={C.acc} fs={9} side="bottom" onEdit={v => setD("d", v)} />
            <Q x1={pad - 18} y1={pad} x2={pad - 18} y2={pad + H} value={dims.h} color={C.acc} fs={9} side="left" onEdit={v => setD("h", v)} />
          </>}

          {(["boxcaldaia", "nicchia", "libero"].includes(tmpl.id)) && <>
            <rect x={pad} y={pad} width={(dims.d || 600) * sc} height={H} fill={tmpl.frontColor} stroke={tmpl.frontStroke} strokeWidth={1.5} rx={2} />
            <Q x1={pad} y1={pad + H + 18} x2={pad + (dims.d || 600) * sc} y2={pad + H + 18} value={dims.d || 600} color={C.acc} fs={9} side="bottom" onEdit={v => setD("d", v)} />
            <Q x1={pad - 18} y1={pad} x2={pad - 18} y2={pad + H} value={dims.h} color={C.acc} fs={9} side="left" />
          </>}
        </svg>
      </div>
    </div>
  )
}

// ═══ MAIN ═══
export default function DisegnoTecnicoUniversale() {
  const [tmplId, setTmplId] = useState(null)
  const [dims, setDims] = useState({})
  const [view, setView] = useState("front") // front | plan | side
  const [freeLines, setFreeLines] = useState([])

  const tmpl = TEMPLATES.find(t => t.id === tmplId)
  const setD = (k, v) => setDims(prev => ({ ...prev, [k]: v }))
  const addFreeLine = (viewName, line) => setFreeLines(prev => [...prev, { view: viewName, ...line }])

  // Template chooser
  if (!tmpl) {
    const cats = [...new Set(TEMPLATES.map(t => t.cat))]
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FF }}>
        <div style={{ background: C.tx, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>📐</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Disegno Tecnico</div>
            <div style={{ fontSize: 10, color: "#ffffff70" }}>Scegli cosa misurare</div>
          </div>
        </div>
        <div style={{ padding: "16px 14px" }}>
          {cats.map(cat => (
            <div key={cat} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>{cat}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {TEMPLATES.filter(t => t.cat === cat).map(t => (
                  <div key={t.id} onClick={() => { setTmplId(t.id); setDims({ ...t.dims }); setView("front"); setFreeLines([]); }}
                    style={{ padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${C.bdr}`, background: C.card, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, minWidth: 140, transition: "all 0.15s" }}>
                    <span style={{ fontSize: 20 }}>{t.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.tx }}>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const views = [
    { id: "front", icon: "🪟", label: "Prospetto" },
    { id: "plan", icon: "📐", label: "Pianta" },
    { id: "side", icon: "🔪", label: "Sezione" },
  ]

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: FF, background: C.bg }}>
      {/* Topbar */}
      <div style={{ background: C.tx, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <div onClick={() => setTmplId(null)} style={{ width: 28, height: 28, borderRadius: 7, background: "#ffffff15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer" }}>←</div>
        <span style={{ fontSize: 18 }}>{tmpl.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{tmpl.label}</div>
          <div style={{ fontSize: 9, color: "#ffffff70", fontFamily: FM }}>{dims.w}×{dims.h}{dims.d ? `×${dims.d}` : ""} mm</div>
        </div>
        {freeLines.length > 0 && (
          <div onClick={() => setFreeLines([])}
            style={{ padding: "3px 8px", borderRadius: 5, background: C.red + "20", fontSize: 9, fontWeight: 700, color: C.red, cursor: "pointer" }}>
            🗑 Linee ({freeLines.length})
          </div>
        )}
      </div>

      {/* View tabs */}
      <div style={{ display: "flex", background: C.card, borderBottom: `1px solid ${C.bdr}` }}>
        {views.map(v => (
          <div key={v.id} onClick={() => setView(v.id)}
            style={{ flex: 1, padding: "8px 0", textAlign: "center", cursor: "pointer", borderBottom: `2.5px solid ${view === v.id ? C.acc : "transparent"}`, transition: "all 0.2s" }}>
            <span style={{ fontSize: 14 }}>{v.icon}</span>
            <div style={{ fontSize: 9, fontWeight: view === v.id ? 800 : 500, color: view === v.id ? C.acc : C.sub, marginTop: 1 }}>{v.label}</div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {view === "front" && <VistaProspetto tmpl={tmpl} dims={dims} setD={setD} freeLines={freeLines} addFreeLine={addFreeLine} />}
        {view === "plan" && <VistaPianta tmpl={tmpl} dims={dims} setD={setD} freeLines={freeLines} addFreeLine={addFreeLine} />}
        {view === "side" && <VistaSezione tmpl={tmpl} dims={dims} setD={setD} />}
      </div>

      {/* Quick dims bar */}
      <div style={{ padding: "8px 10px", borderTop: `1px solid ${C.bdr}`, background: C.card, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        {[
          { k: "w", l: "L", show: true },
          { k: "h", l: "H", show: true },
          { k: "d", l: "P", show: !!dims.d || !["finestra", "porta", "portafinestra"].includes(tmpl.id) },
          { k: "profMuro", l: "Muro", show: (dims.profMuro || 0) > 0 },
          { k: "pilastro", l: "Pil.", show: (dims.pilastro || 0) > 0 },
          { k: "muretto", l: "Mur.", show: (dims.muretto || 0) > 0 },
          { k: "spSx", l: "Sp.sx", show: (dims.spSx || 0) > 0 },
          { k: "spDx", l: "Sp.dx", show: (dims.spDx || 0) > 0 },
        ].filter(f => f.show).map(f => (
          <div key={f.k} style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: C.sub, minWidth: 24 }}>{f.l}</span>
            <input type="number" value={dims[f.k] || ""} placeholder="—"
              onChange={e => setD(f.k, parseInt(e.target.value) || 0)}
              style={{ width: 48, padding: "4px 3px", border: `1px solid ${C.bdr}`, borderRadius: 4, fontSize: 10, fontWeight: 700, fontFamily: FM, textAlign: "center" }} />
          </div>
        ))}
      </div>
    </div>
  )
}

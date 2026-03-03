import { useState, useRef, useEffect, useCallback } from "react"
import * as THREE from "three"

// ═══ MASTRO DS ═══
const C = {
  bg: "#F2F1EC", card: "#fff", tx: "#1A1A1C", sub: "#8E8E93",
  acc: "#D08008", accLt: "#D0800815", grn: "#1A9E73", red: "#DC4444",
  blu: "#3B7FE0", pur: "#8B5CF6", bdr: "#E5E5E7", teal: "#0D9488",
  wall: "#3A3A3C", wallF: "#E5E4DF", glass: "#D6EEFF", steel: "#8899AA",
}
const FF = "'Inter',system-ui,sans-serif"
const FM = "'JetBrains Mono',monospace"

// ═══ TEMPLATES ═══
const TEMPLATES = [
  { id:"finestra", icon:"🪟", label:"Finestra", cat:"Serramenti",
    faces:{ front:{label:"Prospetto",color:"#B8D4E8"}, top:{label:"Architrave",color:"#D4CFC4"}, right:{label:"Spalletta DX",color:"#C8C4B8"}, left:{label:"Spalletta SX",color:"#C8C4B8"}, bottom:{label:"Davanzale",color:"#E8D8B0"}, back:{label:"Esterno",color:"#A8C4D8"} },
    dims:{ w:1200, h:1400, d:350, spSx:120, spDx:120, arch:80, davH:40, davSporg:30, cassH:0 }},
  { id:"porta", icon:"🚪", label:"Porta", cat:"Serramenti",
    faces:{ front:{label:"Prospetto",color:"#E8D8C0"}, top:{label:"Architrave",color:"#D4CFC4"}, right:{label:"Spalletta DX",color:"#C8C4B8"}, left:{label:"Spalletta SX",color:"#C8C4B8"}, bottom:{label:"Soglia",color:"#B8B0A0"}, back:{label:"Esterno",color:"#D8C8B0"} },
    dims:{ w:900, h:2200, d:350, spSx:100, spDx:100, arch:80, davH:0, davSporg:0, cassH:0 }},
  { id:"portafinestra", icon:"🚪", label:"Portafinestra", cat:"Serramenti",
    faces:{ front:{label:"Prospetto",color:"#B8D4E8"}, top:{label:"Cassonetto",color:"#D8D4C8"}, right:{label:"Spalletta DX",color:"#C8C4B8"}, left:{label:"Spalletta SX",color:"#C8C4B8"}, bottom:{label:"Soglia",color:"#B8B0A0"}, back:{label:"Esterno",color:"#A8C4D8"} },
    dims:{ w:1400, h:2200, d:350, spSx:120, spDx:120, arch:80, davH:0, davSporg:0, cassH:250 }},
  { id:"boxcaldaia", icon:"🔥", label:"Box caldaia", cat:"Vani tecnici",
    faces:{ front:{label:"Fronte",color:"#F0D0D0"}, top:{label:"Copertura",color:"#D8D4C8"}, right:{label:"Lato DX",color:"#E0D8D0"}, left:{label:"Lato SX",color:"#E0D8D0"}, bottom:{label:"Base",color:"#C8C4B8"}, back:{label:"Retro",color:"#D8D0C8"} },
    dims:{ w:800, h:1200, d:600, spSx:0, spDx:0, arch:0, davH:0, davSporg:0, cassH:0 }},
  { id:"nicchia", icon:"🕳️", label:"Nicchia", cat:"Vani tecnici",
    faces:{ front:{label:"Apertura",color:"#E8E4E0"}, top:{label:"Soffitto",color:"#D8D4C8"}, right:{label:"Lato DX",color:"#D0CCC4"}, left:{label:"Lato SX",color:"#D0CCC4"}, bottom:{label:"Base",color:"#C8C4B8"}, back:{label:"Fondo",color:"#C0BCB4"} },
    dims:{ w:600, h:900, d:400, spSx:0, spDx:0, arch:0, davH:0, davSporg:0, cassH:0 }},
  { id:"pergola", icon:"🌿", label:"Pergola bioclimatica", cat:"Strutture esterne",
    faces:{ front:{label:"Fronte",color:"#C8E8D8"}, top:{label:"Copertura/Lamelle",color:"#B0D8C0"}, right:{label:"Lato DX",color:"#D0E8D8"}, left:{label:"Lato SX",color:"#D0E8D8"}, bottom:{label:"Pavimento",color:"#D8D4C8"}, back:{label:"Parete addossata",color:"#C8C4B8"} },
    dims:{ w:4000, h:3000, d:3500, pilastro:120, traverso:80, pendenza:2, spSx:0, spDx:0, arch:0, davH:0, davSporg:0, cassH:0 }},
  { id:"tettoia", icon:"🏠", label:"Tettoia / Pensilina", cat:"Strutture esterne",
    faces:{ front:{label:"Fronte",color:"#F0E8D0"}, top:{label:"Copertura",color:"#E8E0C8"}, right:{label:"Lato DX",color:"#E0D8C8"}, left:{label:"Lato SX",color:"#E0D8C8"}, bottom:{label:"Pavimento",color:"#D8D4C8"}, back:{label:"Parete",color:"#C8C4B8"} },
    dims:{ w:3000, h:2800, d:2000, pilastro:100, pendenza:5, spSx:0, spDx:0, arch:0, davH:0, davSporg:0, cassH:0 }},
  { id:"veranda", icon:"🏡", label:"Veranda / Serra", cat:"Chiusure",
    faces:{ front:{label:"Vetrata frontale",color:"#C0E0F0"}, top:{label:"Copertura",color:"#D0E8F0"}, right:{label:"Vetrata DX",color:"#C8E0E8"}, left:{label:"Vetrata SX",color:"#C8E0E8"}, bottom:{label:"Muretto/Base",color:"#D8D4C8"}, back:{label:"Parete casa",color:"#C8C4B8"} },
    dims:{ w:3600, h:2600, d:2400, pilastro:80, muretto:900, spSx:0, spDx:0, arch:0, davH:0, davSporg:0, cassH:0 }},
  { id:"chiusura_balcone", icon:"🏢", label:"Chiusura balcone", cat:"Chiusure",
    faces:{ front:{label:"Vetrata frontale",color:"#B8D4E8"}, top:{label:"Soffitto",color:"#D0CCC4"}, right:{label:"Vetrata DX",color:"#C0D8E0"}, left:{label:"Vetrata SX",color:"#C0D8E0"}, bottom:{label:"Parapetto",color:"#C8C0B0"}, back:{label:"Parete int.",color:"#D4D0C8"} },
    dims:{ w:3000, h:2400, d:1200, pilastro:60, muretto:1000, parapetto:1100, spSx:0, spDx:0, arch:0, davH:0, davSporg:0, cassH:0 }},
  { id:"libero", icon:"✏️", label:"Disegno libero", cat:"Altro",
    faces:{ front:{label:"Fronte",color:"#E8E4E0"}, top:{label:"Alto",color:"#D8D4D0"}, right:{label:"Destra",color:"#D0CCC8"}, left:{label:"Sinistra",color:"#D0CCC8"}, bottom:{label:"Basso",color:"#C8C4C0"}, back:{label:"Retro",color:"#C0BCB8"} },
    dims:{ w:2000, h:2000, d:1000, spSx:0, spDx:0, arch:0, davH:0, davSporg:0, cassH:0 }},
]

const FACE_KEYS = ["front","back","left","right","top","bottom"]

// ═══ EDITABLE QUOTA (SVG) ═══
function Q({ x1,y1,x2,y2,value,color=C.acc,fs=10,side="top",onEdit }){
  const [ed,setEd]=useState(false)
  const [val,setVal]=useState(value)
  useEffect(()=>setVal(value),[value])
  const isH=Math.abs(y2-y1)<Math.abs(x2-x1)
  const mx=(x1+x2)/2,my=(y1+y2)/2,ext=4
  const off=side==="top"||side==="left"?-13:13
  const tx=isH?mx:mx+off, ty=isH?my+off:my
  const rot=isH?0:-90
  return <g>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1}/>
    {isH?<><line x1={x1} y1={y1-ext} x2={x1} y2={y1+ext} stroke={color} strokeWidth={1}/><line x1={x2} y1={y2-ext} x2={x2} y2={y2+ext} stroke={color} strokeWidth={1}/></>
    :<><line x1={x1-ext} y1={y1} x2={x1+ext} y2={y1} stroke={color} strokeWidth={1}/><line x1={x2-ext} y1={y2} x2={x2+ext} y2={y2} stroke={color} strokeWidth={1}/></>}
    {ed?<foreignObject x={tx-28} y={ty-10} width={56} height={20}>
      <input autoFocus type="number" value={val} onChange={e=>setVal(e.target.value)}
        onBlur={()=>{setEd(false);onEdit?.(parseInt(val)||0)}}
        onKeyDown={e=>e.key==="Enter"&&(setEd(false),onEdit?.(parseInt(val)||0))}
        style={{width:"100%",height:"100%",border:`1.5px solid ${color}`,borderRadius:3,textAlign:"center",fontSize:10,fontWeight:700,fontFamily:FM,background:"#fff",color:C.tx,outline:"none",padding:0}}/>
    </foreignObject>
    :<text x={tx} y={ty+3} textAnchor="middle" fontSize={fs} fontWeight={700} fontFamily={FM} fill={color}
      transform={rot?`rotate(${rot},${tx},${ty+3})`:undefined}
      onClick={()=>onEdit&&setEd(true)} style={onEdit?{cursor:"pointer"}:undefined}>
      {value||"—"}
    </text>}
  </g>
}

// ═══ THREE.JS 3D VIEW ═══
function Vista3D({ tmpl, dims, setD, faceData, setFaceData, onSelectFace, selectedFace }) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const meshRef = useRef(null)
  const isDown = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const rotation = useRef({ x: -0.4, y: 0.6 })
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())
  const faceMeshes = useRef([])

  // Normalize dims for 3D (max 2 units)
  const maxDim = Math.max(dims.w, dims.h, dims.d || 350)
  const sx = (dims.w / maxDim) * 2
  const sy = (dims.h / maxDim) * 2
  const sz = ((dims.d || 350) / maxDim) * 2

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const w = mount.clientWidth, h = mount.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#FAFAF7")
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
    camera.position.set(3, 2, 3)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    mount.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lights
    const amb = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(amb)
    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(5, 8, 5)
    dir.castShadow = true
    scene.add(dir)
    const fill = new THREE.DirectionalLight(0xffffff, 0.3)
    fill.position.set(-3, 2, -2)
    scene.add(fill)

    // Grid
    const grid = new THREE.GridHelper(6, 12, 0xD0D0D0, 0xE8E8E8)
    grid.position.y = -sy / 2 - 0.01
    scene.add(grid)

    // Build faces
    buildMesh(scene)

    // Render loop
    const animate = () => {
      requestAnimationFrame(animate)
      const r = rotation.current
      camera.position.x = 4 * Math.sin(r.y) * Math.cos(r.x)
      camera.position.y = 4 * Math.sin(r.x) + 0.5
      camera.position.z = 4 * Math.cos(r.y) * Math.cos(r.x)
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      mount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  // Rebuild mesh when dims change
  useEffect(() => {
    if (sceneRef.current) buildMesh(sceneRef.current)
  }, [dims.w, dims.h, dims.d, selectedFace])

  function buildMesh(scene) {
    // Remove old meshes
    faceMeshes.current.forEach(m => scene.remove(m))
    faceMeshes.current = []
    if (meshRef.current) { scene.remove(meshRef.current); meshRef.current = null }

    const maxD = Math.max(dims.w, dims.h, dims.d || 350)
    const bx = (dims.w / maxD) * 2
    const by = (dims.h / maxD) * 2
    const bz = ((dims.d || 350) / maxD) * 2

    // 6 faces as separate planes for raycasting
    const faceConfigs = [
      { key: "front", pos: [0, 0, bz/2], rot: [0, 0, 0], size: [bx, by] },
      { key: "back", pos: [0, 0, -bz/2], rot: [0, Math.PI, 0], size: [bx, by] },
      { key: "right", pos: [bx/2, 0, 0], rot: [0, Math.PI/2, 0], size: [bz, by] },
      { key: "left", pos: [-bx/2, 0, 0], rot: [0, -Math.PI/2, 0], size: [bz, by] },
      { key: "top", pos: [0, by/2, 0], rot: [-Math.PI/2, 0, 0], size: [bx, bz] },
      { key: "bottom", pos: [0, -by/2, 0], rot: [Math.PI/2, 0, 0], size: [bx, bz] },
    ]

    faceConfigs.forEach(fc => {
      const faceInfo = tmpl.faces[fc.key]
      const geo = new THREE.PlaneGeometry(fc.size[0], fc.size[1])
      const isSelected = selectedFace === fc.key
      const hasData = faceData[fc.key] && Object.values(faceData[fc.key]).some(v => v)
      const baseColor = new THREE.Color(faceInfo.color)
      
      const mat = new THREE.MeshPhongMaterial({
        color: isSelected ? new THREE.Color(C.acc) : baseColor,
        transparent: true,
        opacity: isSelected ? 0.85 : hasData ? 0.9 : 0.7,
        side: THREE.DoubleSide,
        shininess: 30,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(...fc.pos)
      mesh.rotation.set(...fc.rot)
      mesh.userData = { faceKey: fc.key }
      scene.add(mesh)
      faceMeshes.current.push(mesh)

      // Edges
      const edgeMat = new THREE.LineBasicMaterial({ color: isSelected ? 0xD08008 : 0x666666, linewidth: 1 })
      const edges = new THREE.EdgesGeometry(geo)
      const line = new THREE.LineSegments(edges, edgeMat)
      line.position.copy(mesh.position)
      line.rotation.copy(mesh.rotation)
      scene.add(line)
      faceMeshes.current.push(line)

      // Label sprite
      const canvas = document.createElement("canvas")
      canvas.width = 256; canvas.height = 64
      const ctx = canvas.getContext("2d")
      ctx.fillStyle = isSelected ? "#D08008" : "#666"
      ctx.font = `bold ${isSelected ? 18 : 14}px Inter, sans-serif`
      ctx.textAlign = "center"
      ctx.fillText(faceInfo.label, 128, 28)
      if (hasData) {
        ctx.fillStyle = "#1A9E73"
        ctx.font = "11px JetBrains Mono, monospace"
        const vals = Object.entries(faceData[fc.key] || {}).filter(([,v]) => v).map(([k,v]) => `${k}:${v}`).join(" ")
        ctx.fillText(vals.substring(0, 30), 128, 48)
      }
      const tex = new THREE.CanvasTexture(canvas)
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true })
      const sprite = new THREE.Sprite(spriteMat)
      sprite.scale.set(0.8, 0.2, 1)
      sprite.position.set(fc.pos[0] * 1.0, fc.pos[1] * 1.0, fc.pos[2] * 1.0)
      scene.add(sprite)
      faceMeshes.current.push(sprite)
    })
  }

  // Mouse handlers for orbit + click
  const handlePointerDown = (e) => {
    isDown.current = true
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }
  const handlePointerMove = (e) => {
    if (!isDown.current) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    rotation.current.y += dx * 0.008
    rotation.current.x = Math.max(-1.2, Math.min(1.2, rotation.current.x - dy * 0.008))
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }
  const handlePointerUp = (e) => {
    const dx = Math.abs(e.clientX - lastMouse.current.x)
    const dy = Math.abs(e.clientY - lastMouse.current.y)
    isDown.current = false
    // If barely moved → it's a click → raycast
    if (dx < 3 && dy < 3) {
      const rect = mountRef.current.getBoundingClientRect()
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.current.setFromCamera(mouse.current, cameraRef.current)
      const planes = faceMeshes.current.filter(m => m.userData?.faceKey)
      const hits = raycaster.current.intersectObjects(planes)
      if (hits.length > 0) {
        onSelectFace(hits[0].object.userData.faceKey)
      }
    }
  }

  return (
    <div style={{ flex: 1, position: "relative" }}>
      <div ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ width: "100%", height: "100%", cursor: "grab", touchAction: "none" }} />
      {/* Legend */}
      <div style={{ position: "absolute", bottom: 8, left: 8, padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.9)", border: `1px solid ${C.bdr}`, fontSize: 9, color: C.sub }}>
        🖱 Trascina per ruotare · Tap su una faccia per misurare
      </div>
      {/* Selected face indicator */}
      {selectedFace && (
        <div style={{ position: "absolute", top: 8, left: 8, padding: "6px 12px", borderRadius: 8, background: C.acc, fontSize: 11, fontWeight: 700, color: "#fff" }}>
          {tmpl.faces[selectedFace]?.label}
        </div>
      )}
    </div>
  )
}

// ═══ FACE DETAIL PANEL ═══
function FacePanel({ tmpl, faceKey, faceData, setFaceData, dims, setD, onClose }) {
  const face = tmpl.faces[faceKey]
  const data = faceData[faceKey] || {}
  const setF = (k, v) => setFaceData(prev => ({ ...prev, [faceKey]: { ...(prev[faceKey] || {}), [k]: v } }))

  // Determine which fields are relevant for this face
  const getFields = () => {
    const isVano = ["finestra","porta","portafinestra"].includes(tmpl.id)
    const isStruct = ["pergola","tettoia","veranda","chiusura_balcone"].includes(tmpl.id)
    
    const common = [{ k:"note", l:"Note", type:"text" }]
    
    if (faceKey === "front") {
      if (isVano) return [{ k:"luce_l",l:"Luce L",u:"mm" },{ k:"luce_h",l:"Luce H",u:"mm" },{ k:"fuori_squadra",l:"Fuori squadra",u:"mm" },{ k:"tipo_apertura",l:"Tipo apertura",type:"text" },...common]
      if (isStruct) return [{ k:"larghezza",l:"Larghezza",u:"mm" },{ k:"altezza",l:"Altezza",u:"mm" },{ k:"n_campate",l:"N° campate" },{ k:"luce_campata",l:"Luce campata",u:"mm" },...common]
      return [{ k:"larghezza",l:"Larghezza",u:"mm" },{ k:"altezza",l:"Altezza",u:"mm" },...common]
    }
    if (faceKey === "back") {
      if (isVano) return [{ k:"tipo_muro",l:"Tipo muro",type:"text" },{ k:"finitura",l:"Finitura esterna",type:"text" },{ k:"ostacoli",l:"Ostacoli",type:"text" },...common]
      return [{ k:"larghezza",l:"Larghezza",u:"mm" },{ k:"altezza",l:"Altezza",u:"mm" },{ k:"addossato",l:"Addossato a muro",type:"check" },...common]
    }
    if (faceKey === "top") {
      if (isVano) return [{ k:"arch_h",l:"Altezza architrave",u:"mm" },{ k:"arch_tipo",l:"Tipo architrave",type:"text" },{ k:"cassH",l:"Cassonetto H",u:"mm" },{ k:"cassP",l:"Cassonetto P",u:"mm" },...common]
      if (isStruct) return [{ k:"tipo_copertura",l:"Tipo copertura",type:"text" },{ k:"pendenza",l:"Pendenza",u:"%" },{ k:"gronda",l:"Gronda sporgenza",u:"mm" },{ k:"lamelle",l:"N° lamelle" },...common]
      return [{ k:"larghezza",l:"Larghezza",u:"mm" },{ k:"profondita",l:"Profondità",u:"mm" },...common]
    }
    if (faceKey === "bottom") {
      if (isVano) return [{ k:"dav_prof",l:"Profondità davanzale",u:"mm" },{ k:"dav_sporg",l:"Sporgenza",u:"mm" },{ k:"dav_mat",l:"Materiale dav.",type:"text" },{ k:"soglia",l:"Soglia H",u:"mm" },...common]
      if (isStruct) return [{ k:"pav_tipo",l:"Tipo pavimento",type:"text" },{ k:"pav_quota",l:"Quota pavimento",u:"mm" },{ k:"muretto_h",l:"Muretto H",u:"mm" },{ k:"parapetto_h",l:"Parapetto H",u:"mm" },...common]
      return [{ k:"larghezza",l:"Larghezza",u:"mm" },{ k:"profondita",l:"Profondità",u:"mm" },...common]
    }
    if (faceKey === "left" || faceKey === "right") {
      if (isVano) return [{ k:"sp_larg",l:"Larghezza spalletta",u:"mm" },{ k:"sp_prof",l:"Profondità",u:"mm" },{ k:"sp_tipo",l:"Tipo muro",type:"text" },{ k:"fuori_piombo",l:"Fuori piombo",u:"mm" },...common]
      if (isStruct) return [{ k:"altezza",l:"Altezza",u:"mm" },{ k:"profondita",l:"Profondità",u:"mm" },{ k:"pilastro",l:"Pilastro sez.",u:"mm" },{ k:"vetrata",l:"Vetrata",type:"check" },...common]
      return [{ k:"altezza",l:"Altezza",u:"mm" },{ k:"profondita",l:"Profondità",u:"mm" },...common]
    }
    return common
  }

  const fields = getFields()
  const filledCount = fields.filter(f => data[f.k]).length

  return (
    <div style={{ borderTop: `2px solid ${C.acc}`, background: C.card, overflow: "auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "10px 12px", gap: 8, borderBottom: `1px solid ${C.bdr}` }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: C.acc + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
          {faceKey === "front" ? "🪟" : faceKey === "top" ? "⬆" : faceKey === "bottom" ? "⬇" : faceKey === "left" ? "◀" : faceKey === "right" ? "▶" : "↩"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.tx }}>{face.label}</div>
          <div style={{ fontSize: 9, color: C.sub }}>{filledCount}/{fields.length} campi compilati</div>
        </div>
        <div onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer", color: C.sub }}>✕</div>
      </div>

      {/* Fields */}
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        {fields.map(f => (
          <div key={f.k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: C.sub, minWidth: 80, flexShrink: 0 }}>{f.l}</span>
            {f.type === "text" ? (
              <input value={data[f.k] || ""} placeholder="..."
                onChange={e => setF(f.k, e.target.value)}
                style={{ flex: 1, padding: "6px 8px", border: `1px solid ${C.bdr}`, borderRadius: 6, fontSize: 11, fontFamily: FF, color: C.tx }} />
            ) : f.type === "check" ? (
              <div onClick={() => setF(f.k, !data[f.k])}
                style={{ padding: "4px 10px", borderRadius: 6, border: `1.5px solid ${data[f.k] ? C.grn : C.bdr}`, background: data[f.k] ? C.grn + "12" : C.card, fontSize: 10, fontWeight: 700, color: data[f.k] ? C.grn : C.sub, cursor: "pointer" }}>
                {data[f.k] ? "✓ Sì" : "No"}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <input type="number" value={data[f.k] || ""} placeholder="—"
                  onChange={e => setF(f.k, parseInt(e.target.value) || 0)}
                  style={{ width: 64, padding: "6px 6px", border: `1px solid ${C.bdr}`, borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: FM, textAlign: "center", color: C.tx }} />
                {f.u && <span style={{ fontSize: 9, color: C.sub }}>{f.u}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══ 2D VISTA PROSPETTO (simplified) ═══
function Vista2DProspetto({ tmpl, dims, setD }) {
  const sc = Math.min(0.13, 260 / Math.max(dims.w, dims.h))
  const W = dims.w * sc, H = dims.h * sc
  const pad = 50
  const svgW = W + pad * 2 + 40, svgH = H + pad * 2 + 40
  return (
    <div style={{ flex:1, overflow:"auto", display:"flex", alignItems:"center", justifyContent:"center", padding:8, background:"#FAFAF7" }}>
      <svg width={svgW} height={svgH} style={{ background:"#fff", borderRadius:8, border:`1px solid ${C.bdr}` }}>
        <rect x={pad} y={pad} width={W} height={H} fill={tmpl.frontColor || C.glass} stroke={tmpl.frontStroke || C.blu} strokeWidth={1.5} rx={2} />
        <line x1={pad} y1={pad+H/2} x2={pad+W} y2={pad+H/2} stroke={C.sub+"25"} strokeWidth={0.5} strokeDasharray="2,2" />
        <line x1={pad+W/2} y1={pad} x2={pad+W/2} y2={pad+H} stroke={C.sub+"25"} strokeWidth={0.5} strokeDasharray="2,2" />
        <Q x1={pad} y1={pad-16} x2={pad+W} y2={pad-16} value={dims.w} color={C.acc} fs={10} side="top" onEdit={v=>setD("w",v)} />
        <Q x1={pad-16} y1={pad} x2={pad-16} y2={pad+H} value={dims.h} color={C.acc} fs={10} side="left" onEdit={v=>setD("h",v)} />
        {dims.d>0 && <text x={pad+W/2} y={pad+H+24} textAnchor="middle" fontSize={9} fill={C.sub} fontFamily={FM}>Prof: {dims.d} mm</text>}
        <text x={pad+W/2} y={pad+H/2+3} textAnchor="middle" fontSize={8} fill={C.sub+"60"} fontFamily={FM}>PROSPETTO</text>
      </svg>
    </div>
  )
}

// ═══ 2D VISTA PIANTA ═══
function Vista2DPianta({ tmpl, dims, setD }) {
  const sc = Math.min(0.1, 220 / Math.max(dims.w, dims.d || 400))
  const W = dims.w * sc, D = (dims.d || 400) * sc
  const pad = 50
  const svgW = W + pad * 2 + 40, svgH = D + pad * 2 + 40
  return (
    <div style={{ flex:1, overflow:"auto", display:"flex", alignItems:"center", justifyContent:"center", padding:8, background:"#FAFAF7" }}>
      <svg width={svgW} height={svgH} style={{ background:"#fff", borderRadius:8, border:`1px solid ${C.bdr}` }}>
        <rect x={pad} y={pad} width={W} height={D} fill={C.wallF+"80"} stroke={C.wall} strokeWidth={1.5} rx={2} />
        <Q x1={pad} y1={pad+D+16} x2={pad+W} y2={pad+D+16} value={dims.w} color={C.acc} fs={10} side="bottom" onEdit={v=>setD("w",v)} />
        <Q x1={pad-16} y1={pad} x2={pad-16} y2={pad+D} value={dims.d||400} color={C.acc} fs={10} side="left" onEdit={v=>setD("d",v)} />
        <text x={pad+W/2} y={pad-8} textAnchor="middle" fontSize={8} fill={C.red} fontWeight={700} fontFamily={FM}>EST</text>
        <text x={pad+W/2} y={pad+D+32} textAnchor="middle" fontSize={8} fill={C.blu} fontWeight={700} fontFamily={FM}>INT</text>
        <text x={pad+W/2} y={pad+D/2+3} textAnchor="middle" fontSize={8} fill={C.sub+"60"} fontFamily={FM}>PIANTA</text>
      </svg>
    </div>
  )
}

// ═══ 2D VISTA SEZIONE ═══
function Vista2DSezione({ tmpl, dims, setD }) {
  const sc = Math.min(0.14, 200 / Math.max(dims.h, dims.d || 400))
  const H = dims.h * sc, D = (dims.d || 400) * sc
  const pad = 50
  const svgW = D + pad * 2 + 40, svgH = H + pad * 2 + 40
  return (
    <div style={{ flex:1, overflow:"auto", display:"flex", alignItems:"center", justifyContent:"center", padding:8, background:"#FAFAF7" }}>
      <svg width={svgW} height={svgH} style={{ background:"#fff", borderRadius:8, border:`1px solid ${C.bdr}` }}>
        <rect x={pad} y={pad} width={D} height={H} fill={C.wallF+"80"} stroke={C.wall} strokeWidth={1.5} rx={2} />
        {Array.from({length:Math.ceil(D/8)}).map((_,i)=>(
          <line key={i} x1={pad+i*8} y1={pad} x2={pad+i*8+H*0.2} y2={pad+H} stroke={C.wall+"18"} strokeWidth={0.5} />
        ))}
        <Q x1={pad} y1={pad+H+16} x2={pad+D} y2={pad+H+16} value={dims.d||400} color={C.wall} fs={10} side="bottom" onEdit={v=>setD("d",v)} />
        <Q x1={pad-16} y1={pad} x2={pad-16} y2={pad+H} value={dims.h} color={C.acc} fs={10} side="left" onEdit={v=>setD("h",v)} />
        <text x={pad-8} y={pad+H/2} textAnchor="middle" fontSize={7} fill={C.blu} fontWeight={700} fontFamily={FM} transform={`rotate(-90,${pad-8},${pad+H/2})`}>INT</text>
        <text x={pad+D+8} y={pad+H/2} textAnchor="middle" fontSize={7} fill={C.red} fontWeight={700} fontFamily={FM} transform={`rotate(-90,${pad+D+8},${pad+H/2})`}>EST</text>
        <text x={pad+D/2} y={pad+H/2+3} textAnchor="middle" fontSize={8} fill={C.sub+"60"} fontFamily={FM}>SEZIONE</text>
      </svg>
    </div>
  )
}

// ═══ MAIN ═══
export default function DisegnoTecnicoUniversale() {
  const [tmplId, setTmplId] = useState(null)
  const [dims, setDims] = useState({})
  const [view, setView] = useState("3d")
  const [faceData, setFaceData] = useState({})
  const [selectedFace, setSelectedFace] = useState(null)

  const tmpl = TEMPLATES.find(t => t.id === tmplId)
  const setD = (k, v) => setDims(prev => ({ ...prev, [k]: v }))

  // Template chooser
  if (!tmpl) {
    const cats = [...new Set(TEMPLATES.map(t => t.cat))]
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FF }}>
        <div style={{ background: C.tx, padding: "16px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>📐</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Disegno Tecnico</div>
            <div style={{ fontSize: 10, color: "#ffffff70" }}>Scegli cosa misurare</div>
          </div>
        </div>
        <div style={{ padding: "16px 14px" }}>
          {cats.map(cat => (
            <div key={cat} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.sub, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>{cat}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {TEMPLATES.filter(t => t.cat === cat).map(t => (
                  <div key={t.id} onClick={() => { setTmplId(t.id); setDims({...t.dims}); setView("3d"); setFaceData({}); setSelectedFace(null) }}
                    style={{ padding: "14px 14px", borderRadius: 12, border: `1.5px solid ${C.bdr}`, background: C.card, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s" }}>
                    <span style={{ fontSize: 24 }}>{t.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.tx }}>{t.label}</span>
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
    { id: "3d", icon: "🧊", label: "3D" },
    { id: "front", icon: "🪟", label: "Prospetto" },
    { id: "plan", icon: "📐", label: "Pianta" },
    { id: "side", icon: "🔪", label: "Sezione" },
  ]

  // Count total filled faces
  const filledFaces = FACE_KEYS.filter(k => faceData[k] && Object.values(faceData[k]).some(v => v)).length

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: FF, background: C.bg }}>
      {/* Topbar */}
      <div style={{ background: C.tx, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div onClick={() => setTmplId(null)} style={{ width: 28, height: 28, borderRadius: 7, background: "#ffffff15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer", color: "#fff" }}>←</div>
        <span style={{ fontSize: 18 }}>{tmpl.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{tmpl.label}</div>
          <div style={{ fontSize: 9, color: "#ffffff70", fontFamily: FM }}>{dims.w}×{dims.h}{dims.d ? `×${dims.d}` : ""} mm</div>
        </div>
        <div style={{ padding: "3px 8px", borderRadius: 6, background: filledFaces > 0 ? C.grn + "25" : "#ffffff10", fontSize: 9, fontWeight: 700, color: filledFaces > 0 ? C.grn : "#ffffff60" }}>
          {filledFaces}/6 facce
        </div>
      </div>

      {/* View tabs */}
      <div style={{ display: "flex", background: C.card, borderBottom: `1px solid ${C.bdr}`, flexShrink: 0 }}>
        {views.map(v => (
          <div key={v.id} onClick={() => setView(v.id)}
            style={{ flex: 1, padding: "8px 0", textAlign: "center", cursor: "pointer", borderBottom: `2.5px solid ${view === v.id ? C.acc : "transparent"}`, transition: "all 0.15s" }}>
            <span style={{ fontSize: 14 }}>{v.icon}</span>
            <div style={{ fontSize: 9, fontWeight: view === v.id ? 800 : 500, color: view === v.id ? C.acc : C.sub, marginTop: 1 }}>{v.label}</div>
          </div>
        ))}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {view === "3d" && (
          <Vista3D tmpl={tmpl} dims={dims} setD={setD}
            faceData={faceData} setFaceData={setFaceData}
            selectedFace={selectedFace} onSelectFace={setSelectedFace} />
        )}
        {view === "front" && <Vista2DProspetto tmpl={tmpl} dims={dims} setD={setD} />}
        {view === "plan" && <Vista2DPianta tmpl={tmpl} dims={dims} setD={setD} />}
        {view === "side" && <Vista2DSezione tmpl={tmpl} dims={dims} setD={setD} />}
      </div>

      {/* Face panel or quick dims */}
      {selectedFace ? (
        <div style={{ maxHeight: "40vh", overflow: "auto", flexShrink: 0 }}>
          <FacePanel tmpl={tmpl} faceKey={selectedFace}
            faceData={faceData} setFaceData={setFaceData}
            dims={dims} setD={setD}
            onClose={() => setSelectedFace(null)} />
        </div>
      ) : (
        <div style={{ padding: "8px 10px", borderTop: `1px solid ${C.bdr}`, background: C.card, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
            {[
              { k: "w", l: "L" }, { k: "h", l: "H" },
              ...(dims.d ? [{ k: "d", l: "P" }] : []),
            ].map(f => (
              <div key={f.k} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: C.sub }}>{f.l}</span>
                <input type="number" value={dims[f.k] || ""} placeholder="—"
                  onChange={e => setD(f.k, parseInt(e.target.value) || 0)}
                  style={{ width: 52, padding: "5px 4px", border: `1px solid ${C.bdr}`, borderRadius: 5, fontSize: 11, fontWeight: 700, fontFamily: FM, textAlign: "center" }} />
              </div>
            ))}
            <div style={{ flex: 1 }} />
            {/* Face quick access chips */}
            <div style={{ display: "flex", gap: 3 }}>
              {FACE_KEYS.map(k => {
                const hasData = faceData[k] && Object.values(faceData[k]).some(v => v)
                return (
                  <div key={k} onClick={() => setSelectedFace(k)}
                    style={{ width: 24, height: 24, borderRadius: 6, border: `1.5px solid ${hasData ? C.grn : C.bdr}`, background: hasData ? C.grn + "12" : C.card, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 8, fontWeight: 700, color: hasData ? C.grn : C.sub }}>
                    {k === "front" ? "F" : k === "back" ? "B" : k === "left" ? "L" : k === "right" ? "R" : k === "top" ? "T" : "D"}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

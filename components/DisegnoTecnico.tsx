"use client";
// @ts-nocheck
// ═══════════════════════════════════════════════════════════
// MASTRO ERP — DisegnoTecnico (Shared Drawing Module)
// Usato da: CMDetailPanel (preventivo) + VanoDetailPanel (rilievo)
// ═══════════════════════════════════════════════════════════
import React from "react";

export default function DisegnoTecnico({ vanoId, vanoNome, vanoDisegno, realW: propRealW, realH: propRealH, onUpdate, onUpdateField, onClose, T }) {
  const realW = propRealW || 1200;
  const realH = propRealH || 1000;
                            const dw = vanoDisegno || { elements: [], selectedId: null, drawMode: null, history: [] };
                            const els = dw.elements || [];
                            const selId = dw.selectedId || null;
                            const drawMode = dw.drawMode || null; // "line"|"apertura"|"place-anta"|"place-vetro"|"place-ap"
                            const placeApType = dw._placeApType || "SX";
                            const zoom = dw._zoom || 1;
                            const panX = dw._panX || 0, panY = dw._panY || 0;
                            const canvasW = Math.min(window.innerWidth - 32, 500);
                            const GRID = 10;
                            const SNAP_R = 18;

                            const aspect = realW / realH;
                            const PAD = 24, PAD_DIM = 28;
                            const maxW = canvasW - PAD * 2 - PAD_DIM;
                            // Compute content bounds (considering multiple frames and freeLines)
                            let contentW = maxW, contentH = maxW / aspect;
                            // No height cap — use full space
                            if (contentH > maxW * 1.5) { contentH = maxW * 1.5; contentW = contentH * aspect; }
                            let fW = contentW, fH = contentH;
                            // For multi-frame: compute bounding box of all frames
                            const allFrames = els.filter(e => e.type === "rect");
                            if (allFrames.length > 1) {
                              const bx1 = Math.min(...allFrames.map(f => f.x));
                              const by1 = Math.min(...allFrames.map(f => f.y));
                              const bx2 = Math.max(...allFrames.map(f => f.x + f.w));
                              const by2 = Math.max(...allFrames.map(f => f.y + f.h));
                              fW = bx2 - bx1 + PAD; fH = by2 - by1 + PAD;
                            }
                            const baseCanvasH = Math.max(280, fH + PAD * 2 + PAD_DIM);
                            const canvasH = baseCanvasH;
                            const fX = PAD, fY = PAD;
                            const snap = (v2) => Math.round(v2 / GRID) * GRID;

                            // ══ CELL DETECTION ══
                            const frames = els.filter(e => e.type === "rect");
                            const frame = frames[0] || null; // primary frame for compat
                            const allMontanti = els.filter(e => e.type === "montante");
                            const allTraversi = els.filter(e => e.type === "traverso");
                            const TK_FRAME = 6, TK_MONT = 4, TK_ANTA = 4, TK_PORTA = 7;
                            const HM = TK_MONT / 2;

                            // ══ POLYGON from freeLines ══
                            const getPolygon = () => {
                              const lines = els.filter(e => e.type === "freeLine");
                              if (lines.length < 3) return null;
                              const pts = [];
                              const used = new Set();
                              const addP = (x, y) => { const k = `${Math.round(x)},${Math.round(y)}`; if (!pts.length || k !== `${Math.round(pts[pts.length-1][0])},${Math.round(pts[pts.length-1][1])}`) pts.push([x, y]); };
                              addP(lines[0].x1, lines[0].y1); addP(lines[0].x2, lines[0].y2); used.add(0);
                              for (let it = 0; it < lines.length; it++) {
                                const last = pts[pts.length - 1];
                                for (let li = 0; li < lines.length; li++) {
                                  if (used.has(li)) continue;
                                  const l = lines[li];
                                  if (Math.hypot(l.x1 - last[0], l.y1 - last[1]) < 15) { addP(l.x2, l.y2); used.add(li); break; }
                                  if (Math.hypot(l.x2 - last[0], l.y2 - last[1]) < 15) { addP(l.x1, l.y1); used.add(li); break; }
                                }
                              }
                              return pts.length >= 3 ? pts : null;
                            };
                            const poly = !frame ? getPolygon() : null;

                            // ══ Line-segment intersection helpers ══
                            const segIntersectV = (x, pts2) => {
                              // Find Y values where vertical line x=X intersects polygon edges
                              const ys = [];
                              for (let i = 0; i < pts2.length; i++) {
                                const a = pts2[i], b = pts2[(i + 1) % pts2.length];
                                const minX = Math.min(a[0], b[0]), maxX = Math.max(a[0], b[0]);
                                if (x >= minX - 1 && x <= maxX + 1 && Math.abs(b[0] - a[0]) > 0.5) {
                                  const t = (x - a[0]) / (b[0] - a[0]);
                                  if (t >= -0.01 && t <= 1.01) ys.push(a[1] + t * (b[1] - a[1]));
                                }
                              }
                              ys.sort((a2, b2) => a2 - b2);
                              return ys.length >= 2 ? [ys[0], ys[ys.length - 1]] : null;
                            };
                            const segIntersectH = (y, pts2) => {
                              const xs = [];
                              for (let i = 0; i < pts2.length; i++) {
                                const a = pts2[i], b = pts2[(i + 1) % pts2.length];
                                const minY = Math.min(a[1], b[1]), maxY = Math.max(a[1], b[1]);
                                if (y >= minY - 1 && y <= maxY + 1 && Math.abs(b[1] - a[1]) > 0.5) {
                                  const t = (y - a[1]) / (b[1] - a[1]);
                                  if (t >= -0.01 && t <= 1.01) xs.push(a[0] + t * (b[0] - a[0]));
                                }
                              }
                              xs.sort((a2, b2) => a2 - b2);
                              return xs.length >= 2 ? [xs[0], xs[xs.length - 1]] : null;
                            };

                            // ══ BSP Cell Splitting ══
                            const bspSplit = (startCells) => {
                              let cl = startCells;
                              allMontanti.forEach((m, mi) => {
                                const next = [];
                                cl.forEach(c => {
                                  const my1 = m.y1 !== undefined ? m.y1 : c.y;
                                  const my2 = m.y2 !== undefined ? m.y2 : c.y + c.h;
                                  if (m.x > c.x + HM + 2 && m.x < c.x + c.w - HM - 2 && my1 <= c.y + 2 && my2 >= c.y + c.h - 2) {
                                    next.push({ x: c.x, y: c.y, w: m.x - HM - c.x, h: c.h, id: c.id + "L" + mi });
                                    next.push({ x: m.x + HM, y: c.y, w: c.x + c.w - m.x - HM, h: c.h, id: c.id + "R" + mi });
                                  } else { next.push(c); }
                                });
                                cl = next;
                              });
                              allTraversi.forEach((t, ti) => {
                                const next = [];
                                cl.forEach(c => {
                                  const tx1 = t.x1 !== undefined ? t.x1 : c.x;
                                  const tx2 = t.x2 !== undefined ? t.x2 : c.x + c.w;
                                  if (t.y > c.y + HM + 2 && t.y < c.y + c.h - HM - 2 && tx1 <= c.x + 2 && tx2 >= c.x + c.w - 2) {
                                    next.push({ x: c.x, y: c.y, w: c.w, h: t.y - HM - c.y, id: c.id + "T" + ti });
                                    next.push({ x: c.x, y: t.y + HM, w: c.w, h: c.y + c.h - t.y - HM, id: c.id + "B" + ti });
                                  } else { next.push(c); }
                                });
                                cl = next;
                              });
                              return cl;
                            };
                            const getCells = () => {
                              // Multi-frame support (zoppi): each frame gets its own cells
                              if (frames.length > 0) {
                                let allCells = [];
                                frames.forEach((fr, fi) => {
                                  const iX = fr.x + TK_FRAME, iY = fr.y + TK_FRAME;
                                  const iW = fr.w - TK_FRAME * 2, iH = fr.h - TK_FRAME * 2;
                                  if (iW < 4 || iH < 4) return;
                                  const startCells = [{ x: iX, y: iY, w: iW, h: iH, id: `F${fi}` }];
                                  allCells = allCells.concat(bspSplit(startCells));
                                });
                                return allCells;
                              }
                              // Polygon cells
                              if (poly) {
                                const allX2 = poly.map(p => p[0]), allY2 = poly.map(p => p[1]);
                                const pL = Math.min(...allX2) + 2, pR = Math.max(...allX2) - 2;
                                const pT = Math.min(...allY2) + 2, pB = Math.max(...allY2) - 2;
                                return bspSplit([{ x: pL, y: pT, w: pR - pL, h: pB - pT, id: "P0" }]);
                              }
                              return [];
                            };
                            const cells = getCells();

                            const findCellAt = (mx, my) => {
                              return cells.find(c2 => mx >= c2.x && mx <= c2.x + c2.w && my >= c2.y && my <= c2.y + c2.h);
                            };

                            // ══ Snap points ══
                            const getSnapPoints = () => {
                              const pts = [];
                              frames.forEach(fr => {
                                const fx = fr.x, fy = fr.y, fw = fr.w, fh2 = fr.h;
                                pts.push({x:fx,y:fy},{x:fx+fw,y:fy},{x:fx,y:fy+fh2},{x:fx+fw,y:fy+fh2});
                                pts.push({x:fx+fw/2,y:fy},{x:fx+fw/2,y:fy+fh2},{x:fx,y:fy+fh2/2},{x:fx+fw,y:fy+fh2/2});
                              });
                              cells.forEach(c2 => {
                                pts.push({x:c2.x,y:c2.y},{x:c2.x+c2.w,y:c2.y},{x:c2.x,y:c2.y+c2.h},{x:c2.x+c2.w,y:c2.y+c2.h});
                                pts.push({x:c2.x+c2.w/2,y:c2.y},{x:c2.x+c2.w/2,y:c2.y+c2.h});
                                pts.push({x:c2.x,y:c2.y+c2.h/2},{x:c2.x+c2.w,y:c2.y+c2.h/2});
                              });
                              els.filter(e => e.type === "freeLine" || e.type === "apLine").forEach(l => {
                                pts.push({x:l.x1,y:l.y1},{x:l.x2,y:l.y2});
                              });
                              return pts;
                            };
                            const findSnap = (mx, my) => {
                              const pts = getSnapPoints();
                              let best = null, bestD = SNAP_R;
                              pts.forEach(p => { const d = Math.hypot(p.x - mx, p.y - my); if (d < bestD) { bestD = d; best = p; } });
                              return best;
                            };

                            // ══ State helpers ══
                            const pushHistory = () => {
                              const hist = dw.history || [];
                              return [...hist.slice(-20), JSON.stringify(els)];
                            };
                            const setDW = (newEls, extra = {}) => {
                              const hist = pushHistory();
                              onUpdate({ ...dw, elements: newEls, history: hist, ...extra });
                            };
                            const setMode = (extra) => onUpdate({ ...dw, ...extra });

                            const undo = () => {
                              const hist = dw.history || [];
                              if (hist.length === 0) return;
                              const prev = JSON.parse(hist[hist.length - 1]);
                              onUpdate({ ...dw, elements: prev, history: hist.slice(0, -1), selectedId: null });
                            };

                            const getSvgXY = (e2, svg) => {
                              const r2 = svg.getBoundingClientRect();
                              const clientX = e2.touches ? e2.touches[0].clientX : e2.clientX;
                              const clientY = e2.touches ? e2.touches[0].clientY : e2.clientY;
                              // Convert screen coords to viewBox coords
                              const px = clientX - r2.left;
                              const py = clientY - r2.top;
                              const vbW = canvasW / zoom, vbH = canvasH / zoom;
                              return { mx: panX + px / r2.width * vbW, my: panY + py / r2.height * vbH };
                            };

                            // ── Drag ──
                            const onDrag = (e2, elId) => {
                              if (drawMode) return;
                              e2.stopPropagation(); e2.preventDefault();
                              const svg = e2.currentTarget.closest("svg");
                              if (!svg) return;
                              const el = els.find(x => x.id === elId);
                              if (!el) return;
                              setMode({ selectedId: elId });
                              const { mx: sx, my: sy } = getSvgXY(e2, svg);
                              const orig = { ...el };
                              let latestEls = els;
                              const onM = (ev) => {
                                ev.preventDefault();
                                const { mx, my } = getSvgXY(ev, svg);
                                const dx = snap(mx - sx), dy = snap(my - sy);
                                const upd = els.map(x => {
                                  if (x.id !== elId) return x;
                                  if (x.type === "montante") {
                                    const newX = snap(orig.x + dx);
                                    // Recalculate y1/y2 from polygon if present
                                    if (poly) {
                                      const ys = segIntersectV(newX, poly);
                                      if (ys) return { ...x, x: newX, y1: ys[0], y2: ys[1] };
                                    }
                                    return { ...x, x: newX };
                                  }
                                  if (x.type === "traverso") {
                                    const newY = snap(orig.y + dy);
                                    if (poly) {
                                      const xs2 = segIntersectH(newY, poly);
                                      if (xs2) return { ...x, y: newY, x1: xs2[0], x2: xs2[1] };
                                    }
                                    return { ...x, y: newY };
                                  }
                                  if (x.type === "circle") return { ...x, cx: orig.cx + dx, cy: orig.cy + dy };
                                  if (x.x1 !== undefined) return { ...x, x1: orig.x1 + dx, y1: orig.y1 + dy, x2: orig.x2 + dx, y2: orig.y2 + dy };
                                  if (x.x !== undefined) return { ...x, x: orig.x + dx, y: orig.y + dy };
                                  return x;
                                });
                                latestEls = upd;
                                // Live dim for montante/traverso
                                let dragDim = null;
                                if (el.type === "montante") {
                                  const newX = snap(orig.x + dx);
                                  if (frame) {
                                    const innerW = frame.w - TK_FRAME * 2;
                                    const posRatio = innerW > 0 ? (newX - frame.x - TK_FRAME) / innerW : 0.5;
                                    const leftMM = Math.round(Math.max(0, Math.min(realW, posRatio * realW)));
                                    const rightMM = realW - leftMM;
                                    const my1 = el.y1 !== undefined ? el.y1 : frame.y;
                                    const my2 = el.y2 !== undefined ? el.y2 : frame.y + frame.h;
                                    dragDim = { type: "v", x: newX, y1: my1, y2: my2, leftMM, rightMM };
                                  } else if (poly) {
                                    const pxs = poly.map(p => p[0]);
                                    const pL = Math.min(...pxs), pR = Math.max(...pxs);
                                    const posRatio = pR > pL ? (newX - pL) / (pR - pL) : 0.5;
                                    const leftMM = Math.round(Math.max(0, Math.min(realW, posRatio * realW)));
                                    const rightMM = realW - leftMM;
                                    const ys = segIntersectV(newX, poly);
                                    const my1 = ys ? ys[0] : Math.min(...poly.map(p => p[1]));
                                    const my2 = ys ? ys[1] : Math.max(...poly.map(p => p[1]));
                                    dragDim = { type: "v", x: newX, y1: my1, y2: my2, leftMM, rightMM };
                                  }
                                }
                                if (el.type === "traverso") {
                                  const newY = snap(orig.y + dy);
                                  if (frame) {
                                    const innerH = frame.h - TK_FRAME * 2;
                                    const posRatio = innerH > 0 ? (newY - frame.y - TK_FRAME) / innerH : 0.5;
                                    const topMM = Math.round(Math.max(0, Math.min(realH, posRatio * realH)));
                                    const botMM = realH - topMM;
                                    const tx1 = el.x1 !== undefined ? el.x1 : frame.x;
                                    const tx2 = el.x2 !== undefined ? el.x2 : frame.x + frame.w;
                                    dragDim = { type: "h", y: newY, x1: tx1, x2: tx2, topMM, botMM };
                                  } else if (poly) {
                                    const pys = poly.map(p => p[1]);
                                    const pT = Math.min(...pys), pB = Math.max(...pys);
                                    const posRatio = pB > pT ? (newY - pT) / (pB - pT) : 0.5;
                                    const topMM = Math.round(Math.max(0, Math.min(realH, posRatio * realH)));
                                    const botMM = realH - topMM;
                                    const xs2 = segIntersectH(newY, poly);
                                    const tx1 = xs2 ? xs2[0] : Math.min(...poly.map(p => p[0]));
                                    const tx2 = xs2 ? xs2[1] : Math.max(...poly.map(p => p[0]));
                                    dragDim = { type: "h", y: newY, x1: tx1, x2: tx2, topMM, botMM };
                                  }
                                }
                                onUpdate({ ...dw, elements: upd, selectedId: elId, _dragDim: dragDim });
                              };
                              const onU = () => {
                                document.removeEventListener("mousemove", onM); document.removeEventListener("mouseup", onU);
                                document.removeEventListener("touchmove", onM); document.removeEventListener("touchend", onU);
                                onUpdate({ ...dw, elements: latestEls, selectedId: elId, _dragDim: null });
                              };
                              document.addEventListener("mousemove", onM); document.addEventListener("mouseup", onU);
                              document.addEventListener("touchmove", onM, { passive: false }); document.addEventListener("touchend", onU);
                            };

                            // ── SVG Click ──
                            const onSvgClick = (e2) => {
                              const svg = e2.currentTarget;
                              const { mx, my } = getSvgXY(e2, svg);

                              // Place montante/traverso — click on cell OR polygon
                              if (drawMode === "place-mont") {
                                const cell = findCellAt(mx, my);
                                if (cell) {
                                  const cx = snap(mx);
                                  const clampedX = Math.max(cell.x + 10, Math.min(cell.x + cell.w - 10, cx));
                                  // If polygon exists, clip montante to polygon edges
                                  if (poly) {
                                    const ys = segIntersectV(clampedX, poly);
                                    if (ys) setDW([...els, { id: Date.now(), type: "montante", x: clampedX, y1: ys[0], y2: ys[1] }]);
                                  } else {
                                    setDW([...els, { id: Date.now(), type: "montante", x: clampedX, y1: cell.y, y2: cell.y + cell.h }]);
                                  }
                                } else if (poly) {
                                  // No cells yet but polygon exists — clip to polygon
                                  const cx = snap(mx);
                                  const ys = segIntersectV(cx, poly);
                                  if (ys) setDW([...els, { id: Date.now(), type: "montante", x: cx, y1: ys[0], y2: ys[1] }]);
                                } else if (!frame) {
                                  setDW([...els, { id: Date.now(), type: "montante", x: snap(mx), y1: fY, y2: fY + fH }]);
                                }
                                return;
                              }
                              if (drawMode === "place-trav") {
                                const cell = findCellAt(mx, my);
                                if (cell) {
                                  const cy = snap(my);
                                  const clampedY = Math.max(cell.y + 10, Math.min(cell.y + cell.h - 10, cy));
                                  if (poly) {
                                    const xs = segIntersectH(clampedY, poly);
                                    if (xs) setDW([...els, { id: Date.now(), type: "traverso", y: clampedY, x1: xs[0], x2: xs[1] }]);
                                  } else {
                                    setDW([...els, { id: Date.now(), type: "traverso", y: clampedY, x1: cell.x, x2: cell.x + cell.w }]);
                                  }
                                } else if (poly) {
                                  const cy = snap(my);
                                  const xs = segIntersectH(cy, poly);
                                  if (xs) setDW([...els, { id: Date.now(), type: "traverso", y: cy, x1: xs[0], x2: xs[1] }]);
                                } else if (!frame) {
                                  setDW([...els, { id: Date.now(), type: "traverso", y: snap(my), x1: fX, x2: fX + fW }]);
                                }
                                return;
                              }

                              // Place modes — click on cell OR polygon fallback for complex shapes
                              if (drawMode === "place-anta" || drawMode === "place-vetro" || drawMode === "place-porta" || drawMode === "place-persiana") {
                                let cell = findCellAt(mx, my);
                                if (!cell && cells.length === 0) {
                                  // Extract polygon from freeLines
                                  const lines = els.filter(e => e.type === "freeLine");
                                  if (lines.length >= 3) {
                                    // Build ordered point chain from connected lines
                                    const pts = [];
                                    const used = new Set();
                                    const addPt = (x, y) => { const k = `${Math.round(x)},${Math.round(y)}`; if (!pts.length || k !== `${Math.round(pts[pts.length-1][0])},${Math.round(pts[pts.length-1][1])}`) pts.push([x, y]); };
                                    // Start with first line
                                    addPt(lines[0].x1, lines[0].y1);
                                    addPt(lines[0].x2, lines[0].y2);
                                    used.add(0);
                                    for (let iter = 0; iter < lines.length; iter++) {
                                      const last = pts[pts.length - 1];
                                      for (let li = 0; li < lines.length; li++) {
                                        if (used.has(li)) continue;
                                        const l = lines[li];
                                        const d1 = Math.hypot(l.x1 - last[0], l.y1 - last[1]);
                                        const d2 = Math.hypot(l.x2 - last[0], l.y2 - last[1]);
                                        if (d1 < 15) { addPt(l.x2, l.y2); used.add(li); break; }
                                        if (d2 < 15) { addPt(l.x1, l.y1); used.add(li); break; }
                                      }
                                    }
                                    if (pts.length >= 3) {
                                      cell = { id: "poly", poly: pts };
                                    }
                                  }
                                  // Fallback to bbox if polygon extraction failed
                                  if (!cell) {
                                    const allLines = els.filter(e => e.type === "freeLine" || e.type === "apLine");
                                    if (allLines.length > 0) {
                                      const allX = allLines.flatMap(l => [l.x1, l.x2]);
                                      const allY = allLines.flatMap(l => [l.y1, l.y2]);
                                      cell = { x: Math.min(...allX), y: Math.min(...allY), w: Math.max(...allX) - Math.min(...allX), h: Math.max(...allY) - Math.min(...allY), id: "bbox" };
                                    }
                                  }
                                }
                                if (!cell) return;
                                
                                // Polygon shape handling
                                if (cell.poly) {
                                  if (drawMode === "place-anta" || drawMode === "place-porta") {
                                    const newEls = els.filter(e => e.type !== "polyAnta");
                                    newEls.push({ id: Date.now(), type: "polyAnta", poly: cell.poly, subType: drawMode === "place-porta" ? "porta" : undefined });
                                    setDW(newEls);
                                  } else if (drawMode === "place-vetro") {
                                    const newEls = els.filter(e => e.type !== "polyGlass");
                                    newEls.push({ id: Date.now(), type: "polyGlass", poly: cell.poly });
                                    setDW(newEls);
                                  } else if (drawMode === "place-persiana") {
                                    const newEls = els.filter(e => e.type !== "polyPersiana");
                                    newEls.push({ id: Date.now(), type: "polyPersiana", poly: cell.poly });
                                    setDW(newEls);
                                  }
                                  return;
                                }
                                
                                // Match elements to cell by position overlap (BSP IDs change dynamically)
                                const inCell = (el2) => el2.x !== undefined && el2.w !== undefined &&
                                  el2.x >= cell.x - 2 && el2.y >= cell.y - 2 &&
                                  el2.x + el2.w <= cell.x + cell.w + 2 && el2.y + el2.h <= cell.y + cell.h + 2;
                                
                                // Regular cell handling
                                if (drawMode === "place-anta") {
                                  const existingAnta = els.find(e => (e.type === "innerRect" || e.type === "persiana") && inCell(e));
                                  if (existingAnta) {
                                    const midX = snap(cell.x + cell.w / 2);
                                    const newEls = els.filter(e => !((e.type === "innerRect" || e.type === "persiana" || e.type === "glass") && inCell(e)));
                                    newEls.push({ id: Date.now(), type: "montante", x: midX, y1: cell.y - HM, y2: cell.y + cell.h + HM });
                                    setDW(newEls);
                                  } else {
                                    const newEls = [...els];
                                    newEls.push({ id: Date.now(), type: "innerRect", x: cell.x + 1, y: cell.y + 1, w: cell.w - 2, h: cell.h - 2, cellId: cell.id });
                                    setDW(newEls);
                                  }
                                } else if (drawMode === "place-porta") {
                                  const newEls = els.filter(e => !((e.type === "innerRect" || e.type === "persiana") && inCell(e)));
                                  newEls.push({ id: Date.now(), type: "innerRect", subType: "porta", x: cell.x + 1, y: cell.y + 1, w: cell.w - 2, h: cell.h - 2, cellId: cell.id });
                                  setDW(newEls);
                                } else if (drawMode === "place-persiana") {
                                  const newEls = els.filter(e => !((e.type === "innerRect" || e.type === "persiana") && inCell(e)));
                                  newEls.push({ id: Date.now(), type: "persiana", x: cell.x + 1, y: cell.y + 1, w: cell.w - 2, h: cell.h - 2, cellId: cell.id });
                                  setDW(newEls);
                                } else if (drawMode === "place-vetro") {
                                  const anta = els.find(e => (e.type === "innerRect") && inCell(e));
                                  const tk = anta ? (anta.subType === "porta" ? TK_PORTA : TK_ANTA) : 1;
                                  const base = anta || { x: cell.x + 1, y: cell.y + 1, w: cell.w - 2, h: cell.h - 2 };
                                  const newEls = els.filter(e => !(e.type === "glass" && inCell(e)));
                                  newEls.push({ id: Date.now(), type: "glass", x: base.x + tk, y: base.y + tk, w: base.w - tk * 2, h: base.h - tk * 2, cellId: cell.id });
                                  setDW(newEls);
                                }
                                return;
                              }

                              if (drawMode === "place-ap") {
                                let cell = findCellAt(mx, my);
                                if (!cell && cells.length === 0) {
                                  const lines = els.filter(e => e.type === "freeLine" || e.type === "apLine");
                                  if (lines.length > 0) {
                                    const allX = lines.flatMap(l => [l.x1, l.x2]);
                                    const allY = lines.flatMap(l => [l.y1, l.y2]);
                                    cell = { x: Math.min(...allX), y: Math.min(...allY), w: Math.max(...allX) - Math.min(...allX), h: Math.max(...allY) - Math.min(...allY), id: "bbox" };
                                  }
                                }
                                if (!cell) return;
                                const t = Date.now();
                                // Remove old aperture elements in this cell by position
                                const inC = (el2) => el2.x !== undefined ? (el2.x >= cell.x - 3 && el2.x <= cell.x + cell.w + 3 && el2.y >= cell.y - 3 && el2.y <= cell.y + cell.h + 3) :
                                  (el2.x1 !== undefined && el2.x1 >= cell.x - 3 && el2.x1 <= cell.x + cell.w + 3 && el2.y1 >= cell.y - 3 && el2.y1 <= cell.y + cell.h + 3);
                                const newEls = els.filter(e => !((e.type === "apLine" || e.type === "apLabel") && inC(e)));
                                const P = 6;
                                const L = cell.x + P, R = cell.x + cell.w - P;
                                const T2 = cell.y + P, B = cell.y + cell.h - P;
                                const MX = cell.x + cell.w / 2, MY = cell.y + cell.h / 2;
                                const ap = placeApType;
                                if (ap === "SX") {
                                  // Cardine sinistro: triangolo simmetrico, cardine a SX
                                  newEls.push({ id: t, type: "apLine", x1: L, y1: B, x2: R, y2: B, cellId: cell.id, dash: true });
                                  newEls.push({ id: t + 1, type: "apLine", x1: L, y1: B, x2: MX, y2: T2, cellId: cell.id });
                                  newEls.push({ id: t + 2, type: "apLabel", x: MX - cell.w * 0.2, y: MY + 5, label: "← SX", cellId: cell.id });
                                } else if (ap === "DX") {
                                  // Cardine destro: triangolo simmetrico, cardine a DX
                                  newEls.push({ id: t, type: "apLine", x1: L, y1: B, x2: R, y2: B, cellId: cell.id, dash: true });
                                  newEls.push({ id: t + 1, type: "apLine", x1: R, y1: B, x2: MX, y2: T2, cellId: cell.id });
                                  newEls.push({ id: t + 2, type: "apLabel", x: MX + cell.w * 0.2, y: MY + 5, label: "DX →", cellId: cell.id });
                                } else if (ap === "RIB") {
                                  // Ribalta: triangolo simmetrico dal basso-centro verso alto
                                  newEls.push({ id: t, type: "apLine", x1: L, y1: T2, x2: R, y2: T2, cellId: cell.id, dash: true });
                                  newEls.push({ id: t + 1, type: "apLine", x1: MX, y1: B, x2: L, y2: T2, cellId: cell.id });
                                  newEls.push({ id: t + 2, type: "apLine", x1: MX, y1: B, x2: R, y2: T2, cellId: cell.id });
                                  newEls.push({ id: t + 3, type: "apLabel", x: MX, y: MY + 5, label: "↕ RIB", cellId: cell.id });
                                } else if (ap === "OB") {
                                  // Anta-ribalta: SX simmetrico (solido) + RIB (tratteggiato)
                                  newEls.push({ id: t, type: "apLine", x1: L, y1: B, x2: MX, y2: T2, cellId: cell.id });
                                  newEls.push({ id: t + 1, type: "apLine", x1: MX, y1: B, x2: L, y2: T2, cellId: cell.id, dash: true });
                                  newEls.push({ id: t + 2, type: "apLine", x1: MX, y1: B, x2: R, y2: T2, cellId: cell.id, dash: true });
                                  newEls.push({ id: t + 3, type: "apLabel", x: MX, y: MY, label: "↙↕ OB", cellId: cell.id });
                                } else if (ap === "ALZ") {
                                  newEls.push({ id: t, type: "apLine", x1: L, y1: MY, x2: R, y2: MY, cellId: cell.id });
                                  newEls.push({ id: t + 1, type: "apLine", x1: R - 12, y1: MY - 8, x2: R, y2: MY, cellId: cell.id });
                                  newEls.push({ id: t + 2, type: "apLine", x1: R - 12, y1: MY + 8, x2: R, y2: MY, cellId: cell.id });
                                  newEls.push({ id: t + 3, type: "apLabel", x: MX, y: MY - 14, label: "→ ALZ", cellId: cell.id });
                                } else if (ap === "SCO") {
                                  newEls.push({ id: t, type: "apLine", x1: L, y1: MY, x2: R, y2: MY, cellId: cell.id });
                                  newEls.push({ id: t + 1, type: "apLine", x1: L + 10, y1: MY - 8, x2: L, y2: MY, cellId: cell.id });
                                  newEls.push({ id: t + 2, type: "apLine", x1: R - 10, y1: MY - 8, x2: R, y2: MY, cellId: cell.id });
                                  newEls.push({ id: t + 3, type: "apLabel", x: MX, y: MY - 14, label: "↔ SCO", cellId: cell.id });
                                } else if (ap === "FISSO") {
                                  newEls.push({ id: t, type: "apLine", x1: L, y1: T2, x2: R, y2: B, cellId: cell.id });
                                  newEls.push({ id: t + 1, type: "apLine", x1: R, y1: T2, x2: L, y2: B, cellId: cell.id });
                                  newEls.push({ id: t + 2, type: "apLabel", x: MX, y: MY, label: "FISSO", cellId: cell.id });
                                }
                                setDW(newEls);
                                return;
                              }

                              // Line / apertura draw modes
                              if (drawMode === "line" || drawMode === "apertura") {
                                const sp = findSnap(mx, my);
                                let px = sp ? sp.x : snap(mx);
                                let py = sp ? sp.y : snap(my);
                                const pending = dw._pendingLine;
                                if (pending) {
                                  // Snap to H/V if within 8px
                                  const adx = Math.abs(px - pending.x1), ady = Math.abs(py - pending.y1);
                                  if (adx < 8 && ady > 8) px = pending.x1; // vertical snap
                                  if (ady < 8 && adx > 8) py = pending.y1; // horizontal snap
                                }
                                if (!pending) {
                                  setMode({ _pendingLine: { x1: px, y1: py } });
                                } else {
                                  if (px === pending.x1 && py === pending.y1) return;
                                  const lineType = drawMode === "apertura" ? "apLine" : "freeLine";
                                  setDW([...els, { id: Date.now(), type: lineType, x1: pending.x1, y1: pending.y1, x2: px, y2: py }], { _pendingLine: { x1: px, y1: py } });
                                }
                                return;
                              }

                              // Default — deselect
                              setMode({ selectedId: null });
                            };

                            // ══ Styles ══
                            const bs = (active = false) => ({ padding: "5px 9px", borderRadius: 6, border: `1.5px solid ${active ? T.purple : T.bdr}`, background: active ? `${T.purple}12` : T.card, fontSize: 10, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" as any, color: active ? T.purple : T.text });
                            const bAp = (active = false) => ({ padding: "5px 9px", borderRadius: 6, border: `1.5px solid ${active ? T.blue : T.blue + "30"}`, background: active ? `${T.blue}12` : `${T.blue}05`, fontSize: 10, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" as any, color: T.blue });
                            const bDel = (c2 = T.red) => ({ padding: "5px 9px", borderRadius: 6, border: `1px solid ${c2}30`, background: `${c2}08`, fontSize: 10, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" as any, color: c2 });

                            const cursorMode = drawMode === "line" || drawMode === "apertura" ? "crosshair" : drawMode ? "pointer" : "default";

                            return (
                              <div style={{ marginTop: 8, background: T.card, borderRadius: 12, border: `1.5px solid ${T.purple}`, overflow: "hidden" }}>
                                {/* Header */}
                                <div style={{ padding: "8px 12px", background: `${T.purple}10`, display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontSize: 14 }}>✏️</span>
                                  <span style={{ fontSize: 12, fontWeight: 800, color: T.purple, flex: 1 }}>Disegno — {vanoNome || "Vano"} ({realW}×{realH})</span>
                                  {drawMode === "line" && <span style={{ fontSize: 9, background: "#333", color: "#fff", padding: "2px 7px", borderRadius: 4, fontWeight: 800 }}>╱ STRUTTURA</span>}
                                  {drawMode === "apertura" && <span style={{ fontSize: 9, background: T.blue, color: "#fff", padding: "2px 7px", borderRadius: 4, fontWeight: 800 }}>↗ APERTURA</span>}
                                  {(drawMode === "place-anta" || drawMode === "place-vetro" || drawMode === "place-porta" || drawMode === "place-persiana") && <span style={{ fontSize: 9, background: T.grn, color: "#fff", padding: "2px 7px", borderRadius: 4, fontWeight: 800 }}>👆 CLICK su cella</span>}
                                  {(drawMode === "place-mont" || drawMode === "place-trav") && <span style={{ fontSize: 9, background: "#555", color: "#fff", padding: "2px 7px", borderRadius: 4, fontWeight: 800 }}>👆 {drawMode === "place-mont" ? "MONTANTE" : "TRAVERSO"} — click cella</span>}
                                  {drawMode === "place-ap" && <span style={{ fontSize: 9, background: T.blue, color: "#fff", padding: "2px 7px", borderRadius: 4, fontWeight: 800 }}>👆 {placeApType} — click cella</span>}
                                  <span onClick={() => onClose()} style={{ fontSize: 16, cursor: "pointer", color: T.sub, padding: "2px 6px" }}>✕</span>
                                </div>

                                {/* Row 1: Struttura */}
                                <div style={{ display: "flex", gap: 3, padding: "5px 8px", overflowX: "auto" }}>
                                  <div onClick={() => {
                                    if (frames.length === 0) {
                                      // First telaio: fill canvas
                                      setDW([...els, { id: Date.now(), type: "rect", x: fX, y: fY, w: fW, h: fH }]);
                                    } else {
                                      // Additional telaio (zoppo): add offset
                                      const lastF = frames[frames.length - 1];
                                      const nw = lastF.w * 0.6, nh = lastF.h * 0.5;
                                      const nx = lastF.x + lastF.w - TK_FRAME;
                                      const ny = lastF.y + lastF.h - nh;
                                      setDW([...els, { id: Date.now(), type: "rect", x: snap(nx), y: snap(ny), w: snap(nw), h: snap(nh) }]);
                                    }
                                  }} style={bs()}>▭ Telaio</div>

                                  <div onClick={() => setMode({ drawMode: drawMode === "place-mont" ? null : "place-mont", _pendingLine: null })} style={bs(drawMode === "place-mont")}>┃ Mont.</div>

                                  <div onClick={() => setMode({ drawMode: drawMode === "place-trav" ? null : "place-trav", _pendingLine: null })} style={bs(drawMode === "place-trav")}>━ Trav.</div>

                                  <div onClick={() => setMode({ drawMode: drawMode === "place-anta" ? null : "place-anta", _pendingLine: null })} style={bs(drawMode === "place-anta")}>🪟 Anta</div>

                                  <div onClick={() => setMode({ drawMode: drawMode === "place-porta" ? null : "place-porta", _pendingLine: null })} style={bs(drawMode === "place-porta")}>🚪 Porta</div>

                                  <div onClick={() => setMode({ drawMode: drawMode === "place-persiana" ? null : "place-persiana", _pendingLine: null })} style={bs(drawMode === "place-persiana")}>▤ Pers.</div>

                                  <div onClick={() => setMode({ drawMode: drawMode === "place-vetro" ? null : "place-vetro", _pendingLine: null })} style={bs(drawMode === "place-vetro")}>💎 Vetro</div>

                                  <div onClick={() => {
                                    const cx = frame ? frame.x + frame.w / 2 : fX + fW / 2;
                                    const cy = frame ? frame.y + frame.h / 2 : fY + fH / 2;
                                    setDW([...els, { id: Date.now(), type: "circle", cx, cy, r: Math.min(fW, fH) / 4 }]);
                                  }} style={bs()}>⭕ Oblò</div>

                                  <div onClick={() => setMode({ drawMode: drawMode === "line" ? null : "line", _pendingLine: null })} style={bs(drawMode === "line")}>╱ Linea</div>

                                  <div onClick={() => {
                                    const txt = prompt("Testo etichetta:");
                                    if (!txt) return;
                                    const cx2 = frame ? frame.x + frame.w / 2 : fX + fW / 2;
                                    const cy2 = frame ? frame.y + frame.h / 2 : fY + fH / 2;
                                    setDW([...els, { id: Date.now(), type: "label", x: cx2, y: cy2, text: txt, fontSize: 11 }]);
                                  }} style={bs()}>Aa Testo</div>

                                  <div onClick={() => {
                                    const nEls = els.filter(e => e.type !== "dim");
                                    if (frame) {
                                      nEls.push(
                                        { id: Date.now() + 300, type: "dim", x1: frame.x, y1: frame.y + frame.h + 14, x2: frame.x + frame.w, y2: frame.y + frame.h + 14, label: String(realW) },
                                        { id: Date.now() + 301, type: "dim", x1: frame.x + frame.w + 14, y1: frame.y, x2: frame.x + frame.w + 14, y2: frame.y + frame.h, label: String(realH) }
                                      );
                                      const iT = frame.y + TK_FRAME, iL = frame.x + TK_FRAME;
                                      const topCells = cells.filter(c2 => Math.abs(c2.y - iT) < 4).sort((a, b) => a.x - b.x);
                                      if (topCells.length > 1) topCells.forEach((c2, i) => nEls.push({ id: Date.now() + 310 + i, type: "dim", x1: c2.x, y1: frame.y - 10, x2: c2.x + c2.w, y2: frame.y - 10, label: String(Math.round(c2.w / fW * realW)) }));
                                      const leftCells = cells.filter(c2 => Math.abs(c2.x - iL) < 4).sort((a, b) => a.y - b.y);
                                      if (leftCells.length > 1) leftCells.forEach((c2, i) => nEls.push({ id: Date.now() + 330 + i, type: "dim", x1: frame.x - 14, y1: c2.y, x2: frame.x - 14, y2: c2.y + c2.h, label: String(Math.round(c2.h / fH * realH)) }));
                                    } else if (poly) {
                                      const xs = poly.map(p => p[0]), ys = poly.map(p => p[1]);
                                      const bL = Math.min(...xs), bR = Math.max(...xs), bT = Math.min(...ys), bB = Math.max(...ys);
                                      // Bounding box total dims
                                      nEls.push(
                                        { id: Date.now() + 300, type: "dim", x1: bL, y1: bB + 14, x2: bR, y2: bB + 14, label: String(realW) },
                                        { id: Date.now() + 301, type: "dim", x1: bR + 14, y1: bT, x2: bR + 14, y2: bB, label: String(realH) }
                                      );
                                      // Per-segment dimensions (each freeLine side)
                                      const freeLines = els.filter(e => e.type === "freeLine");
                                      const totalPx = Math.hypot(bR - bL, bB - bT);
                                      freeLines.forEach((fl, fi) => {
                                        const dx2 = fl.x2 - fl.x1, dy2 = fl.y2 - fl.y1;
                                        const segPx = Math.hypot(dx2, dy2);
                                        // Convert px to mm using diagonal ratio
                                        const diagMM = Math.hypot(realW, realH);
                                        const segMM = Math.round(segPx / totalPx * diagMM);
                                        // Offset dim line outward from polygon center
                                        const cx = (bL + bR) / 2, cy = (bT + bB) / 2;
                                        const mx = (fl.x1 + fl.x2) / 2, my = (fl.y1 + fl.y2) / 2;
                                        const toCx = cx - mx, toCy = cy - my;
                                        const dist = Math.hypot(toCx, toCy) || 1;
                                        const offX = -toCx / dist * 16, offY = -toCy / dist * 16;
                                        nEls.push({ id: Date.now() + 350 + fi, type: "dim", x1: fl.x1 + offX, y1: fl.y1 + offY, x2: fl.x2 + offX, y2: fl.y2 + offY, label: String(segMM) });
                                      });
                                      // Per-cell dims
                                      if (cells.length > 1) {
                                        const topCells = cells.filter(c2 => Math.abs(c2.y - bT) < 6).sort((a, b) => a.x - b.x);
                                        if (topCells.length > 1) topCells.forEach((c2, i) => nEls.push({ id: Date.now() + 370 + i, type: "dim", x1: c2.x, y1: bT - 10, x2: c2.x + c2.w, y2: bT - 10, label: String(Math.round(c2.w / (bR - bL) * realW)) }));
                                        const leftCells = cells.filter(c2 => Math.abs(c2.x - bL) < 6).sort((a, b) => a.y - b.y);
                                        if (leftCells.length > 1) leftCells.forEach((c2, i) => nEls.push({ id: Date.now() + 390 + i, type: "dim", x1: bL - 14, y1: c2.y, x2: bL - 14, y2: c2.y + c2.h, label: String(Math.round(c2.h / (bB - bT) * realH)) }));
                                      }
                                    }
                                    setDW(nEls);
                                  }} style={bs()}>↔ Misure</div>
                                </div>

                                {/* Row 2: Aperture (blu) */}
                                <div style={{ display: "flex", gap: 3, padding: "2px 8px 5px", overflowX: "auto" }}>
                                  <div onClick={() => setMode({ drawMode: drawMode === "apertura" ? null : "apertura", _pendingLine: null })} style={bAp(drawMode === "apertura")}>↗ Disegna</div>
                                  <span style={{ fontSize: 9, color: T.sub, alignSelf: "center" }}>|</span>
                                  {[
                                    { id: "SX", l: "← SX" }, { id: "DX", l: "DX →" }, { id: "RIB", l: "↕ Rib." },
                                    { id: "OB", l: "↙↕ OB" }, { id: "ALZ", l: "→ Alz." }, { id: "SCO", l: "↔ Sco." }, { id: "FISSO", l: "✕ Fisso" },
                                  ].map(ap => (
                                    <div key={ap.id} onClick={() => setMode({ drawMode: "place-ap", _placeApType: ap.id, _pendingLine: null })} style={bAp(drawMode === "place-ap" && placeApType === ap.id)}>{ap.l}</div>
                                  ))}
                                </div>

                                {/* Row 3: Azioni */}
                                <div style={{ display: "flex", gap: 3, padding: "0 8px 6px", borderBottom: `1px solid ${T.bdr}` }}>
                                  <div onClick={undo} style={bDel(T.acc)}>↩ Annulla</div>
                                  {selId && <div onClick={() => setDW(els.filter(e => e.id !== selId), { selectedId: null })} style={bDel()}>🗑 Elimina sel.</div>}
                                  <div style={{ flex: 1 }} />
                                  <div onClick={() => setDW([], { selectedId: null, drawMode: null, _pendingLine: null, history: [] })} style={bDel()}>🗑 Reset</div>
                                  <div style={{ flex: 1 }} />
                                  <div onClick={() => setMode({ _zoom: Math.max(0.5, (zoom || 1) - 0.25) })} style={{ ...bs(), fontSize: 14, padding: "3px 8px" }}>−</div>
                                  <div style={{ fontSize: 9, fontWeight: 800, color: T.sub, minWidth: 32, textAlign: "center" }}>{Math.round(zoom * 100)}%</div>
                                  <div onClick={() => setMode({ _zoom: Math.min(4, (zoom || 1) + 0.25) })} style={{ ...bs(), fontSize: 14, padding: "3px 8px" }}>+</div>
                                  <div onClick={() => setMode({ _zoom: 1, _panX: 0, _panY: 0 })} style={{ ...bs(), fontSize: 9 }}>Fit</div>
                                </div>

                                {/* SVG Canvas — zoomable with wheel + pannable */}
                                <div style={{ overflow: "auto", position: "relative", maxHeight: "70vh", border: `1px solid ${T.bdr}` }}>
                                <svg width={canvasW * Math.max(1, zoom)} height={canvasH * Math.max(1, zoom)}
                                  viewBox={`${panX} ${panY} ${canvasW / zoom} ${canvasH / zoom}`}
                                  style={{ display: "block", background: "#fff", touchAction: "none", cursor: drawMode ? cursorMode : (zoom > 1 ? "grab" : "default") }}
                                  onClick={onSvgClick}
                                  onWheel={(e2) => {
                                    e2.preventDefault();
                                    const newZoom = Math.max(0.5, Math.min(4, zoom + (e2.deltaY < 0 ? 0.15 : -0.15)));
                                    setMode({ _zoom: newZoom });
                                  }}
                                  onMouseDown={(e2) => {
                                    // Pan with middle mouse or shift+left
                                    if (e2.button === 1 || (e2.shiftKey && e2.button === 0)) {
                                      e2.preventDefault();
                                      const sx = e2.clientX, sy = e2.clientY;
                                      const sp = panX, spp = panY;
                                      const onPM = (ev) => {
                                        const ndx = (ev.clientX - sx) / zoom;
                                        const ndy = (ev.clientY - sy) / zoom;
                                        onUpdate({ ...dw, _panX: sp - ndx, _panY: spp - ndy });
                                      };
                                      const onPU = () => { document.removeEventListener("mousemove", onPM); document.removeEventListener("mouseup", onPU); };
                                      document.addEventListener("mousemove", onPM);
                                      document.addEventListener("mouseup", onPU);
                                    }
                                  }}
                                  onMouseMove={(e2) => {
                                    if (!dw._pendingLine || !(drawMode === "line" || drawMode === "apertura")) return;
                                    const svg = e2.currentTarget;
                                    const { mx: gmx, my: gmy } = getSvgXY(e2, svg);
                                    let gx = snap(gmx), gy = snap(gmy);
                                    const p = dw._pendingLine;
                                    if (Math.abs(gx - p.x1) < 8 && Math.abs(gy - p.y1) > 8) gx = p.x1;
                                    if (Math.abs(gy - p.y1) < 8 && Math.abs(gx - p.x1) > 8) gy = p.y1;
                                    const deg = Math.round(Math.atan2(-(gy - p.y1), gx - p.x1) * 180 / Math.PI);
                                    const len = Math.round(Math.hypot(gx - p.x1, gy - p.y1) / fW * realW);
                                    if (dw._guideX !== gx || dw._guideY !== gy) {
                                      onUpdate({ ...dw, _guideX: gx, _guideY: gy, _guideDeg: deg, _guideLen: len });
                                    }
                                  }}
                                  onMouseLeave={() => { if (dw._guideX != null) onUpdate({ ...dw, _guideX: null, _guideY: null }); }}>
                                  <defs>
                                    <pattern id={`dg-${vanoId}`} width={GRID} height={GRID} patternUnits="userSpaceOnUse">
                                      <path d={`M ${GRID} 0 L 0 0 0 ${GRID}`} fill="none" stroke="#f0f0f0" strokeWidth="0.5" />
                                    </pattern>
                                    {poly && <clipPath id={`polyClip-${vanoId}`}><polygon points={poly.map(p => p.join(",")).join(" ")} /></clipPath>}
                                  </defs>
                                  <rect width={canvasW} height={canvasH} fill={`url(#dg-${vanoId})`} />

                                  {/* Cell highlights in place mode — clipped to polygon if present */}
                                  {(drawMode === "place-anta" || drawMode === "place-vetro" || drawMode === "place-ap" || drawMode === "place-mont" || drawMode === "place-trav" || drawMode === "place-porta" || drawMode === "place-persiana") && cells.length > 0 && (
                                    <g clipPath={poly ? `url(#polyClip-${vanoId})` : undefined}>
                                      {cells.map(c2 => (
                                        <rect key={`cell-${c2.id}`} x={c2.x + 1} y={c2.y + 1} width={c2.w - 2} height={c2.h - 2}
                                          fill={drawMode === "place-ap" ? T.blue : drawMode === "place-mont" || drawMode === "place-trav" ? "#555" : T.grn} fillOpacity={0.06}
                                          stroke={drawMode === "place-ap" ? T.blue : drawMode === "place-mont" || drawMode === "place-trav" ? "#555" : T.grn} strokeWidth={1} strokeDasharray="4,3" rx={2} />
                                      ))}
                                    </g>
                                  )}
                                  {/* Polygon shape highlight when no cells but freeLines exist */}
                                  {(drawMode === "place-anta" || drawMode === "place-vetro" || drawMode === "place-ap" || drawMode === "place-porta" || drawMode === "place-persiana") && cells.length === 0 && (() => {
                                    const lines = els.filter(e => e.type === "freeLine");
                                    if (lines.length < 2) return null;
                                    // Build point chain from connected lines
                                    const pts = [];
                                    const used = new Set();
                                    const addPt = (x, y) => { const k = `${Math.round(x)},${Math.round(y)}`; if (!pts.length || k !== `${Math.round(pts[pts.length-1][0])},${Math.round(pts[pts.length-1][1])}`) pts.push([x, y]); };
                                    addPt(lines[0].x1, lines[0].y1); addPt(lines[0].x2, lines[0].y2); used.add(0);
                                    for (let iter = 0; iter < lines.length; iter++) {
                                      const last = pts[pts.length - 1];
                                      for (let li = 0; li < lines.length; li++) {
                                        if (used.has(li)) continue;
                                        const l = lines[li];
                                        if (Math.hypot(l.x1 - last[0], l.y1 - last[1]) < 15) { addPt(l.x2, l.y2); used.add(li); break; }
                                        if (Math.hypot(l.x2 - last[0], l.y2 - last[1]) < 15) { addPt(l.x1, l.y1); used.add(li); break; }
                                      }
                                    }
                                    const clr = drawMode === "place-ap" ? T.blue : T.grn;
                                    if (pts.length >= 3) {
                                      return <polygon points={pts.map(p => p.join(",")).join(" ")} fill={clr} fillOpacity={0.08} stroke={clr} strokeWidth={1.5} strokeDasharray="6,4" />;
                                    }
                                    // Fallback to bbox
                                    const allX = lines.flatMap(l => [l.x1, l.x2]), allY = lines.flatMap(l => [l.y1, l.y2]);
                                    return <rect x={Math.min(...allX)+1} y={Math.min(...allY)+1} width={Math.max(...allX)-Math.min(...allX)-2} height={Math.max(...allY)-Math.min(...allY)-2}
                                      fill={clr} fillOpacity={0.08} stroke={clr} strokeWidth={1.5} strokeDasharray="6,4" rx={2} />;
                                  })()}

                                  {/* Snap points in draw mode */}
                                  {(drawMode === "line" || drawMode === "apertura") && getSnapPoints().map((p, pi) => (
                                    <circle key={`sp${pi}`} cx={p.x} cy={p.y} r={3} fill={drawMode === "apertura" ? T.blue : T.purple} fillOpacity={0.2} />
                                  ))}

                                  {/* ══ CLOSED POLYGON PROFILE (proper mitered corners) ══ */}
                                  {poly && poly.length >= 3 && (() => {
                                    const n = poly.length;
                                    const halfT = TK_FRAME;
                                    // Compute centroid for inner/outer direction
                                    const cx = poly.reduce((s, p) => s + p[0], 0) / n;
                                    const cy = poly.reduce((s, p) => s + p[1], 0) / n;
                                    // Offset each vertex outward and inward
                                    const outerPts = [];
                                    const innerPts = [];
                                    for (let i = 0; i < n; i++) {
                                      const prev = poly[(i - 1 + n) % n];
                                      const curr = poly[i];
                                      const next = poly[(i + 1) % n];
                                      // Edge normals (pointing outward from centroid)
                                      const d1x = curr[0] - prev[0], d1y = curr[1] - prev[1];
                                      const d2x = next[0] - curr[0], d2y = next[1] - curr[1];
                                      const len1 = Math.hypot(d1x, d1y) || 1;
                                      const len2 = Math.hypot(d2x, d2y) || 1;
                                      let n1x = -d1y / len1, n1y = d1x / len1;
                                      let n2x = -d2y / len2, n2y = d2x / len2;
                                      // Ensure normals point outward (away from centroid)
                                      const midE1x = (prev[0] + curr[0]) / 2, midE1y = (prev[1] + curr[1]) / 2;
                                      if ((midE1x + n1x - cx) * (midE1x + n1x - cx) + (midE1y + n1y - cy) * (midE1y + n1y - cy) <
                                          (midE1x - n1x - cx) * (midE1x - n1x - cx) + (midE1y - n1y - cy) * (midE1y - n1y - cy)) {
                                        n1x = -n1x; n1y = -n1y;
                                      }
                                      const midE2x = (curr[0] + next[0]) / 2, midE2y = (curr[1] + next[1]) / 2;
                                      if ((midE2x + n2x - cx) * (midE2x + n2x - cx) + (midE2y + n2y - cy) * (midE2y + n2y - cy) <
                                          (midE2x - n2x - cx) * (midE2x - n2x - cx) + (midE2y - n2y - cy) * (midE2y - n2y - cy)) {
                                        n2x = -n2x; n2y = -n2y;
                                      }
                                      // Average normal at vertex (bisector)
                                      let bx = n1x + n2x, by = n1y + n2y;
                                      const bLen = Math.hypot(bx, by) || 1;
                                      bx /= bLen; by /= bLen;
                                      // Miter length
                                      const dot = n1x * bx + n1y * by;
                                      const miter = dot > 0.3 ? halfT / dot : halfT;
                                      outerPts.push([curr[0] + bx * miter, curr[1] + by * miter]);
                                      innerPts.push([curr[0] - bx * miter, curr[1] - by * miter]);
                                    }
                                    const outerStr = outerPts.map(p => p.join(",")).join(" ");
                                    const innerStr = innerPts.map(p => p.join(",")).join(" ");
                                    return (
                                      <g>
                                        {/* Fill between outer and inner */}
                                        <polygon points={outerStr} fill="#f0efe8" stroke="none" />
                                        <polygon points={innerStr} fill="#fff" stroke="none" />
                                        {/* Outer stroke */}
                                        <polygon points={outerStr} fill="none" stroke="#1A1A1C" strokeWidth={1.5} strokeLinejoin="miter" />
                                        {/* Inner stroke */}
                                        <polygon points={innerStr} fill="none" stroke="#1A1A1C" strokeWidth={1} strokeLinejoin="miter" />
                                        {/* Corner dots */}
                                        {poly.map((p, pi) => <circle key={`pc${pi}`} cx={p[0]} cy={p[1]} r={3.5} fill="#333" />)}
                                      </g>
                                    );
                                  })()}

                                  {/* ══ ELEMENTS ══ */}
                                  {els.map(el => {
                                    const sel = el.id === selId;
                                    const hc = sel ? T.purple : undefined;
                                    const dp = !drawMode ? { onMouseDown: (e3) => onDrag(e3, el.id), onTouchStart: (e3) => onDrag(e3, el.id), style: { cursor: "move" } } : {};

                                    // ═══ TELAIO — doppio rettangolo con spessore ═══
                                    if (el.type === "rect") return (
                                      <g key={el.id} {...dp}>
                                        <rect x={el.x} y={el.y} width={el.w} height={el.h} fill="#f8f8f6" stroke={hc || "#1A1A1C"} strokeWidth={1.5} rx={1} />
                                        <rect x={el.x + TK_FRAME} y={el.y + TK_FRAME} width={el.w - TK_FRAME * 2} height={el.h - TK_FRAME * 2} fill="none" stroke={hc || "#1A1A1C"} strokeWidth={1} rx={0.5} />
                                        {sel && [[el.x,el.y],[el.x+el.w,el.y],[el.x,el.y+el.h],[el.x+el.w,el.y+el.h]].map(([px,py],pi) => <circle key={pi} cx={px} cy={py} r={4} fill={T.purple} />)}
                                      </g>
                                    );

                                    // ═══ MONTANTE — clipped to polygon ═══
                                    if (el.type === "montante") {
                                      const my1 = el.y1 !== undefined ? el.y1 : (frame ? frame.y : fY);
                                      const my2 = el.y2 !== undefined ? el.y2 : (frame ? frame.y + frame.h : fY + fH);
                                      return (
                                        <g key={el.id} clipPath={poly ? `url(#polyClip-${vanoId})` : undefined} onClick={(e3) => { e3.stopPropagation(); setMode({ selectedId: el.id }); }} {...(!drawMode ? { onMouseDown: (e3) => onDrag(e3, el.id) } : {})} style={{ cursor: drawMode ? undefined : "ew-resize" }}>
                                          <rect x={el.x - TK_MONT / 2} y={my1} width={TK_MONT} height={my2 - my1} fill="#e8e8e4" stroke={hc || "#555"} strokeWidth={0.8} />
                                          {sel && <><circle cx={el.x} cy={my1} r={4} fill={T.purple}/><circle cx={el.x} cy={my2} r={4} fill={T.purple}/></>}
                                        </g>
                                      );
                                    }

                                    // ═══ TRAVERSO — clipped to polygon ═══
                                    if (el.type === "traverso") {
                                      const tx1 = el.x1 !== undefined ? el.x1 : (frame ? frame.x : fX);
                                      const tx2 = el.x2 !== undefined ? el.x2 : (frame ? frame.x + frame.w : fX + fW);
                                      return (
                                        <g key={el.id} clipPath={poly ? `url(#polyClip-${vanoId})` : undefined} onClick={(e3) => { e3.stopPropagation(); setMode({ selectedId: el.id }); }} {...(!drawMode ? { onMouseDown: (e3) => onDrag(e3, el.id) } : {})} style={{ cursor: drawMode ? undefined : "ns-resize" }}>
                                          <rect x={tx1} y={el.y - TK_MONT / 2} width={tx2 - tx1} height={TK_MONT} fill="#e8e8e4" stroke={hc || "#555"} strokeWidth={0.8} />
                                          {sel && <><circle cx={tx1} cy={el.y} r={4} fill={T.purple}/><circle cx={tx2} cy={el.y} r={4} fill={T.purple}/></>}
                                        </g>
                                      );
                                    }

                                    // ═══ ANTA — doppio rettangolo, clipped to polygon ═══
                                    if (el.type === "innerRect") {
                                      const tk = el.subType === "porta" ? TK_PORTA : TK_ANTA;
                                      const clr = hc || (el.subType === "porta" ? "#444" : "#777");
                                      return (
                                        <g key={el.id} clipPath={poly ? `url(#polyClip-${vanoId})` : undefined} onClick={(e3) => { e3.stopPropagation(); if (!drawMode) setMode({ selectedId: el.id }); }}>
                                          <rect x={el.x} y={el.y} width={el.w} height={el.h} fill="none" stroke={clr} strokeWidth={1} />
                                          <rect x={el.x + tk} y={el.y + tk} width={el.w - tk * 2} height={el.h - tk * 2} fill="none" stroke={clr} strokeWidth={0.6} />
                                          {el.subType === "porta" && <text x={el.x + el.w / 2} y={el.y + 12} textAnchor="middle" fontSize={7} fill="#555" fontWeight={700}>PORTA</text>}
                                        </g>
                                      );
                                    }

                                    // ═══ PERSIANA — clipped to polygon ═══
                                    if (el.type === "persiana") {
                                      const slats = [];
                                      const gap = 8;
                                      const pk = 3;
                                      for (let sy = el.y + pk + gap; sy < el.y + el.h - pk; sy += gap) slats.push(sy);
                                      return (
                                        <g key={el.id} clipPath={poly ? `url(#polyClip-${vanoId})` : undefined} onClick={(e3) => { e3.stopPropagation(); if (!drawMode) setMode({ selectedId: el.id }); }}>
                                          <rect x={el.x} y={el.y} width={el.w} height={el.h} fill="#f5f0e8" stroke={hc || "#8a7a60"} strokeWidth={1} />
                                          <rect x={el.x + pk} y={el.y + pk} width={el.w - pk * 2} height={el.h - pk * 2} fill="none" stroke={hc || "#8a7a60"} strokeWidth={0.5} />
                                          {slats.map((sy2, si) => <line key={si} x1={el.x + pk + 1} y1={sy2} x2={el.x + el.w - pk - 1} y2={sy2} stroke={hc || "#a09080"} strokeWidth={0.8} />)}
                                          <text x={el.x + el.w / 2} y={el.y + 10} textAnchor="middle" fontSize={6} fill="#8a7a60" fontWeight={700}>PERSIANA</text>
                                        </g>
                                      );
                                    }

                                    // ═══ VETRO — clipped to polygon ═══
                                    if (el.type === "glass") return (
                                      <g key={el.id} clipPath={poly ? `url(#polyClip-${vanoId})` : undefined} onClick={(e3) => { e3.stopPropagation(); if (!drawMode) setMode({ selectedId: el.id }); }}>
                                        <rect x={el.x} y={el.y} width={el.w} height={el.h} fill="#d8ecf8" fillOpacity={0.25} stroke={hc || "#8bb8e8"} strokeWidth={0.5} />
                                        <line x1={el.x} y1={el.y} x2={el.x + Math.min(el.w, el.h) * 0.3} y2={el.y + Math.min(el.w, el.h) * 0.3} stroke="#b0d4f0" strokeWidth={0.5} />
                                      </g>
                                    );

                                    // ═══ POLYGON ANTA — follows actual shape ═══
                                    if (el.type === "polyAnta" && el.poly) {
                                      const pts = el.poly;
                                      const tk = el.subType === "porta" ? TK_PORTA : TK_ANTA;
                                      // Outer polygon
                                      const outerPts = pts.map(p => p.join(",")).join(" ");
                                      // Inner polygon — shrink by tk toward centroid
                                      const cx2 = pts.reduce((s, p) => s + p[0], 0) / pts.length;
                                      const cy2 = pts.reduce((s, p) => s + p[1], 0) / pts.length;
                                      const innerPts = pts.map(p => {
                                        const dx2 = cx2 - p[0], dy2 = cy2 - p[1];
                                        const dist = Math.hypot(dx2, dy2) || 1;
                                        return [(p[0] + dx2 / dist * tk), (p[1] + dy2 / dist * tk)];
                                      });
                                      const innerStr = innerPts.map(p => p.join(",")).join(" ");
                                      return (
                                        <g key={el.id} onClick={(e3) => { e3.stopPropagation(); if (!drawMode) setMode({ selectedId: el.id }); }}>
                                          <polygon points={outerPts} fill="#f8f8f6" fillOpacity={0.3} stroke={hc || "#777"} strokeWidth={1} />
                                          <polygon points={innerStr} fill="none" stroke={hc || "#777"} strokeWidth={0.6} />
                                          {el.subType === "porta" && <text x={cx2} y={cy2} textAnchor="middle" fontSize={8} fill="#555" fontWeight={700}>PORTA</text>}
                                        </g>
                                      );
                                    }

                                    // ═══ POLYGON VETRO — glass following shape ═══
                                    if (el.type === "polyGlass" && el.poly) {
                                      const pts = el.poly;
                                      const cx2 = pts.reduce((s, p) => s + p[0], 0) / pts.length;
                                      const cy2 = pts.reduce((s, p) => s + p[1], 0) / pts.length;
                                      const shrink = TK_ANTA + 2;
                                      const glassPts = pts.map(p => {
                                        const dx2 = cx2 - p[0], dy2 = cy2 - p[1];
                                        const dist = Math.hypot(dx2, dy2) || 1;
                                        return [(p[0] + dx2 / dist * shrink), (p[1] + dy2 / dist * shrink)];
                                      });
                                      return (
                                        <g key={el.id} onClick={(e3) => { e3.stopPropagation(); if (!drawMode) setMode({ selectedId: el.id }); }}>
                                          <polygon points={glassPts.map(p => p.join(",")).join(" ")} fill="#d8ecf8" fillOpacity={0.25} stroke={hc || "#8bb8e8"} strokeWidth={0.5} />
                                          <line x1={glassPts[0][0]} y1={glassPts[0][1]} x2={cx2} y2={cy2} stroke="#b0d4f0" strokeWidth={0.4} />
                                        </g>
                                      );
                                    }

                                    // ═══ POLYGON PERSIANA — slats following shape ═══
                                    if (el.type === "polyPersiana" && el.poly) {
                                      const pts = el.poly;
                                      const outerPts = pts.map(p => p.join(",")).join(" ");
                                      const allY2 = pts.map(p => p[1]);
                                      const minY2 = Math.min(...allY2), maxY2 = Math.max(...allY2);
                                      const allX2 = pts.map(p => p[0]);
                                      const minX2 = Math.min(...allX2), maxX2 = Math.max(...allX2);
                                      const clipId = `pers-${el.id}`;
                                      const slats = [];
                                      for (let sy = minY2 + 10; sy < maxY2 - 4; sy += 8) slats.push(sy);
                                      return (
                                        <g key={el.id} onClick={(e3) => { e3.stopPropagation(); if (!drawMode) setMode({ selectedId: el.id }); }}>
                                          <defs><clipPath id={clipId}><polygon points={outerPts} /></clipPath></defs>
                                          <polygon points={outerPts} fill="#f5f0e8" stroke={hc || "#8a7a60"} strokeWidth={1} />
                                          <g clipPath={`url(#${clipId})`}>
                                            {slats.map((sy, si) => <line key={si} x1={minX2 + 4} y1={sy} x2={maxX2 - 4} y2={sy} stroke="#a09080" strokeWidth={0.8} />)}
                                          </g>
                                        </g>
                                      );
                                    }

                                    if (el.type === "circle") return (
                                      <g key={el.id} {...dp}>
                                        <circle cx={el.cx} cy={el.cy} r={el.r} fill="#e8f4fc" fillOpacity={0.2} stroke={hc || "#4a90d9"} strokeWidth={sel ? 2.5 : 1.5} />
                                        {sel && [[el.cx,el.cy-el.r],[el.cx+el.r,el.cy],[el.cx,el.cy+el.r],[el.cx-el.r,el.cy]].map(([px,py],pi) => <circle key={pi} cx={px} cy={py} r={4} fill={T.purple} />)}
                                      </g>
                                    );

                                    // ═══ TEXT LABEL — draggable, editable on double-click ═══
                                    if (el.type === "label") return (
                                      <g key={el.id} onClick={(e3) => { e3.stopPropagation(); if (!drawMode) setMode({ selectedId: el.id }); }}
                                        {...(!drawMode ? { onMouseDown: (e3) => onDrag(e3, el.id) } : {})}
                                        onDoubleClick={() => {
                                          const newTxt = prompt("Modifica testo:", el.text);
                                          if (newTxt !== null) setDW(els.map(x => x.id === el.id ? { ...x, text: newTxt } : x));
                                        }}
                                        style={{ cursor: drawMode ? undefined : "move" }}>
                                        {sel && <rect x={el.x - 4} y={el.y - (el.fontSize || 11) - 2} width={Math.max(40, (el.text || "").length * 6)} height={(el.fontSize || 11) + 8} fill={`${T.purple}10`} stroke={T.purple} strokeWidth={1} strokeDasharray="3,2" rx={3} />}
                                        <text x={el.x} y={el.y} fontSize={el.fontSize || 11} fontWeight={700} fill={hc || "#333"} fontFamily="Inter, sans-serif">{el.text}</text>
                                      </g>
                                    );

                                    if (el.type === "freeLine") {
                                      const dx2 = el.x2 - el.x1, dy2 = el.y2 - el.y1;
                                      const len = Math.hypot(dx2, dy2) || 1;
                                      const halfT = TK_FRAME;
                                      const nx = -dy2 / len * halfT, ny = dx2 / len * halfT;
                                      // Dimension in mm
                                      const refLen = frame ? Math.max(frame.w, frame.h) : fW;
                                      const refReal = frame ? (frame.w >= frame.h ? realW : realH) : realW;
                                      const mmLen = Math.round(len / refLen * refReal);
                                      const midX = (el.x1 + el.x2) / 2, midY = (el.y1 + el.y2) / 2;
                                      const ang = Math.atan2(dy2, dx2) * 180 / Math.PI;
                                      const lx = midX + nx * 2, ly = midY + ny * 2;
                                      const isPartOfPoly = poly && poly.length >= 3;
                                      return (
                                        <g key={el.id} onClick={(e3) => { e3.stopPropagation(); if (!drawMode) setMode({ selectedId: el.id }); }} {...(!drawMode ? { onMouseDown: (e3) => onDrag(e3, el.id) } : {})}>
                                          {/* Wide transparent hit area */}
                                          <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke="transparent" strokeWidth={14} />
                                          {/* Individual profile only if NOT part of closed polygon */}
                                          {!isPartOfPoly && <polygon points={`${el.x1+nx},${el.y1+ny} ${el.x2+nx},${el.y2+ny} ${el.x2-nx},${el.y2-ny} ${el.x1-nx},${el.y1-ny}`} fill="#f0efe8" stroke="#1A1A1C" strokeWidth={1} strokeLinejoin="miter" />}
                                          {sel && <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke={T.purple} strokeWidth={3} opacity={0.4} />}
                                          {/* Dimension label */}
                                          <g transform={`rotate(${ang > 90 || ang < -90 ? ang + 180 : ang}, ${lx}, ${ly})`}>
                                            <rect x={lx - 18} y={ly - 7} width={36} height={14} fill="#fff" rx={3} stroke={T.acc} strokeWidth={0.6} opacity={0.9} />
                                            <text x={lx} y={ly + 4} textAnchor="middle" fontSize={8} fontWeight={700} fill={T.acc} fontFamily="monospace">{mmLen}</text>
                                          </g>
                                          {sel && <><circle cx={el.x1} cy={el.y1} r={5} fill={T.purple} /><circle cx={el.x2} cy={el.y2} r={5} fill={T.purple} /></>}
                                        </g>
                                      );
                                    }

                                    if (el.type === "apLine") return (
                                      <g key={el.id} onClick={(e3) => { e3.stopPropagation(); if (!drawMode) setMode({ selectedId: el.id }); }}>
                                        <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke={hc || T.blue} strokeWidth={sel ? 3 : 2} strokeDasharray={el.dash ? "6,4" : "none"} />
                                        <circle cx={el.x1} cy={el.y1} r={sel ? 5 : 3} fill={hc || T.blue} />
                                        <circle cx={el.x2} cy={el.y2} r={sel ? 5 : 3} fill={hc || T.blue} />
                                      </g>
                                    );

                                    if (el.type === "apLabel") {
                                      const tw = String(el.label).length * 7 + 14;
                                      return (
                                        <g key={el.id} onClick={(e3) => { e3.stopPropagation(); if (!drawMode) setMode({ selectedId: el.id }); }}>
                                          <rect x={el.x - tw / 2} y={el.y - 8} width={tw} height={16} fill={hc || T.blue} rx={3} fillOpacity={0.85} />
                                          <text x={el.x} y={el.y + 4} textAnchor="middle" fontSize={9} fontWeight={800} fill="#fff">{el.label}</text>
                                        </g>
                                      );
                                    }

                                    if (el.type === "dim") {
                                      const isH = Math.abs(el.y1 - el.y2) < 2;
                                      const mx2 = (el.x1 + el.x2) / 2, my2 = (el.y1 + el.y2) / 2;
                                      const tw = String(el.label).length * 6.5 + 16;
                                      return (
                                        <g key={el.id} onClick={(e3) => {
                                          e3.stopPropagation();
                                          const nv = prompt("Misura (mm):", el.label);
                                          if (nv === null || !nv.trim()) return;
                                          const newVal = parseInt(nv.trim());
                                          const oldVal = parseInt(el.label);
                                          let upd = els.map(x => x.id === el.id ? { ...x, label: nv.trim() } : x);
                                          
                                          // If this is a sub-dimension (column width or row height), adjust structure
                                          if (!isNaN(newVal) && !isNaN(oldVal) && newVal !== oldVal && frame) {
                                            // Is this a column width? (horizontal dim above or below frame)
                                            const isColDim = isH && el.y1 < frame.y + frame.h / 2;
                                            // Is this a row height? (vertical dim left of frame)
                                            const isRowDim = !isH && el.x1 < frame.x + frame.w / 2;
                                            // Is this total width/height?
                                            const isTotalW = isH && Math.abs(el.x2 - el.x1 - frame.w) < 5;
                                            const isTotalH = !isH && Math.abs(el.y2 - el.y1 - frame.h) < 5;
                                            
                                            if (isColDim && !isTotalW) {
                                              // Find which column this dim spans, adjust montante
                                              const dimLeft = el.x1;
                                              const oldPixelW = el.x2 - el.x1;
                                              const scale = newVal / oldVal;
                                              const newPixelW = oldPixelW * scale;
                                              const diff = newPixelW - oldPixelW;
                                              // Move all montanti and elements that are to the right of this dim's right edge
                                              upd = upd.map(x => {
                                                if (x.type === "montante" && x.x >= el.x2 - 3) return { ...x, x: snap(x.x + diff) };
                                                if (x.type === "dim" && x !== el && x.x1 >= el.x2 - 3) return { ...x, x1: x.x1 + diff, x2: x.x2 + diff };
                                                if ((x.type === "innerRect" || x.type === "glass") && x.x >= el.x2 - 5) return { ...x, x: x.x + diff };
                                                return x;
                                              });
                                              // Update frame width
                                              upd = upd.map(x => x.type === "rect" ? { ...x, w: x.w + diff } : x);
                                            }
                                            if (isRowDim && !isTotalH) {
                                              const oldPixelH = el.y2 - el.y1;
                                              const scale = newVal / oldVal;
                                              const newPixelH = oldPixelH * scale;
                                              const diff = newPixelH - oldPixelH;
                                              upd = upd.map(x => {
                                                if (x.type === "traverso" && x.y >= el.y2 - 3) return { ...x, y: snap(x.y + diff) };
                                                if (x.type === "dim" && x !== el && x.y1 >= el.y2 - 3) return { ...x, y1: x.y1 + diff, y2: x.y2 + diff };
                                                if ((x.type === "innerRect" || x.type === "glass") && x.y >= el.y2 - 5) return { ...x, y: x.y + diff };
                                                return x;
                                              });
                                              upd = upd.map(x => x.type === "rect" ? { ...x, h: x.h + diff } : x);
                                            }
                                          }
                                          setDW(upd);
                                          // Sync total dimensions to main fields
                                          if (frame) {
                                            const isTW = isH && Math.abs(el.x2 - el.x1 - frame.w) < 5;
                                            const isTH = !isH && Math.abs(el.y2 - el.y1 - frame.h) < 5;
                                            if (isTW && !isNaN(newVal)) onUpdateField && onUpdateField("larghezza", newVal);
                                            if (isTH && !isNaN(newVal)) onUpdateField && onUpdateField("altezza", newVal);
                                          }
                                        }} style={{ cursor: "pointer" }}>
                                          <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke={T.acc} strokeWidth={0.8} />
                                          {isH ? <><line x1={el.x1} y1={el.y1-5} x2={el.x1} y2={el.y1+5} stroke={T.acc} strokeWidth={0.8}/><line x1={el.x2} y1={el.y2-5} x2={el.x2} y2={el.y2+5} stroke={T.acc} strokeWidth={0.8}/></>
                                            : <><line x1={el.x1-5} y1={el.y1} x2={el.x1+5} y2={el.y1} stroke={T.acc} strokeWidth={0.8}/><line x1={el.x2-5} y1={el.y2} x2={el.x2+5} y2={el.y2} stroke={T.acc} strokeWidth={0.8}/></>}
                                          <rect x={mx2-tw/2} y={my2-9} width={tw} height={18} fill="#fff" rx={3} stroke={T.acc} strokeWidth={0.6}/>
                                          <text x={mx2} y={my2+4} textAnchor="middle" fontSize={10} fontWeight={800} fill={T.acc} fontFamily="monospace">{el.label}</text>
                                        </g>
                                      );
                                    }
                                    return null;
                                  })}

                                  {/* Pending line point + GUIDE */}
                                  {dw._pendingLine && (() => {
                                    const clr = drawMode === "apertura" ? T.blue : "#333";
                                    const p = dw._pendingLine;
                                    const gx = dw._guideX, gy = dw._guideY;
                                    return <>
                                      {/* H/V guide lines from pending point */}
                                      <line x1={0} y1={p.y1} x2={canvasW} y2={p.y1} stroke="#ccc" strokeWidth={0.5} strokeDasharray="4,4" />
                                      <line x1={p.x1} y1={0} x2={p.x1} y2={canvasH} stroke="#ccc" strokeWidth={0.5} strokeDasharray="4,4" />
                                      {/* Live guide line to mouse */}
                                      {gx != null && gy != null && <>
                                        <line x1={p.x1} y1={p.y1} x2={gx} y2={gy} stroke={clr} strokeWidth={1} strokeDasharray="6,3" opacity={0.5} />
                                        {/* H/V snap indicator */}
                                        {gx === p.x1 && <line x1={gx} y1={0} x2={gx} y2={canvasH} stroke={T.grn} strokeWidth={0.7} strokeDasharray="2,2" opacity={0.5} />}
                                        {gy === p.y1 && <line x1={0} y1={gy} x2={canvasW} y2={gy} stroke={T.grn} strokeWidth={0.7} strokeDasharray="2,2" opacity={0.5} />}
                                        {/* Angle + length label */}
                                        <rect x={gx + 8} y={gy - 20} width={72} height={18} fill="#333" rx={4} opacity={0.85} />
                                        <text x={gx + 44} y={gy - 8} textAnchor="middle" fontSize={9} fontWeight={700} fill="#fff" fontFamily="monospace">
                                          {dw._guideDeg != null ? `${dw._guideDeg}° ${dw._guideLen}mm` : ""}
                                        </text>
                                      </>}
                                      <circle cx={p.x1} cy={p.y1} r={6} fill={clr} fillOpacity={0.4} />
                                      <circle cx={p.x1} cy={p.y1} r={10} fill="none" stroke={clr} strokeWidth={1.5} strokeDasharray="3,2" />
                                    </>;
                                  })()}

                                  {/* Live drag dimension */}
                                  {dw._dragDim && (() => {
                                    const dd = dw._dragDim;
                                    const midY = (dd.y1 + dd.y2) / 2;
                                    if (dd.type === "v") {
                                      // Vertical montante — show ← left mm | right mm →
                                      return <>
                                        <rect x={dd.x - 62} y={midY - 8} width={56} height={16} fill={T.acc} rx={3} />
                                        <text x={dd.x - 34} y={midY + 4} textAnchor="middle" fontSize={10} fontWeight={800} fill="#fff" fontFamily="monospace">← {dd.leftMM}</text>
                                        <rect x={dd.x + 6} y={midY - 8} width={56} height={16} fill={T.acc} rx={3} />
                                        <text x={dd.x + 34} y={midY + 4} textAnchor="middle" fontSize={10} fontWeight={800} fill="#fff" fontFamily="monospace">{dd.rightMM} →</text>
                                      </>;
                                    }
                                    if (dd.type === "h") {
                                      const midX = (dd.x1 + dd.x2) / 2;
                                      return <>
                                        <rect x={midX - 28} y={dd.y - 22} width={56} height={16} fill={T.acc} rx={3} />
                                        <text x={midX} y={dd.y - 10} textAnchor="middle" fontSize={10} fontWeight={800} fill="#fff" fontFamily="monospace">↑ {dd.topMM}</text>
                                        <rect x={midX - 28} y={dd.y + 6} width={56} height={16} fill={T.acc} rx={3} />
                                        <text x={midX} y={dd.y + 18} textAnchor="middle" fontSize={10} fontWeight={800} fill="#fff" fontFamily="monospace">{dd.botMM} ↓</text>
                                      </>;
                                    }
                                    return null;
                                  })()}
                                </svg>
                                </div>

                                {/* Footer */}
                                <div style={{ padding: "4px 10px 5px", fontSize: 9, textAlign: "center", color: (drawMode === "place-anta" || drawMode === "place-vetro" || drawMode === "place-porta" || drawMode === "place-persiana") ? T.grn : (drawMode === "apertura" || drawMode === "place-ap") ? T.blue : (drawMode === "line" || drawMode === "place-mont" || drawMode === "place-trav") ? "#555" : T.sub, fontWeight: drawMode ? 700 : 400 }}>
                                  {drawMode === "line" ? "⚫ Click per tracciare struttura · Le linee si concatenano"
                                    : drawMode === "apertura" ? "🔵 Click libero per disegnare apertura in blu"
                                    : drawMode === "place-mont" ? "⬛ Click su una CELLA per aggiungere il montante verticale"
                                    : drawMode === "place-trav" ? "⬛ Click su una CELLA per aggiungere il traverso orizzontale"
                                    : drawMode === "place-anta" ? "🟢 Click sulla CELLA per inserire l'anta"
                                    : drawMode === "place-porta" ? "🟢 Click sulla CELLA per inserire anta porta (profilo spesso)"
                                    : drawMode === "place-persiana" ? "🟢 Click sulla CELLA per inserire persiana con stecche"
                                    : drawMode === "place-vetro" ? "🟢 Click sulla CELLA per inserire il vetro (dentro l'anta)"
                                    : drawMode === "place-ap" ? `🔵 Click sulla CELLA per apertura ${placeApType}`
                                    : `${els.length} el. · ${cells.length} celle · Click per selezionare`}
                                </div>
                              </div>
                            );
}

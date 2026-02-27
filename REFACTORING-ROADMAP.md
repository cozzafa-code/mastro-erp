# MASTRO ERP — Refactoring Roadmap

## Stato Attuale: v47 Phase A ✅

### Struttura Files

```
components/
├── MastroERP.tsx          (13,882 righe — main component)
└── mastro/
    ├── index.ts           (barrel exports)
    ├── data/
    │   ├── types.ts       (309 righe — TypeScript interfaces)
    │   ├── themes.ts      (54 righe — chiaro/scuro/oceano)
    │   ├── constants.ts   (250 righe — pipeline, settori, tipologie, config)
    │   └── demo-data.ts   (464 righe — 6 commesse demo + fatture/ordini/montaggi)
    ├── lib/
    │   ├── calcoli.ts     (122 righe — calcolaVanoPrezzo, totaleCommessa, fmt, getVaniAttivi)
    │   ├── pdf-generators.ts (1033 righe — preventivo, misure, fattura, ordine, tracking)
    │   └── pdf-extraction.ts (46 righe — AI extraction via Supabase Edge)
    ├── ui/
    │   └── Ico.tsx         (30 righe — SVG icon component + ICO paths)
    └── hooks/
        └── useDragOrder.ts (17 righe — drag & drop reorder hook)
```

**Totale moduli: 2,325 righe estratte**
**Main file: da 14,661 → 13,882 righe** (−779 righe, −5.3%)

### Cosa è stato estratto (Phase A)
- ✅ TypeScript types per tutte le strutture dati
- ✅ 3 temi (chiaro, scuro, oceano) 
- ✅ 22 costanti di configurazione (pipeline, settori, tipologie, etc.)
- ✅ 5 dataset demo (cantieri, fatture, ordini, montaggi, tasks)
- ✅ Icone SVG (component + 23 path icons)
- ✅ Hook useDragOrder
- ✅ Funzioni calcolo pure (calcolaVanoPrezzo, calcolaTotaleCommessa)
- ✅ 7 generatori PDF/HTML (preventivo, misure, fattura, ordine, conferma, tracking)
- ✅ AI PDF extraction

### Cosa resta nel main file
- 179 useState hooks (DEVE restare — single source of truth)
- Cloud sync helpers (Supabase debounced save/load)
- Business logic (setFaseTo, auto-advance, creaFattura, creaOrdine, etc.)
- Styles (oggetto S con tutte le proprietà CSS)
- 20 render functions (renderHome, renderCommesse, etc.)
- Modals (problemi, onboarding, firma, preventivo, etc.)
- Main render + tab dispatch

---

## Phase B — Tab Components (prossimo step)

### Problema da risolvere
Le tab (renderHome, renderCommesse, etc.) condividono **render functions**:
- `renderCMCard` → usato da Home + Commesse
- `renderFasePanel` → usato da Home + Commesse
- `renderRiepilogo` → usato da Home + Commesse
- `renderEventCard` → usato da Home + Agenda

**NON si può** estrarre TabHome senza che abbia accesso a renderCMCard.

### Soluzione: Shared UI Components + Context

```
mastro/
├── context/
│   └── MastroContext.tsx     ← createContext + useMastro hook
├── ui/
│   ├── Ico.tsx               ← già fatto
│   ├── CMCard.tsx            ← da renderCMCard (76 righe)
│   ├── CMCardCompact.tsx     ← da renderCMCardCompact (55 righe)
│   ├── EventCard.tsx         ← da renderEventCard (30 righe)
│   ├── FasePanel.tsx         ← da renderFasePanel (337 righe) ⚠️ complesso
│   └── Riepilogo.tsx         ← da renderRiepilogo (405 righe) ⚠️ complesso
├── tabs/
│   ├── TabHome.tsx           (~750 righe)
│   ├── TabCommesse.tsx       (~2,500 righe)
│   ├── TabClienti.tsx        (~260 righe)
│   ├── TabAgenda.tsx         (~500 righe)
│   ├── TabMessaggi.tsx       (~300 righe)
│   └── TabSettings.tsx       (~1,600 righe)
└── modals/
    ├── ModalMain.tsx         (~900 righe)
    ├── ModalPreventivo.tsx   (~2,000 righe)
    ├── ModalOnboarding.tsx   (~250 righe)
    ├── ModalProblemi.tsx     (~200 righe)
    └── CalendarMontaggi.tsx  (~440 righe)
```

### Pattern per ogni UI Component

```tsx
// mastro/ui/CMCard.tsx
import React from "react";
import { useMastro } from "../context/MastroContext";
import { Ico, ICO } from "./Ico";
import { AFASE } from "../data/constants";

interface Props { commessa: any; inGrid?: boolean; }

export default function CMCard({ commessa: c, inGrid }: Props) {
  const { T, S, FF, FM, fmt, setSelectedCM, setTab } = useMastro();
  // ... body di renderCMCard
}
```

### Ordine di estrazione consigliato
1. **CMCard + CMCardCompact** (piccoli, poche dipendenze)
2. **EventCard** (piccolo)
3. **TabClienti** (piccolo, poche dipendenze)
4. **TabMessaggi** (piccolo)
5. **TabAgenda** (medio, dipende da EventCard)
6. **TabHome** (medio, dipende da CMCard)
7. **TabSettings** (grande ma autocontenuto)
8. **FasePanel** (complesso — molte azioni business)
9. **Riepilogo** (complesso — PDF + invio)
10. **TabCommesse** (il più grande — fare per ultimo)
11. **Modals** (ultimo — dipendono da tutto)

### Risultato atteso Phase B
```
MastroERP.tsx    → ~3,500 righe (state + business logic + context + dispatch)
mastro/tabs/     → ~5,900 righe (6 tab components)
mastro/ui/       → ~930 righe (5 shared components)
mastro/modals/   → ~3,800 righe (5 modals)
mastro/data/     → ~1,077 righe (invariato)
mastro/lib/      → ~1,200 righe (invariato)
                   ─────────
Totale:          ~16,400 righe in 25 files
```

Main file: **da 13,882 → ~3,500 righe** (−75%)

---

## Phase C — Advanced (futuro)

- [ ] Tipizzazione completa (rimuovere `any` progressivamente)
- [ ] Unit test per calcoli.ts e pdf-generators.ts
- [ ] Storybook per UI components
- [ ] Code splitting / lazy loading per tab
- [ ] Custom hooks per logiche ripetute (useCommessa, useFatturazione)
- [ ] State management (Zustand o Redux Toolkit) al posto di 179 useState
- [ ] Server components (Next.js 14+) dove possibile

// ═══════════════════════════════════════════════════════════
// MASTRO ERP — Context (Phase B)
// Condivide tutto lo state tra i componenti estratti
// ═══════════════════════════════════════════════════════════
import { createContext, useContext } from "react";

export const MastroContext = createContext<any>(null);
export const useMastro = () => {
  const ctx = useContext(MastroContext);
  if (!ctx) throw new Error("useMastro must be used within MastroProvider");
  return ctx;
};

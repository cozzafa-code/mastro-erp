"use client";
import React, { useState, useEffect } from "react";
import MastroAuth from "@/components/MastroAuth";
import MastroERP from "@/components/MastroERP";

// ═══════════════════════════════════════════════════════════
// MASTRO — Dashboard Page (Auth Guard)
// Se non loggato → mostra Login
// Se loggato → mostra ERP
// Hydration-safe: renderizza solo dopo mount client
// ═══════════════════════════════════════════════════════════

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Evita hydration mismatch: non renderizzare nulla durante SSR
  if (!mounted) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F2F1EC",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: "#1A1A1C",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 12,
          }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: "#F2F1EC" }}>M</span>
          </div>
          <div style={{ fontSize: 13, color: "#86868b", fontWeight: 600 }}>Caricamento...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <MastroAuth
        onAuth={(u, p) => {
          setUser(u);
          setProfile(p);
        }}
      />
    );
  }

  return <MastroERP />;
}

"use client";
import React, { useState } from "react";
import MastroAuth from "@/components/MastroAuth";
import MastroERP from "@/components/MastroERP";

// ═══════════════════════════════════════════════════════════
// MASTRO — Dashboard Page (Auth Guard)
// Se non loggato → mostra Login
// Se loggato → mostra ERP
// ═══════════════════════════════════════════════════════════

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

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

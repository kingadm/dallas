"use client";

import type { ReactNode } from "react";
import AdminGuard from "./AdminGuard";
import AdminNav from "./AdminNav";

export default function AdminLayoutClient({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <main className="container">
        <div className="card menu-shell" style={{ marginBottom: 16 }}>
          <div style={{ paddingTop: 8 }}>
            <div className="h2" style={{ margin: 0 }}>Painel Administrativo</div>
            <div className="muted small">Dallas Pizzaria</div>
          </div>

          <div className="hr" />
          <AdminNav />
        </div>

        {/* ✅ AQUI é o principal: renderizar o conteúdo */}
        {children ? (
          <div style={{ marginTop: 12 }}>{children}</div>
        ) : (
          <div className="card">
            <h1 className="h1">Conteúdo não carregou</h1>
            <p className="muted">O layout do admin não recebeu children.</p>
          </div>
        )}
      </main>
    </AdminGuard>
  );
}
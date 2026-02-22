"use client";

import type { ReactNode } from "react";
import AdminGuard from "./AdminGuard";
import AdminNav from "./AdminNav";

export default function AdminLayoutClient({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <main className="container">
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div className="h2" style={{ margin: 0 }}>Painel Administrativo</div>
              <div className="muted small">Dallas Pizzaria</div>
            </div>
          </div>

          <div className="hr" />
          <AdminNav />
        </div>

        <div className="card">{children}</div>
      </main>
    </AdminGuard>
  );
}
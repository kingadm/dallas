"use client";

import { useEffect, useState } from "react";
import { apiJson } from "@/lib/api";
import { Category } from "@/lib/types";

export default function AdminCategories() {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const data = await apiJson<Category[]>("/categories");
      setItems(data);
    } catch (e: any) {
      setErr(e?.message || "Erro");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    setErr(null);
    try {
      await apiJson("/categories", {
        method: "POST",
        body: JSON.stringify({ name, isActive: true })
      });
      setName("");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Erro");
    }
  }

  async function update(id: string, patch: Partial<Category>) {
    setErr(null);
    try {
      await apiJson(`/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch)
      });
      await load();
    } catch (e: any) {
      setErr(e?.message || "Erro");
    }
  }

  async function remove(id: string) {
    if (!confirm("Excluir categoria? (produtos dela serão removidos)")) return;
    setErr(null);
    try {
      await apiJson(`/categories/${id}`, { method: "DELETE" });
      await load();
    } catch (e: any) {
      setErr(e?.message || "Erro");
    }
  }

  return (
    <div className="card">
      <h1 className="h1">Categorias</h1>
      <p className="muted">CRUD simples: criar, editar nome/ativo, excluir.</p>

      <div className="hr" />

      <div className="row" style={{ alignItems: "end" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div className="small muted">Nova categoria</div>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Lanches" />
        </div>
        <button className="btn btn-primary" onClick={create} disabled={!name.trim()}>
          Criar
        </button>
      </div>

      {err && (
        <div className="badge" style={{ borderColor: "rgba(239,68,68,0.45)", marginTop: 12 }}>
          {err}
        </div>
      )}

      <div className="hr" />

      <div className="row" style={{ flexDirection: "column" }}>
        {items.map((c) => (
          <div key={c.id} className="card" style={{ padding: 12 }}>
            <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div className="small muted">Nome</div>
                <input
                  className="input"
                  defaultValue={c.name}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== c.name) update(c.id, { name: v });
                  }}
                />
              </div>

              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={c.isActive}
                  onChange={(e) => update(c.id, { isActive: e.target.checked })}
                />
                <span className="small muted">Ativo</span>
              </label>

              <button className="btn btn-danger" onClick={() => remove(c.id)}>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
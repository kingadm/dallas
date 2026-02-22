"use client";

import { useEffect, useMemo, useState } from "react";
import { apiForm, apiJson } from "@/lib/api";
import { Category, Product } from "@/lib/types";
import { formatBRL } from "@/lib/format";

type Mode = "create" | "edit";

// INT4 max (Postgres int32)
const MAX_INT4 = 2147483647;

// ✅ helpers de input monetário (digita números e vira 0,00 / 19,90 / 1.234,56)
function addThousandsDots(intPart: string) {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function digitsToBRLInput(digits: string) {
  if (!digits) return "";
  let d = digits.replace(/^0+(?=\d)/, ""); // remove zeros à esquerda (mantém 0 sozinho)
  d = d.replace(/\D/g, "");
  if (!d) return "";

  // garante pelo menos 3 para formar "0,01"
  const padded = d.padStart(3, "0");
  const centsPart = padded.slice(-2);
  const intPart = padded.slice(0, -2);

  return `${addThousandsDots(intPart)},${centsPart}`;
}

function extractDigits(value: string) {
  return (value || "").replace(/\D/g, "");
}

function clampCentsFromDigits(digits: string): string {
  let d = digits.replace(/\D/g, "");
  if (!d) return "";

  // limita quantidade de dígitos (10 dígitos já cobre até bilhões em centavos)
  if (d.length > 10) d = d.slice(0, 10);

  // limita no máximo do INT4
  const cents = Number(d);
  if (!Number.isFinite(cents)) return "";
  if (cents > MAX_INT4) return String(MAX_INT4);

  return String(cents);
}

export default function AdminProducts() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // ✅ guardamos CENTAVOS como string de dígitos (ex: "1990"), mas mostramos formatado (19,90)
  const [priceDigits, setPriceDigits] = useState<string>("");

  const [isActive, setIsActive] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  const canSubmit = useMemo(() => {
    if (!categoryId || !name.trim()) return false;
    if (mode === "create" && !file) return false;
    return true;
  }, [categoryId, name, file, mode]);

  async function load() {
    setErr(null);
    try {
      const [cats, prods] = await Promise.all([
        apiJson<Category[]>("/categories"),
        apiJson<Product[]>("/products")
      ]);
      setCategories(cats);
      setProducts(prods);
      if (!categoryId && cats[0]?.id) setCategoryId(cats[0].id);
    } catch (e: any) {
      setErr(e?.message || "Erro");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setMode("create");
    setEditingId(null);
    setName("");
    setDescription("");
    setPriceDigits("");
    setIsActive(true);
    setFile(null);
  }

  function startEdit(p: Product) {
    setMode("edit");
    setEditingId(p.id);
    setCategoryId(p.categoryId);
    setName(p.name);
    setDescription(p.description || "");
    setPriceDigits(p.priceCents != null ? String(p.priceCents) : "");
    setIsActive(p.isActive);
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("categoryId", categoryId);
      fd.append("name", name);
      fd.append("description", description);
      fd.append("isActive", String(isActive));

      const cents = priceDigits ? Number(priceDigits) : undefined;
      if (cents !== undefined) fd.append("priceCents", String(cents));

      if (file) fd.append("file", file);

      if (mode === "create") {
        await apiForm("/products", { method: "POST", body: fd });
      } else {
        await apiForm(`/products/${editingId}`, { method: "PATCH", body: fd });
      }

      resetForm();
      await load();
    } catch (e: any) {
      setErr(e?.message || "Erro");
    }
  }

  async function remove(id: string) {
    if (!confirm("Excluir produto?")) return;
    setErr(null);
    try {
      await apiJson(`/products/${id}`, { method: "DELETE" });
      await load();
    } catch (e: any) {
      setErr(e?.message || "Erro");
    }
  }

  async function toggleActive(p: Product) {
    setErr(null);
    try {
      await apiJson(`/products/${p.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !p.isActive })
      });
      await load();
    } catch (e: any) {
      setErr(e?.message || "Erro");
    }
  }

  const previewCents = priceDigits ? Number(priceDigits) : undefined;

  return (
    <div>
      <h1 className="h1">Produtos</h1>
      <p className="muted">Cadastre produtos com foto e preço em reais (R$).</p>

      <div className="hr" />

      <div className="card">
        <h2 className="h2">{mode === "create" ? "Novo produto" : "Editar produto"}</h2>

        <div className="row">
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="small muted">Categoria</div>
            <select className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.isActive ? "" : "(inativa)"}
                </option>
              ))}
            </select>
          </div>

          <label style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 20 }}>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span className="small muted">Ativo</span>
          </label>
        </div>

        <div className="row">
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="small muted">Nome</div>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* ✅ PREÇO EM REAIS (digita e formata automático) */}
          <div style={{ width: 260 }}>
            <div className="small muted">Preço (R$) opcional</div>
            <input
              className="input"
              value={digitsToBRLInput(priceDigits)}
              onChange={(e) => {
                const digits = extractDigits(e.target.value);
                const clamped = clampCentsFromDigits(digits);
                setPriceDigits(clamped);
              }}
              placeholder="Ex: 19,90"
              inputMode="numeric"
            />
            <div className="small muted" style={{ marginTop: 6 }}>
              {previewCents != null ? `Preview: ${formatBRL(previewCents)}` : "Sem preço"}
            </div>
          </div>
        </div>

        <div className="row">
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="small muted">Descrição</div>
            <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        <div className="row" style={{ alignItems: "end" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="small muted">
              Foto {mode === "create" ? "(obrigatória)" : "(opcional para trocar)"}
            </div>
            <input className="input" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          <button className="btn btn-primary" disabled={!canSubmit} onClick={submit}>
            {mode === "create" ? "Criar" : "Salvar"}
          </button>

          {mode === "edit" && (
            <button className="btn" onClick={resetForm}>
              Cancelar
            </button>
          )}
        </div>

        {err && (
          <div className="badge badge-closed" style={{ marginTop: 12 }}>
            {err}
          </div>
        )}
      </div>

      <div className="hr" />

      <div className="grid">
        {products.map((p) => (
          <div key={p.id} className="card">
            <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
              <div className="badge">{p.category?.name || "—"}</div>
              <button className="btn" onClick={() => toggleActive(p)}>
                {p.isActive ? "Ativo" : "Inativo"}
              </button>
            </div>

            <div style={{ marginTop: 10 }}>
              <img
                src={p.imageUrl}
                alt={p.name}
                style={{
                  width: "100%",
                  height: 160,
                  objectFit: "cover",
                  borderRadius: 12,
                  border: "1px solid var(--border)"
                }}
              />
            </div>

            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 700 }}>{p.name}</div>
              {p.description && <div className="muted small">{p.description}</div>}
              <div style={{ marginTop: 6 }}>
                {p.priceCents != null ? (
                  <span className="badge">{formatBRL(p.priceCents)}</span>
                ) : (
                  <span className="badge">Sem preço</span>
                )}
              </div>
            </div>

            <div className="row" style={{ marginTop: 12, justifyContent: "space-between" }}>
              <button className="btn" onClick={() => startEdit(p)}>
                Editar
              </button>
              <button className="btn btn-danger" onClick={() => remove(p.id)}>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
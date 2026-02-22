"use client";

import { useEffect, useState } from "react";
import { apiJson } from "@/lib/api";
import { Settings } from "@/lib/types";

export default function AdminSettings() {
  const [data, setData] = useState<Settings | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const s = await apiJson<Settings>("/settings");
      setData(s);
    } catch (e: any) {
      setErr(e?.message || "Erro");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!data) return;
    setErr(null);
    setOk(null);
    try {
      const s = await apiJson<Settings>("/settings", {
        method: "PATCH",
        body: JSON.stringify({
          storeName: data.storeName,
          whatsappNumber: data.whatsappNumber,
          openHoursText: data.openHoursText,
          isOpen: data.isOpen,
          messageTemplate: data.messageTemplate
        })
      });
      setData(s);
      setOk("Salvo!");
    } catch (e: any) {
      setErr(e?.message || "Erro");
    }
  }

  if (!data) {
    return (
      <div className="card">
        <h1 className="h1">Settings</h1>
        <p className="muted">Carregando...</p>
        {err && <div className="badge" style={{ borderColor: "rgba(239,68,68,0.45)" }}>{err}</div>}
      </div>
    );
  }

  return (
    <div className="card">
      <h1 className="h1">Settings</h1>
      <p className="muted">
        Configure storeName, WhatsApp, horários, status e template de mensagem.
      </p>

      <div className="hr" />

      <div className="row">
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="small muted">Nome da loja</div>
          <input className="input" value={data.storeName} onChange={(e) => setData({ ...data, storeName: e.target.value })} />
        </div>

        <div style={{ width: 260 }}>
          <div className="small muted">WhatsApp (somente números)</div>
          <input
            className="input"
            value={data.whatsappNumber}
            onChange={(e) => setData({ ...data, whatsappNumber: e.target.value.replace(/[^\d]/g, "") })}
            placeholder="Ex: 5581999999999"
          />
          <div className="small muted" style={{ marginTop: 6 }}>
            Formato: país+DDD+número (ex: 55...)
          </div>
        </div>
      </div>

      <div className="row">
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="small muted">Texto de horários</div>
          <input className="input" value={data.openHoursText} onChange={(e) => setData({ ...data, openHoursText: e.target.value })} />
        </div>

        <label style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 20 }}>
          <input type="checkbox" checked={data.isOpen} onChange={(e) => setData({ ...data, isOpen: e.target.checked })} />
          <span className="small muted">Loja aberta</span>
        </label>
      </div>

      <div className="row">
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="small muted">Template de mensagem</div>
          <textarea
            className="textarea"
            value={data.messageTemplate}
            onChange={(e) => setData({ ...data, messageTemplate: e.target.value })}
            placeholder="Ex: Olá! Quero pedir: {productName} ({productPrice})"
          />
          <div className="small muted" style={{ marginTop: 6 }}>
            Placeholders: <code>{`{productName}`}</code>, <code>{`{productPrice}`}</code>, <code>{`{storeName}`}</code>
          </div>
        </div>
      </div>

      <div className="row" style={{ justifyContent: "flex-end" }}>
        <button className="btn btn-primary" onClick={save}>
          Salvar
        </button>
      </div>

      {(err || ok) && (
        <div
          className="badge"
          style={{
            borderColor: err ? "rgba(239,68,68,0.45)" : "rgba(34,197,94,0.45)",
            marginTop: 12
          }}
        >
          {err || ok}
        </div>
      )}
    </div>
  );
}
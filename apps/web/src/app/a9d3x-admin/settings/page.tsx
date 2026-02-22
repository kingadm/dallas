"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { apiForm, apiJson } from "@/lib/api";
import { Settings } from "@/lib/types";

export default function AdminSettings() {
  const [data, setData] = useState<Settings | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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
      setOk("Configurações salvas!");
    } catch (e: any) {
      setErr(e?.message || "Erro");
    }
  }

  async function uploadLogo() {
    if (!logoFile) return;
    setErr(null);
    setOk(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", logoFile);

      const updated = await apiForm<Settings>("/settings/logo", {
        method: "POST",
        body: fd
      });

      setData(updated);
      setLogoFile(null);
      setOk("Logo atualizada!");
    } catch (e: any) {
      setErr(e?.message || "Erro ao enviar logo");
    } finally {
      setUploading(false);
    }
  }

  if (!data) {
    return (
      <div>
        <h1 className="h1">Configurações</h1>
        <p className="muted">Carregando...</p>
        {err && <div className="badge badge-closed">{err}</div>}
      </div>
    );
  }

  return (
    <div>
      <h1 className="h1">Configurações</h1>
      <p className="muted">
        Configure nome da loja, WhatsApp, horários, status, mensagem e a logo.
      </p>

      <div className="hr" />

      {/* LOGO */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="h2" style={{ marginBottom: 8 }}>Logo</div>

        <div className="row" style={{ alignItems: "center" }}>
          <div className="card" style={{ width: 120, height: 120, padding: 10, display: "grid", placeItems: "center" }}>
            {data.logoUrl ? (
              <Image
                src={data.logoUrl}
                alt="Logo"
                width={96}
                height={96}
                style={{ borderRadius: 16, objectFit: "cover" }}
              />
            ) : (
              <div className="muted small" style={{ textAlign: "center" }}>
                Sem logo<br />enviada
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 240 }}>
            <div className="small muted">Enviar nova logo (PNG/JPG)</div>
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
            />
            <div className="small muted" style={{ marginTop: 6 }}>
              A logo vai para o Cloudinary e fica salva no banco.
            </div>
          </div>

          <button className="btn btn-primary" disabled={!logoFile || uploading} onClick={uploadLogo}>
            {uploading ? "Enviando..." : "Enviar logo"}
          </button>
        </div>
      </div>

      {/* SETTINGS NORMAL */}
      <div className="row">
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="small muted">Nome da loja</div>
          <input
            className="input"
            value={data.storeName}
            onChange={(e) => setData({ ...data, storeName: e.target.value })}
          />
        </div>

        <div style={{ width: 260 }}>
          <div className="small muted">WhatsApp (somente números)</div>
          <input
            className="input"
            value={data.whatsappNumber}
            onChange={(e) => setData({ ...data, whatsappNumber: e.target.value.replace(/[^\d]/g, "") })}
            placeholder="Ex: 5581999999999"
          />
        </div>
      </div>

      <div className="row" style={{ marginTop: 12 }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="small muted">Texto de horários</div>
          <input
            className="input"
            value={data.openHoursText}
            onChange={(e) => setData({ ...data, openHoursText: e.target.value })}
          />
        </div>

        <label style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 22 }}>
          <input
            type="checkbox"
            checked={data.isOpen}
            onChange={(e) => setData({ ...data, isOpen: e.target.checked })}
          />
          <span className="small muted">Loja aberta</span>
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="small muted">Template de mensagem</div>
        <textarea
          className="textarea"
          value={data.messageTemplate}
          onChange={(e) => setData({ ...data, messageTemplate: e.target.value })}
          placeholder="Ex: Olá! Quero pedir: {productName} ({productPrice})"
        />
        <div className="small muted" style={{ marginTop: 6 }}>
          Placeholders: <code>{"{productName}"}</code>, <code>{"{productPrice}"}</code>, <code>{"{storeName}"}</code>
        </div>
      </div>

      <div className="row" style={{ justifyContent: "flex-end", marginTop: 12 }}>
        <button className="btn btn-primary" onClick={save}>
          Salvar
        </button>
      </div>

      {(err || ok) && (
        <div
          className={`badge ${err ? "badge-closed" : "badge-open"}`}
          style={{ marginTop: 12 }}
        >
          {err || ok}
        </div>
      )}
    </div>
  );
}
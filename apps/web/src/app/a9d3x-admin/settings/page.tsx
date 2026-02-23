"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiForm, apiJson } from "@/lib/api";
import { Settings } from "@/lib/types";

const DAYS = [
  { id: 0, label: "Dom" },
  { id: 1, label: "Seg" },
  { id: 2, label: "Ter" },
  { id: 3, label: "Qua" },
  { id: 4, label: "Qui" },
  { id: 5, label: "Sex" },
  { id: 6, label: "Sáb" }
];

function parseDays(str?: string | null): number[] {
  if (!str) return [];
  return str
    .split(",")
    .map((x) => Number(x.trim()))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
}

function daysToStr(days: number[]) {
  return [...days].sort((a, b) => a - b).join(",");
}

function prettyOpenHours(days: number[], openTime?: string | null, closeTime?: string | null) {
  if (!days.length || !openTime || !closeTime) return "—";
  if (days.length === 7) return `Seg-Dom ${openTime}-${closeTime}`;
  const labels = days.map((d) => DAYS.find((x) => x.id === d)?.label).filter(Boolean) as string[];
  return `${labels.join(", ")} ${openTime}-${closeTime}`;
}

export default function AdminSettings() {
  const [data, setData] = useState<Settings | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [days, setDays] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);

  const lastPayloadRef = useRef<string>("");

  async function load() {
    setErr(null);
    try {
      const s = await apiJson<Settings>("/settings");
      setData(s);
      setDays(parseDays(s.openDays));
      // snapshot inicial
      const payload = buildPayload(s, parseDays(s.openDays));
      lastPayloadRef.current = JSON.stringify(payload);
      setSaved(true);
    } catch (e: any) {
      setErr(e?.message || "Erro");
    }
  }

  useEffect(() => {
    load();
  }, []);

  function toggleDay(d: number) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  function buildPayload(s: Settings, d: number[]) {
    return {
      storeName: s.storeName,
      whatsappNumber: s.whatsappNumber,
      messageTemplate: s.messageTemplate,

      scheduleEnabled: !!s.scheduleEnabled,
      openDays: daysToStr(d),
      openTime: s.openTime || null,
      closeTime: s.closeTime || null,
      timezone: s.timezone || "America/Sao_Paulo",

      // fallback manual
      isOpen: s.isOpen
    };
  }

  const previewText = useMemo(() => {
    if (!data) return "—";
    return prettyOpenHours(days, data.openTime, data.closeTime);
  }, [data, days]);

  // ✅ Auto-save (debounce)
  useEffect(() => {
    if (!data) return;

    const payload = buildPayload(data, days);
    const payloadStr = JSON.stringify(payload);

    // se não mudou nada, não salva
    if (payloadStr === lastPayloadRef.current) {
      setSaved(true);
      return;
    }

    setSaved(false);

    const t = setTimeout(async () => {
      setSaving(true);
      setErr(null);

      try {
        const updated = await apiJson<Settings>("/settings", {
          method: "PATCH",
          body: JSON.stringify(payload)
        });

        setData(updated);
        // atualiza snapshot com o que foi enviado (não precisa do retorno, só evita loop)
        lastPayloadRef.current = payloadStr;
        setSaved(true);
      } catch (e: any) {
        setErr(e?.message || "Erro ao salvar");
      } finally {
        setSaving(false);
      }
    }, 900);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.storeName, data?.whatsappNumber, data?.messageTemplate, data?.scheduleEnabled, data?.openTime, data?.closeTime, data?.timezone, data?.isOpen, days]);

  async function uploadLogo() {
    if (!logoFile) return;
    setErr(null);
    setUploadingLogo(true);

    try {
      const fd = new FormData();
      fd.append("file", logoFile);

      const updated = await apiForm<Settings>("/settings/logo", {
        method: "POST",
        body: fd
      });

      setData(updated);
      setLogoFile(null);
    } catch (e: any) {
      setErr(e?.message || "Erro ao enviar logo");
    } finally {
      setUploadingLogo(false);
    }
  }

  if (!data) {
    return (
      <div>
        <h1 className="h1">Configurações</h1>
        {err && <div className="badge badge-closed">{err}</div>}
        <div className="muted">Carregando…</div>
      </div>
    );
  }

  return (
    <div>
      <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <h1 className="h1" style={{ margin: 0 }}>Configurações</h1>

        <div className={`badge ${err ? "badge-closed" : "badge-open"}`}>
          {err ? "Erro" : saving ? "Salvando…" : saved ? "Salvo" : "Pendente…"}
        </div>
      </div>

      {err && (
        <div className="badge badge-closed" style={{ marginTop: 12 }}>
          {err}
        </div>
      )}

      <div className="hr" />

      {/* LOGO */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
          <div className="h2" style={{ margin: 0 }}>Logo</div>

          <button className="btn btn-primary" disabled={!logoFile || uploadingLogo} onClick={uploadLogo}>
            {uploadingLogo ? "Enviando…" : "Enviar"}
          </button>
        </div>

        <div className="hr" />

        <div className="row" style={{ alignItems: "center" }}>
          <div style={{ width: 110, height: 110, borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", background: "rgba(2,6,23,0.03)" }}>
            {data.logoUrl ? (
              <Image src={data.logoUrl} alt="Logo" width={110} height={110} style={{ objectFit: "cover" }} />
            ) : null}
          </div>

          <div style={{ flex: 1, minWidth: 240 }}>
            <div className="small muted">Arquivo</div>
            <input className="input" type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
          </div>
        </div>
      </div>

      {/* LOJA */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="h2" style={{ margin: 0 }}>Loja</div>
        <div className="hr" />

        <div className="row">
          <div style={{ flex: 1, minWidth: 240 }}>
            <div className="small muted">Nome</div>
            <input className="input" value={data.storeName} onChange={(e) => setData({ ...data, storeName: e.target.value })} />
          </div>

          <div style={{ width: 260 }}>
            <div className="small muted">WhatsApp</div>
            <input
              className="input"
              value={data.whatsappNumber}
              onChange={(e) => setData({ ...data, whatsappNumber: e.target.value.replace(/[^\d]/g, "") })}
              placeholder="Ex: 5581999999999"
            />
          </div>
        </div>
      </div>

      {/* HORÁRIO */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
          <div className="h2" style={{ margin: 0 }}>Horário</div>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={!!data.scheduleEnabled}
              onChange={(e) => setData({ ...data, scheduleEnabled: e.target.checked })}
            />
            <span className="small muted">Automático</span>
          </label>
        </div>

        <div className="hr" />

        <div className="small muted">Dias</div>
        <div className="row" style={{ marginTop: 8 }}>
          {DAYS.map((d) => {
            const active = days.includes(d.id);
            return (
              <button
                key={d.id}
                type="button"
                className="btn"
                style={{
                  borderRadius: 999,
                  padding: "10px 14px",
                  background: active ? "rgba(31,122,63,0.12)" : "rgba(2,6,23,0.03)",
                  borderColor: active ? "rgba(31,122,63,0.35)" : "var(--border)"
                }}
                onClick={() => toggleDay(d.id)}
              >
                {d.label}
              </button>
            );
          })}
        </div>

        <div className="hr" />

        <div className="row">
          <div style={{ width: 200 }}>
            <div className="small muted">Abre</div>
            <input className="input" type="time" value={data.openTime || ""} onChange={(e) => setData({ ...data, openTime: e.target.value })} />
          </div>

          <div style={{ width: 200 }}>
            <div className="small muted">Fecha</div>
            <input className="input" type="time" value={data.closeTime || ""} onChange={(e) => setData({ ...data, closeTime: e.target.value })} />
          </div>

          <div style={{ flex: 1, minWidth: 240 }}>
            <div className="small muted">Fuso</div>
            <input
              className="input"
              value={data.timezone || "America/Sao_Paulo"}
              onChange={(e) => setData({ ...data, timezone: e.target.value })}
              placeholder="America/Sao_Paulo"
            />
          </div>
        </div>

        <div className="hr" />

        <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
          <div className="small muted">Texto (gerado)</div>
          <div className="badge">{previewText}</div>
        </div>

        <div className="hr" />

        <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
          <div className="small muted">Fallback manual</div>
          <button
            type="button"
            className={`btn ${data.isOpen ? "btn-whatsapp" : "btn-danger"}`}
            onClick={() => setData({ ...data, isOpen: !data.isOpen })}
          >
            {data.isOpen ? "Aberto" : "Fechado"}
          </button>
        </div>
      </div>

      {/* MENSAGEM */}
      <div className="card">
        <div className="h2" style={{ margin: 0 }}>Mensagem</div>
        <div className="hr" />
        <textarea
          className="textarea"
          value={data.messageTemplate}
          onChange={(e) => setData({ ...data, messageTemplate: e.target.value })}
        />
        <div className="small muted" style={{ marginTop: 8 }}>
          Use: {"{productName}"} {"{productPrice}"} {"{storeName}"}
        </div>
      </div>
    </div>
  );
}
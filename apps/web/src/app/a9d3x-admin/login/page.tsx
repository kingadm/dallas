"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setToken, API_URL } from "@/lib/api";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Credenciais inválidas");
      }

      const data = (await res.json()) as { accessToken: string };
      setToken(data.accessToken);
      router.push("/a9d3x-admin");
    } catch (e: any) {
      setErr(e?.message || "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card menu-shell" style={{ maxWidth: 520, margin: "0 auto" }}>
      <h1 className="h1">Entrar no Admin</h1>
      <p className="muted">Acesso protegido por token (JWT).</p>

      <div className="hr" />

      <form onSubmit={onSubmit} className="row" style={{ flexDirection: "column" }}>
        <label>
          <div className="small muted">E-mail</div>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label>
          <div className="small muted">Senha</div>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        {err && <div className="badge badge-closed">{err}</div>}

        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <div className="small muted">
          Se você rodou o seed: admin@admin.com / admin123
        </div>
      </form>
    </div>
  );
}
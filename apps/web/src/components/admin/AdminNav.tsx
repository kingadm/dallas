"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/lib/api";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className="btn"
      style={{
        borderRadius: 999,
        padding: "10px 14px",
        background: active ? "rgba(2,6,23,0.08)" : "rgba(2,6,23,0.03)"
      }}
    >
      {label}
    </Link>
  );
}

export default function AdminNav() {
  const router = useRouter();

  function logout() {
    clearToken();
    router.replace("/a9d3x-admin/login");
  }

  return (
    <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
      <div className="row">
        <NavLink href="/a9d3x-admin" label="Início" />
        <NavLink href="/a9d3x-admin/categories" label="Categorias" />
        <NavLink href="/a9d3x-admin/products" label="Produtos" />
        <NavLink href="/a9d3x-admin/settings" label="Configurações" />
      </div>

      <button className="btn" onClick={logout}>
        Sair
      </button>
    </div>
  );
}
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
        background: active ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.06)"
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
        <NavLink href="/a9d3x-admin" label="Home" />
        <NavLink href="/a9d3x-admin/categories" label="Categorias" />
        <NavLink href="/a9d3x-admin/products" label="Produtos" />
        <NavLink href="/a9d3x-admin/settings" label="Settings" />
      </div>

      <button className="btn" onClick={logout}>
        Sair
      </button>
    </div>
  );
}
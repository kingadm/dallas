"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getToken } from "@/lib/api";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    const isLoginRoute = pathname === "/a9d3x-admin/login";

    // ✅ deixa o /login aparecer sempre
    if (isLoginRoute) {
      // se já tem token e entrou no login, manda pro painel
      if (token) router.replace("/a9d3x-admin");
      setReady(true);
      return;
    }

    // ✅ protege o resto
    if (!token) {
      router.replace("/a9d3x-admin/login");
      return;
    }

    setReady(true);
  }, [router, pathname]);

  if (!ready) return null;
  return <>{children}</>;
}
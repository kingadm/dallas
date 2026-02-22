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

    if (!token) {
      router.replace("/a9d3x-admin/login");
      return;
    }

    // se já tem token e está no login, manda pro admin
    if (pathname === "/a9d3x-admin/login") {
      router.replace("/a9d3x-admin");
      return;
    }

    setReady(true);
  }, [router, pathname]);

  if (!ready) return null;
  return <>{children}</>;
}
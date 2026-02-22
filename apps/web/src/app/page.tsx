import Image from "next/image";
import CategoryMenu from "@/components/CategoryMenu";
import CategorySection from "@/components/CategorySection";
import { MenuResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getMenu(): Promise<MenuResponse> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_URL não configurado");

  const res = await fetch(`${base}/public/menu`, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao carregar cardápio");
  return res.json();
}

export default async function HomePage() {
  const { settings, categories } = await getMenu();

  return (
    <main className="container">
      <div className="card menu-shell">
        <div
          className="row"
          style={{ alignItems: "center", justifyContent: "space-between", paddingTop: 6 }}
        >
          <div className="brand">
            <div className="brand-mark" aria-hidden>
              <Image
                src="/dallas-logo.png"
                alt="Dallas Pizzaria"
                width={72}
                height={72}
                priority
              />
            </div>

            <div>
              <h1 className="h1">{settings.storeName}</h1>
              <div className="muted">{settings.openHoursText}</div>
            </div>
          </div>

          <div className={`badge ${settings.isOpen ? "badge-open" : "badge-closed"}`}>
            <span>{settings.isOpen ? "Aberto" : "Fechado"}</span>
          </div>
        </div>

        <div className="hr" />

        {/* ✅ MENU DE CATEGORIAS */}
        {categories.length > 0 && <CategoryMenu categories={categories} />}

        <div className="hr" />

        {categories.length === 0 ? (
          <div className="muted">Nenhum item ativo no momento.</div>
        ) : (
          categories.map((cat) => (
            <CategorySection key={cat.id} category={cat} settings={settings} />
          ))
        )}

        <div className="hr" />
        <div className="small muted">Peça pelo WhatsApp e a gente confirma com você.</div>
      </div>
    </main>
  );
}
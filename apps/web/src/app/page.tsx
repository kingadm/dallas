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
    <main className="public-theme">
      <header className="hero">
        <div className="hero-inner">
          <div className={`status-pill ${settings.isOpen ? "open" : "closed"}`}>
            {settings.isOpen ? "ABERTO" : "FECHADO"}
          </div>
        </div>
      </header>

      <section className="store-card">
        <div className="store-card-inner">
          <div className="store-logo">
            <Image
              src="/dallas-logo.png"
              alt="Dallas Pizzaria"
              width={92}
              height={92}
              priority
            />
          </div>

          <div className="store-title">
            <h1 className="store-name">{settings.storeName}</h1>
            <div className="store-hours">{settings.openHoursText}</div>
          </div>

          {categories.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <CategoryMenu categories={categories} />
            </div>
          )}

          <div className="divider" />

          {categories.length === 0 ? (
            <div className="muted">Nenhum item ativo no momento.</div>
          ) : (
            categories.map((cat) => (
              <CategorySection key={cat.id} category={cat} settings={settings} />
            ))
          )}

          <div className="footer-note">
            Peça no WhatsApp e a gente confirma com você.
          </div>
        </div>
      </section>
    </main>
  );
}
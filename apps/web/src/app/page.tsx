import Image from "next/image";
import CategoryMenu from "@/components/CategoryMenu";
import CategorySection from "@/components/CategorySection";
import { MenuResponse } from "@/lib/types";
import styles from "./menu.module.css";

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
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.statusPill}>
            {settings.isOpen ? "ABERTO" : "FECHADO"}
          </div>
        </div>
      </header>

      <section className={styles.storeCard}>
        <div className={styles.storeInner}>
          <div className={styles.storeLogo}>
            <Image
              src={settings.logoUrl || "/dallas-logo.png"}
              alt="Dallas Pizzaria"
              width={92}
              height={92}
              priority
            />
          </div>

          <div className={styles.storeTitle}>
            <h1 className={styles.storeName}>{settings.storeName}</h1>
            <div className={styles.storeHours}>{settings.openHoursText}</div>
          </div>

          {categories.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <CategoryMenu categories={categories} />
            </div>
          )}

          <div className={styles.divider} />

          {categories.length === 0 ? (
            <div style={{ color: "var(--muted)" }}>Nenhum item ativo no momento.</div>
          ) : (
            categories.map((cat) => (
              <CategorySection key={cat.id} category={cat} settings={settings} />
            ))
          )}

          <div className={styles.footerNote}>
            Peça no WhatsApp e a gente confirma com você.
          </div>
        </div>
      </section>
    </main>
  );
}
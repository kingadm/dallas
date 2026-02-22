import { Category, Settings } from "@/lib/types";
import ProductCard from "./ProductCard";
import styles from "@/app/menu.module.css";

export default function CategorySection({
  category,
  settings
}: {
  category: Category;
  settings: Settings;
}) {
  return (
    <section id={`cat-${category.id}`} style={{ marginBottom: 18 }}>
      <div className={styles.sectionTitle}>
        <span className={styles.sectionDot} aria-hidden />
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{category.name}</h2>
      </div>

      {category.products?.map((p) => (
        <ProductCard key={p.id} product={p} settings={settings} />
      ))}
    </section>
  );
}
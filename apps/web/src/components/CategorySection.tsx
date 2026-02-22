import { Category, Settings } from "@/lib/types";
import ProductCard from "./ProductCard";

export default function CategorySection({
  category,
  settings
}: {
  category: Category;
  settings: Settings;
}) {
  return (
    <section id={`cat-${category.id}`} style={{ marginBottom: 18 }}>
      <div className="section-title">
        <span className="section-dot" aria-hidden />
        <h2 className="h2" style={{ margin: 0 }}>{category.name}</h2>
      </div>

      {category.products?.map((p) => (
        <ProductCard key={p.id} product={p} settings={settings} />
      ))}
    </section>
  );
}
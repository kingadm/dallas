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
    <section id={`cat-${category.id}`} style={{ marginBottom: 22 }}>
      <div className="section-title" style={{ marginBottom: 10 }}>
        <span className="section-dot" aria-hidden />
        <h2 className="h2" style={{ margin: 0 }}>
          {category.name}
        </h2>
      </div>

      <div className="grid">
        {category.products?.map((p) => (
          <ProductCard key={p.id} product={p} settings={settings} />
        ))}
      </div>
    </section>
  );
}
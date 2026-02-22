import { Category } from "@/lib/types";

export default function CategoryMenu({ categories }: { categories: Category[] }) {
  return (
    <nav className="cat-nav" aria-label="Categorias">
      {categories.map((c) => (
        <a key={c.id} className="cat-pill" href={`#cat-${c.id}`}>
          {c.name}
        </a>
      ))}
    </nav>
  );
}
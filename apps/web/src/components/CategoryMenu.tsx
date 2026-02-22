import { Category } from "@/lib/types";
import styles from "@/app/menu.module.css";

export default function CategoryMenu({ categories }: { categories: Category[] }) {
  return (
    <nav className={styles.catNav} aria-label="Categorias">
      {categories.map((c) => (
        <a key={c.id} className={styles.catPill} href={`#cat-${c.id}`}>
          {c.name}
        </a>
      ))}
    </nav>
  );
}
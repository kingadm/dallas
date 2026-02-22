import Image from "next/image";
import { Product, Settings } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import styles from "@/app/menu.module.css";

export default function ProductCard({ product, settings }: { product: Product; settings: Settings }) {
  const waLink = buildWhatsAppLink(settings, product);
  const priceLabel = product.priceCents != null ? formatBRL(product.priceCents) : "Preço sob consulta";

  return (
    <article className={styles.prodCard}>
      <div className={styles.prodLeft}>
        <div className={styles.prodName}>{product.name}</div>

        {product.description && (
          <div className={styles.prodDesc}>{product.description}</div>
        )}

        <div className={styles.prodBottom}>
          <div className={styles.prodPrice}>{priceLabel}</div>

          <a className={styles.btnWhatsapp} href={waLink} target="_blank" rel="noreferrer">
            Pedir no WhatsApp
          </a>
        </div>
      </div>

      <div className={styles.prodRight}>
        <div className={styles.prodImg}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="96px"
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>
    </article>
  );
}
import Image from "next/image";
import { Product, Settings } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function ProductCard({
  product,
  settings
}: {
  product: Product;
  settings: Settings;
}) {
  const waLink = buildWhatsAppLink(settings, product);
  const priceLabel =
    product.priceCents != null ? formatBRL(product.priceCents) : "Preço sob consulta";

  return (
    <article className="prod-card">
      <div className="prod-left">
        <div className="prod-name">{product.name}</div>

        {product.description && (
          <div className="prod-desc">{product.description}</div>
        )}

        <div className="prod-bottom">
          <div className="prod-price">{priceLabel}</div>

          <a className="btn btn-whatsapp" href={waLink} target="_blank" rel="noreferrer">
            Pedir no WhatsApp
          </a>
        </div>
      </div>

      <div className="prod-right">
        <div className="prod-img">
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
import Image from "next/image";
import { Product, Settings } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function ProductCard({ product, settings }: { product: Product; settings: Settings }) {
  const priceLabel = product.priceCents != null ? formatBRL(product.priceCents) : "Preço sob consulta";
  const waLink = buildWhatsAppLink(settings, product);

  return (
    <article className="card" style={{ padding: 12 }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 160,
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid var(--border)"
        }}
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 600px) 100vw, 250px"
          style={{ objectFit: "cover" }}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ fontWeight: 800 }}>{product.name}</div>
        {product.description && (
          <div className="muted small" style={{ marginTop: 4 }}>
            {product.description}
          </div>
        )}
        <div style={{ marginTop: 8 }}>
          <span className="badge">{priceLabel}</span>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <a className="btn btn-whatsapp" href={waLink} target="_blank" rel="noreferrer">
          Pedir no WhatsApp
        </a>
      </div>
    </article>
  );
}
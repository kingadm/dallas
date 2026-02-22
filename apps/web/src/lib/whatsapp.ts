import { Product, Settings } from "./types";
import { formatBRL } from "./format";

function applyTemplate(template: string, settings: Settings, product: Product) {
  const productPrice = product.priceCents != null ? formatBRL(product.priceCents) : "Preço sob consulta";

  return template
    .replaceAll("{storeName}", settings.storeName)
    .replaceAll("{productName}", product.name)
    .replaceAll("{productPrice}", productPrice);
}

export function buildWhatsAppLink(settings: Settings, product: Product) {
  const number = (settings.whatsappNumber || "").replace(/[^\d]/g, "");
  const template = settings.messageTemplate?.trim() || "Olá! Quero pedir: {productName}";
  const msg = applyTemplate(template, settings, product);

  const url = new URL(`https://wa.me/${number}`);
  url.searchParams.set("text", msg);
  return url.toString();
}
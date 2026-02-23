import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

function parseTimeToMinutes(t?: string | null) {
  if (!t) return null;
  const [h, m] = t.split(":").map((x) => Number(x));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function parseOpenDays(s?: string | null) {
  if (!s) return [];
  return s
    .split(",")
    .map((x) => Number(x.trim()))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
}

const dayMap: Record<string, number> = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6 };

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getNowInTz(timeZone: string) {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date());

  const weekday = normalize(parts.find((p) => p.type === "weekday")?.value || "dom");
  const wdKey = weekday.replace(".", "").slice(0, 3);
  const dow = dayMap[wdKey] ?? 0;

  const hour = Number(parts.find((p) => p.type === "hour")?.value || "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value || "0");

  return { dow, minutes: hour * 60 + minute };
}

function computeIsOpen(settings: any): boolean | null {
  if (!settings?.scheduleEnabled) return null;

  const days = parseOpenDays(settings.openDays);
  const startMin = parseTimeToMinutes(settings.openTime);
  const endMin = parseTimeToMinutes(settings.closeTime);
  const tz = settings.timezone || "America/Sao_Paulo";

  if (!days.length || startMin == null || endMin == null) return null;

  const now = getNowInTz(tz);
  const dow = now.dow;
  const mins = now.minutes;

  const spansMidnight = startMin > endMin;

  if (!spansMidnight) {
    return days.includes(dow) && mins >= startMin && mins <= endMin;
  }

  // vira madrugada (ex: 18:00-02:00)
  const prevDow = (dow + 6) % 7;
  return (days.includes(dow) && mins >= startMin) || (days.includes(prevDow) && mins <= endMin);
}

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async menu() {
    const settings = await this.prisma.settings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 }
    });

    const computed = computeIsOpen(settings);
    const publicSettings = {
      ...settings,
      isOpen: computed ?? settings.isOpen
    };

    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    const categoriesWithProducts = categories.filter((c) => c.products.length > 0);
    return { settings: publicSettings, categories: categoriesWithProducts };
  }
}
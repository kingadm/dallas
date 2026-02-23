import Image from "next/image";
import CategoryMenu from "@/components/CategoryMenu";
import CategorySection from "@/components/CategorySection";
import { MenuResponse, Settings } from "@/lib/types";
import styles from "./menu.module.css";

export const dynamic = "force-dynamic";

async function getMenu(): Promise<MenuResponse> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_URL não configurado");

  const res = await fetch(`${base}/public/menu`, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao carregar cardápio");
  return res.json();
}

/**
 * ====== ABERTO/FECHADO POR HORÁRIO ======
 * Lê settings.openHoursText em formatos como:
 * - "Seg-Dom 18:00-23:30"
 * - "Seg-Sex 09:00-18:00; Sáb-Dom 18:00-23:30"
 */
const TZ = "America/Sao_Paulo";

// 0=Dom,1=Seg,2=Ter,3=Qua,4=Qui,5=Sex,6=Sáb
const dayMap: Record<string, number> = {
  dom: 0,
  seg: 1,
  ter: 2,
  qua: 3,
  qui: 4,
  sex: 5,
  sab: 6,
  sáb: 6
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // remove acentos
}

function getNowInTz() {
  // pega dia/horário no fuso (sem libs)
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date());

  const weekday = normalize(parts.find((p) => p.type === "weekday")?.value || "dom");
  const hour = Number(parts.find((p) => p.type === "hour")?.value || "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value || "0");

  // weekday vem tipo "seg.", "ter.", etc
  const wdKey = weekday.replace(".", "").slice(0, 3);
  const dow = dayMap[wdKey] ?? 0;

  return { dow, minutes: hour * 60 + minute };
}

function parseTimeToMinutes(t: string) {
  const [h, m] = t.split(":").map((x) => Number(x));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function expandDayRange(a: number, b: number) {
  const days: number[] = [];
  if (a <= b) {
    for (let d = a; d <= b; d++) days.push(d);
  } else {
    // ex: Sex-Dom
    for (let d = a; d <= 6; d++) days.push(d);
    for (let d = 0; d <= b; d++) days.push(d);
  }
  return days;
}

type Schedule = {
  days: number[]; // dias que "começa" (importante para range que vira madrugada)
  startMin: number;
  endMin: number;
  spansMidnight: boolean;
};

function parseSchedules(text: string): Schedule[] {
  const raw = normalize(text || "");
  if (!raw.trim()) return [];

  // aceita múltiplos blocos separados por ; ou quebra de linha
  const blocks = raw
    .split(/[\n;]+/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const schedules: Schedule[] = [];

  const dayToken = "(dom|seg|ter|qua|qui|sex|sab|sáb)";
  // exemplos aceitos:
  // seg-dom 18:00-23:30
  // seg a dom 18:00-23:30
  // seg-dom 18:00 - 23:30
  const re = new RegExp(
    `${dayToken}(?:\\s*(?:-|a)\\s*${dayToken})?\\s+(\\d{1,2}:\\d{2})\\s*-\\s*(\\d{1,2}:\\d{2})`,
    "gi"
  );

  for (const b of blocks) {
    // Caso "todos os dias 18:00-23:30"
    if (b.includes("todos") || b.includes("todo")) {
      const m = b.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
      if (m) {
        const startMin = parseTimeToMinutes(m[1]);
        const endMin = parseTimeToMinutes(m[2]);
        if (startMin != null && endMin != null) {
          schedules.push({
            days: [0, 1, 2, 3, 4, 5, 6],
            startMin,
            endMin,
            spansMidnight: startMin > endMin
          });
        }
      }
      continue;
    }

    let match: RegExpExecArray | null;
    while ((match = re.exec(b)) !== null) {
      const d1 = match[1];
      const d2 = match[2]; // pode ser undefined
      const tStart = match[3];
      const tEnd = match[4];

      const day1 = dayMap[d1 as keyof typeof dayMap];
      const day2 = d2 ? dayMap[d2 as keyof typeof dayMap] : day1;

      const startMin = parseTimeToMinutes(tStart);
      const endMin = parseTimeToMinutes(tEnd);
      if (startMin == null || endMin == null) continue;

      schedules.push({
        days: expandDayRange(day1, day2),
        startMin,
        endMin,
        spansMidnight: startMin > endMin
      });
    }
  }

  return schedules;
}

function isOpenBySchedule(openHoursText: string): boolean | null {
  const schedules = parseSchedules(openHoursText);
  if (!schedules.length) return null; // sem horário parseável

  const now = getNowInTz();
  const dow = now.dow;
  const mins = now.minutes;

  for (const s of schedules) {
    // Caso normal (não vira madrugada)
    if (!s.spansMidnight) {
      if (s.days.includes(dow) && mins >= s.startMin && mins <= s.endMin) return true;
      continue;
    }

    // Caso vira madrugada (ex: 18:00-02:00)
    // Está aberto:
    // - No dia "dow" se for um dia listado e mins >= startMin (no mesmo dia)
    // - OU no dia seguinte ao dia listado se mins <= endMin
    if (s.days.includes(dow) && mins >= s.startMin) return true;

    // checa se ontem era um dia listado (porque passou da meia-noite)
    const prevDow = (dow + 6) % 7;
    if (s.days.includes(prevDow) && mins <= s.endMin) return true;
  }

  return false;
}

export default async function HomePage() {
  const { settings, categories } = await getMenu();

  // calcula aberto/fechado por horário. Se não conseguir parsear, cai pro settings.isOpen
  const scheduleOpen = isOpenBySchedule(settings.openHoursText);
  const isOpenNow = scheduleOpen ?? settings.isOpen;

  // Opção 2: permite pedido mesmo fechado (mensagem de agendamento)
  const effectiveSettings: Settings = isOpenNow
    ? settings
    : {
        ...settings,
        messageTemplate:
          "Olá! A loja está fechada agora, mas quero agendar o pedido: {productName} ({productPrice})."
      };

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.statusPill}>
            {isOpenNow ? "ABERTO" : "FECHADO (ACEITAMOS AGENDAMENTO)"}
          </div>
        </div>
      </header>

      <section className={styles.storeCard}>
        <div className={styles.storeInner}>
          <div className={styles.storeLogo}>
            <Image
              src={settings.logoUrl || "/dallas-logo.png"} // se tiver logo via settings, usa; senão fallback
              alt={settings.storeName}
              width={92}
              height={92}
              priority
            />
          </div>

          <div className={styles.storeTitle}>
            <h1 className={styles.storeName}>{settings.storeName}</h1>
            <div className={styles.storeHours}>{settings.openHoursText}</div>
          </div>

          {categories.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <CategoryMenu categories={categories} />
            </div>
          )}

          <div className={styles.divider} />

          {categories.length === 0 ? (
            <div style={{ color: "var(--muted)" }}>Nenhum item ativo no momento.</div>
          ) : (
            categories.map((cat) => (
              <CategorySection key={cat.id} category={cat} settings={effectiveSettings} />
            ))
          )}

          <div className={styles.footerNote}>
            {isOpenNow
              ? "Peça no WhatsApp e a gente confirma com você."
              : "Estamos fechados agora, mas você pode pedir para agendar no WhatsApp."}
          </div>
        </div>
      </section>
    </main>
  );
}
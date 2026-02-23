import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateSettingsDto } from "./dto/update-settings.dto";

const DAY_LABEL: Record<number, string> = {
  0: "Dom",
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb"
};

function parseOpenDays(s?: string | null): number[] {
  if (!s) return [];
  return s
    .split(",")
    .map((x) => Number(x.trim()))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
}

function generateOpenHoursText(openDays?: string | null, openTime?: string | null, closeTime?: string | null) {
  const days = parseOpenDays(openDays);
  if (!days.length || !openTime || !closeTime) return null;

  const sorted = [...new Set(days)].sort((a, b) => a - b);

  // Se todos os dias -> "Seg-Dom"
  if (sorted.length === 7) {
    return `Seg-Dom ${openTime}-${closeTime}`;
  }

  // Caso comum: "Seg, Ter, Qua 18:00-23:30"
  const labels = sorted.map((d) => DAY_LABEL[d]).filter(Boolean);
  return `${labels.join(", ")} ${openTime}-${closeTime}`;
}

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get() {
    return this.prisma.settings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 }
    });
  }

  async update(dto: UpdateSettingsDto) {
    // garante que existe
    const current = await this.get();

    // aplica dto por cima do current (sem perder campos)
    const merged = {
      ...current,
      ...(dto.storeName !== undefined ? { storeName: dto.storeName } : {}),
      ...(dto.whatsappNumber !== undefined ? { whatsappNumber: dto.whatsappNumber } : {}),
      ...(dto.isOpen !== undefined ? { isOpen: dto.isOpen } : {}),
      ...(dto.messageTemplate !== undefined ? { messageTemplate: dto.messageTemplate } : {}),

      ...(dto.scheduleEnabled !== undefined ? { scheduleEnabled: dto.scheduleEnabled } : {}),
      ...(dto.openDays !== undefined ? { openDays: dto.openDays || null } : {}),
      ...(dto.openTime !== undefined ? { openTime: dto.openTime || null } : {}),
      ...(dto.closeTime !== undefined ? { closeTime: dto.closeTime || null } : {}),
      ...(dto.timezone !== undefined ? { timezone: dto.timezone || "America/Sao_Paulo" } : {})
      // openHoursText NÃO vem mais do painel: será sempre gerado abaixo
    };

    const autoText = generateOpenHoursText(merged.openDays, merged.openTime, merged.closeTime);

    return this.prisma.settings.update({
      where: { id: 1 },
      data: {
        storeName: merged.storeName,
        whatsappNumber: merged.whatsappNumber,
        isOpen: merged.isOpen,
        messageTemplate: merged.messageTemplate,

        scheduleEnabled: merged.scheduleEnabled,
        openDays: merged.openDays,
        openTime: merged.openTime,
        closeTime: merged.closeTime,
        timezone: merged.timezone,

        // ✅ sempre automático quando possível
        ...(autoText ? { openHoursText: autoText } : {})
      }
    });
  }

  async updateLogo(logoUrl: string) {
    await this.get(); // garante registro
    return this.prisma.settings.update({
      where: { id: 1 },
      data: { logoUrl }
    });
  }
}
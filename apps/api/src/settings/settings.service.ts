import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateSettingsDto } from "./dto/update-settings.dto";

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
    return this.prisma.settings.upsert({
      where: { id: 1 },
      update: {
        ...(dto.storeName !== undefined ? { storeName: dto.storeName } : {}),
        ...(dto.whatsappNumber !== undefined ? { whatsappNumber: dto.whatsappNumber } : {}),
        ...(dto.openHoursText !== undefined ? { openHoursText: dto.openHoursText } : {}),
        ...(dto.isOpen !== undefined ? { isOpen: dto.isOpen } : {}),
        ...(dto.messageTemplate !== undefined ? { messageTemplate: dto.messageTemplate } : {})
      },
      create: {
        id: 1,
        storeName: dto.storeName ?? "Minha Loja",
        whatsappNumber: dto.whatsappNumber ?? "55",
        openHoursText: dto.openHoursText ?? "Seg-Sex 09:00-18:00",
        isOpen: dto.isOpen ?? true,
        messageTemplate: dto.messageTemplate ?? "Olá! Quero pedir: {productName}"
      }
    });
  }
}
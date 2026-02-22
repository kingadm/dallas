import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async menu() {
    const settings = await this.prisma.settings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 }
    });

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

    // remove categorias sem produtos (opcional; mas geralmente desejado)
    const categoriesWithProducts = categories.filter((c: (typeof categories)[number]) => c.products.length > 0);

    return { settings, categories: categoriesWithProducts };
  }
}
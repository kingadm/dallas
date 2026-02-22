import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService, private cloudinary: CloudinaryService) {}

  list() {
    return this.prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async create(dto: CreateProductDto, file?: Express.Multer.File) {
    if (!file?.buffer) throw new BadRequestException("Foto é obrigatória");

    const uploaded = await this.cloudinary.uploadImage(file.buffer);

    return this.prisma.product.create({
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        priceCents: dto.priceCents,
        isActive: dto.isActive ?? true,
        imageUrl: uploaded.secure_url
      }
    });
  }

  async update(id: string, dto: UpdateProductDto, file?: Express.Multer.File) {
    const exists = await this.prisma.product.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException("Produto não encontrado");

    let imageUrl: string | undefined;
    if (file?.buffer) {
      const uploaded = await this.cloudinary.uploadImage(file.buffer);
      imageUrl = uploaded.secure_url;
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.priceCents !== undefined ? { priceCents: dto.priceCents } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(imageUrl ? { imageUrl } : {})
      },
      include: { category: true }
    });
  }

  async remove(id: string) {
    const exists = await this.prisma.product.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException("Produto não encontrado");

    await this.prisma.product.delete({ where: { id } });
    return { ok: true };
  }
}
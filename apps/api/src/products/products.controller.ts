import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(private service: ProductsService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 5 * 1024 * 1024 } }))
  create(@Body() dto: CreateProductDto, @UploadedFile() file?: Express.Multer.File) {
    return this.service.create(dto, file);
  }

  @Patch(":id")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 5 * 1024 * 1024 } }))
  update(
    @Param("id") id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.service.update(id, dto, file);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
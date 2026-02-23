import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { SettingsService } from "./settings.service";
import { UpdateSettingsDto } from "./dto/update-settings.dto";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

@Controller("settings")
export class SettingsController {
  constructor(
    private service: SettingsService,
    private cloudinary: CloudinaryService
  ) {}

  @Get()
  get() {
    return this.service.get();
  }

  @Patch()
  update(@Body() dto: UpdateSettingsDto) {
    return this.service.update(dto);
  }

  @Post("logo")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadLogo(@UploadedFile() file?: Express.Multer.File) {
    if (!file?.buffer) throw new BadRequestException("Arquivo de logo é obrigatório");
    const uploaded = await this.cloudinary.uploadImage(file.buffer, "cardapio-logos");
    return this.service.updateLogo(uploaded.secure_url);
  }
}
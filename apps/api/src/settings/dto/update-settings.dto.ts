import { IsBoolean, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";

const toBool = ({ value }: any) => value === true || value === "true";

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  storeName?: string;

  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @IsOptional()
  @IsString()
  openHoursText?: string;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  isOpen?: boolean;

  @IsOptional()
  @IsString()
  messageTemplate?: string;
}
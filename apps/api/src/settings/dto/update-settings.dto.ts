import { IsBoolean, IsOptional, IsString, Matches, MaxLength } from "class-validator";
import { Transform } from "class-transformer";

const toBool = ({ value }: any) => value === true || value === "true";

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  storeName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsappNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  openHoursText?: string;

  // manual (fallback)
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  isOpen?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  messageTemplate?: string;

  // ✅ horário automático
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  scheduleEnabled?: boolean;

  // "0,1,2,3,4,5,6" ou "1,2,3" etc
  @IsOptional()
  @IsString()
  @Matches(/^([0-6])(,[0-6])*$|^$/, { message: "openDays deve ser tipo: 1,2,3,4,5" })
  openDays?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: "openTime deve ser HH:MM" })
  openTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: "closeTime deve ser HH:MM" })
  closeTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  timezone?: string;
}
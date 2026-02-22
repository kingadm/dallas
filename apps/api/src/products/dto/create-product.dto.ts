import { IsBoolean, IsInt, IsOptional, IsString, Max, Min, MinLength } from "class-validator";
import { Transform } from "class-transformer";

const toBool = ({ value }: any) => value === true || value === "true";
const toIntOrUndef = ({ value }: any) => {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
};

export class CreateProductDto {
  @IsString()
  categoryId!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(toIntOrUndef)
  @IsInt()
  @Min(0)
  @Max(2147483647) // INT4 max
  priceCents?: number;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  isActive?: boolean;
}
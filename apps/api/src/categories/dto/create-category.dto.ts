import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";
import { Transform } from "class-transformer";

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  isActive?: boolean;
}
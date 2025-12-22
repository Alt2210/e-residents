import { IsString, IsOptional } from 'class-validator';

export class UpdateHouseholdDto {
  @IsString()
  @IsOptional()
  soHoKhau?: string;

  @IsString()
  @IsOptional()
  soNha?: string;

  @IsString()
  @IsOptional()
  duongPho?: string;

  @IsString()
  @IsOptional()
  phuong?: string;

  @IsString()
  @IsOptional()
  quan?: string;
}


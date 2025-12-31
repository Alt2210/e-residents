import { IsString, IsOptional, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class PersonSearchDto {
  @IsString()
  @IsOptional()
  hoTen?: string;

  @IsString()
  @IsOptional()
  soCCCD?: string;

  @IsString()
  @IsOptional()
  householdId?: string;

  @IsString()
  @IsOptional()
  diaChi?: string;

  @IsEnum(['Nam', 'Nữ', 'Khác'])
  @IsOptional()
  gioiTinh?: string;

  @IsString()
  @IsOptional()
  ngheNghiep?: string;

  @IsEnum(['THUONG_TRU', 'TAM_TRU', 'TAM_VANG', 'DA_CHUYEN_DI', 'DA_QUA_DOI'])
  @IsOptional()
  trangThai?: string;

  @IsString()
  @IsOptional()
  ageGroup?: string;

  @IsString()
  @IsOptional()
  keyword?: string; // Từ khóa tìm kiếm chung

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;
}


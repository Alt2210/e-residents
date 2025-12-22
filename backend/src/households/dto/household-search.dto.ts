import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class HouseholdSearchDto {
  @IsString()
  @IsOptional()
  soHoKhau?: string;

  @IsString()
  @IsOptional()
  chuHo?: string; // Tên chủ hộ

  @IsString()
  @IsOptional()
  diaChi?: string; // Tìm theo địa chỉ

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


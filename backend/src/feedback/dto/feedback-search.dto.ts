import { IsString, IsOptional, IsNumber, Min, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class FeedbackSearchDto {
  @IsString()
  @IsOptional()
  nguoiPhanAnh?: string;

  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @IsDateString()
  @IsOptional()
  toDate?: string;

  @IsString()
  @IsOptional()
  phanLoai?: string;

  @IsEnum(['MOI_GHI_NHAN', 'DANG_XU_LY', 'DA_GIAI_QUYET', 'TAM_DUNG'])
  @IsOptional()
  trangThai?: string;

  @IsString()
  @IsOptional()
  keyword?: string;

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


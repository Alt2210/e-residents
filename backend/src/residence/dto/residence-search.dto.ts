import { IsString, IsOptional, IsNumber, Min, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class TemporaryResidenceSearchDto {
  @IsString()
  @IsOptional()
  personId?: string;

  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @IsDateString()
  @IsOptional()
  toDate?: string;

  @IsEnum(['HIEU_LUC', 'HET_HAN', 'DA_HUY', 'DA_DONG'])
  @IsOptional()
  trangThai?: string;

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

export class AbsenceSearchDto {
  @IsString()
  @IsOptional()
  personId?: string;

  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @IsDateString()
  @IsOptional()
  toDate?: string;

  @IsEnum(['HIEU_LUC', 'HET_HAN', 'DA_HUY', 'DA_DONG'])
  @IsOptional()
  trangThai?: string;

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


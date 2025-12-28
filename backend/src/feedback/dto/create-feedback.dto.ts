import { IsString, IsNotEmpty, IsDateString, IsOptional, IsMongoId, IsEnum } from 'class-validator';

export class CreateFeedbackDto {
  @IsMongoId()
  @IsOptional()
  reporterPersonId?: string;

  @IsString()
  @IsNotEmpty()
  nguoiPhanAnh: string;

  @IsString()
  @IsNotEmpty()
  noiDung: string;

  @IsDateString()
  @IsOptional()
  ngayPhanAnh?: Date;

  @IsString()
  @IsOptional()
  phanLoai?: string;
}


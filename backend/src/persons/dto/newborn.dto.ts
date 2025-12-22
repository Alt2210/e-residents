import { IsString, IsNotEmpty, IsDateString, IsEnum, IsOptional, IsMongoId } from 'class-validator';

export class NewbornDto {
  @IsMongoId()
  @IsNotEmpty()
  householdId: string;

  @IsString()
  @IsNotEmpty()
  hoTen: string;

  @IsDateString()
  @IsNotEmpty()
  ngaySinh: Date;

  @IsEnum(['Nam', 'Nữ', 'Khác'])
  @IsNotEmpty()
  gioiTinh: string;

  @IsString()
  @IsOptional()
  noiSinh?: string;

  @IsString()
  @IsOptional()
  danToc?: string;

  @IsString()
  @IsOptional()
  nguyenQuan?: string;

  @IsString()
  @IsNotEmpty()
  quanHeVoiChuHo: string;

  @IsDateString()
  @IsNotEmpty()
  ngayDangKyThuongTru: Date;
}


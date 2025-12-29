import { IsString, IsNotEmpty, IsDateString, IsEnum, IsOptional, IsMongoId } from 'class-validator';

export class CreatePersonDto {
  @IsString()
  @IsNotEmpty()
  hoTen: string;

  @IsString()
  @IsOptional()
  biDanh?: string;

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
  nguyenQuan?: string;

  @IsString()
  @IsOptional()
  danToc?: string;

  @IsString()
  @IsOptional()
  tonGiao?: string;

  @IsString()
  @IsOptional()
  quocTich?: string;

  @IsString()
  @IsOptional()
  soCCCD?: string;

  @IsDateString()
  @IsOptional()
  ngayCapCCCD?: Date;

  @IsString()
  @IsOptional()
  noiCapCCCD?: string;

  @IsString()
  @IsOptional()
  ngheNghiep?: string;

  @IsString()
  @IsOptional()
  noiLamViec?: string;

  @IsString()
  @IsNotEmpty()
  householdId: string;

  @IsString()
  @IsNotEmpty()
  quanHeVoiChuHo: string;

  @IsDateString()
  @IsNotEmpty()
  ngayDangKyThuongTru: Date;

  @IsString()
  @IsOptional()
  diaChiThuongTruTruoc?: string;
}
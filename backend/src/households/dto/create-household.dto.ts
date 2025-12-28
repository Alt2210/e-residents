import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHouseholdDto {
  @ApiProperty({ example: 'HK001', description: 'Số sổ hộ khẩu' })
  @IsNotEmpty({ message: 'Số hộ khẩu không được để trống' })
  @IsString()
  soHoKhau: string;

  @ApiProperty({ example: '60d5ec...', description: 'ID của chủ hộ (nếu có sẵn)' })
  @IsOptional()
  @IsString()
  chuHoId?: string;

  @ApiProperty({ example: '123' })
  @IsNotEmpty()
  @IsString()
  soNha: string;

  @ApiProperty({ example: 'Đường Láng' })
  @IsNotEmpty()
  @IsString()
  duongPho: string;

  @ApiProperty({ example: 'Trung Hòa' })
  @IsNotEmpty()
  @IsString()
  phuong: string;

  @ApiProperty({ example: 'Cầu Giấy' })
  @IsNotEmpty()
  @IsString()
  quan: string;
}
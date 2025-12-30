import { IsString, IsNotEmpty, MinLength, IsEnum, IsOptional, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Username không được để trống' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Số CCCD không được để trống' })
  soCCCD: string; // Dùng để xác thực danh tính nhân khẩu

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName: string;

  @IsEnum(['TO_TRUONG', 'TO_PHO', 'CAN_BO', 'CONG_DAN'])
  role: string;

  @IsArray()
  @IsOptional()
  assignedModules?: string[];
}
import { IsString, IsNotEmpty, MinLength, IsEnum, IsOptional, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự' })
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEnum(['TO_TRUONG', 'TO_PHO', 'CAN_BO'])
  role: string;

  @IsArray()
  @IsOptional()
  assignedModules: string[];
}
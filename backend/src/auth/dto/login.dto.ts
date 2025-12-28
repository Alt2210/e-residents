import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin',
    description: 'Tên đăng nhập',
  })
  @IsString()
  @IsNotEmpty({ message: 'Username không được để trống' })
  username: string;

  @ApiProperty({
    example: 'admin123',
    description: 'Mật khẩu',
    format: 'password',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;
}


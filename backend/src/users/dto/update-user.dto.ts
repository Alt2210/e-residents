import { IsString, IsOptional, IsEnum, IsArray, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsEnum(['TO_TRUONG', 'TO_PHO', 'CAN_BO', 'CONG_DAN'])
  @IsOptional()
  role?: string;

  @IsArray()
  @IsOptional()
  assignedModules?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}


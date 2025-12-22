import { IsEnum, IsString, IsOptional, IsDateString, IsNotEmpty} from 'class-validator';

export class UpdateStatusDto {
  @IsEnum(['MOI_GHI_NHAN', 'DANG_XU_LY', 'DA_GIAI_QUYET', 'TAM_DUNG'])
  @IsNotEmpty()
  newStatus: string;

  @IsDateString()
  @IsOptional()
  updatedAt?: Date;

  @IsString()
  @IsOptional()
  note?: string;
}


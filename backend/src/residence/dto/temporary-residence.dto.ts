import { IsString, IsNotEmpty, IsDateString, IsMongoId, IsOptional, IsEnum } from 'class-validator';

export class IssueTemporaryResidenceDto {
  @IsMongoId()
  @IsNotEmpty()
  personId: string;

  @IsDateString()
  @IsNotEmpty()
  fromDate: Date;

  @IsDateString()
  @IsNotEmpty()
  toDate: Date;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsNotEmpty()
  stayingAddress: string;

  @IsString()
  @IsOptional()
  fromProvinceOrAddress?: string;
  
  @IsOptional()
  @IsEnum(['HIEU_LUC', 'HET_HAN', 'DA_HUY', 'DA_DONG', 'CHO_DUYET'])
  trangThai?: string;
}

export class ExtendResidenceDto {
  @IsDateString()
  @IsNotEmpty()
  newToDate: Date;

  @IsString()
  @IsOptional()
  note?: string;
}

export class CloseResidenceDto {
  @IsDateString()
  @IsNotEmpty()
  closeDate: Date;

  @IsString()
  @IsOptional()
  note?: string;
}


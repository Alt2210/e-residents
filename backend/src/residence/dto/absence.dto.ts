import { IsString, IsNotEmpty, IsDateString, IsMongoId, IsOptional, IsEnum } from 'class-validator';

export class IssueAbsenceDto {
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
  destination: string;

  @IsOptional()
  @IsEnum(['HIEU_LUC', 'HET_HAN', 'DA_HUY', 'DA_DONG', 'CHO_DUYET'])
  trangThai?: string;
}

export class ExtendAbsenceDto {
  @IsDateString()
  @IsNotEmpty()
  newToDate: Date;

  @IsString()
  @IsOptional()
  note?: string;
}

export class CloseAbsenceDto {
  @IsDateString()
  @IsNotEmpty()
  closeDate: Date;

  @IsString()
  @IsOptional()
  note?: string;
}


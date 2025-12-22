import { IsString, IsNotEmpty, IsArray, IsDateString, IsOptional } from 'class-validator';

export class SplitHouseholdDto {
  @IsString()
  @IsNotEmpty()
  newSoHoKhau: string;

  @IsString()
  @IsNotEmpty()
  newSoNha: string;

  @IsString()
  @IsNotEmpty()
  newDuongPho: string;

  @IsString()
  @IsNotEmpty()
  newPhuong: string;

  @IsString()
  @IsNotEmpty()
  newQuan: string;

  @IsArray()
  @IsNotEmpty()
  selectedPersonIds: string[];

  @IsString()
  @IsNotEmpty()
  newHeadPersonId: string;

  @IsDateString()
  @IsOptional()
  splitDate?: Date;

  @IsString()
  @IsOptional()
  note?: string;
}


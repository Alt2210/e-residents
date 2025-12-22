import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class ChangeHeadDto {
  @IsString()
  @IsNotEmpty()
  newHeadPersonId: string;

  @IsDateString()
  @IsNotEmpty()
  changeDate: Date;

  @IsString()
  @IsOptional()
  note?: string;
}


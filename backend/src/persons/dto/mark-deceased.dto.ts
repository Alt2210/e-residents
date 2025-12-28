import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class MarkDeceasedDto {
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsOptional()
  note?: string;
}


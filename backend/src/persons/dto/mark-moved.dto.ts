import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class MarkMovedDto {
  @IsDateString()
  @IsNotEmpty()
  moveDate: Date;

  @IsString()
  @IsNotEmpty()
  moveTo: string;

  @IsString()
  @IsOptional()
  note?: string;
}


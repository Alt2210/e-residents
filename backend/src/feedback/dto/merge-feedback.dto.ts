import { IsArray, IsString, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';

export class MergeFeedbackDto {
  @IsArray()
  @IsNotEmpty()
  mergeIds: string[];

  @IsDateString()
  @IsOptional()
  mergedAt?: Date;

  @IsString()
  @IsOptional()
  note?: string;
}


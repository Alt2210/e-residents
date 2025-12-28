import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class FeedbackResponseDto {
  @IsString()
  @IsNotEmpty()
  responseContent: string;

  @IsDateString()
  @IsOptional()
  responseDate?: Date;

  @IsString()
  @IsNotEmpty()
  agencyName: string;
}


import { IsString, IsOptional } from 'class-validator';

export class DoubleJobQueryDto {
  @IsString()
  @IsOptional()
  nama?: string;
} 
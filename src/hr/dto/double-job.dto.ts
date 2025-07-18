import { IsOptional, IsString, IsDateString } from 'class-validator';

export class DoubleJobQueryDto {
  @IsOptional()
  @IsString()
  nama?: string;

  @IsOptional()
  @IsDateString()
  tanggal?: string;
}

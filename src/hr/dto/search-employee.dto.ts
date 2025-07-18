import { IsOptional, IsString } from 'class-validator';

export class SearchEmployeeDto {
  @IsOptional()
  @IsString()
  nama?: string;
}
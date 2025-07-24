import { IsString, IsNumberString } from 'class-validator';

export class ComparePayrollDto {
  @IsString()
  period_now: string;

  @IsString()
  period_prev: string;

  @IsNumberString()
  instance_id: string;
} 
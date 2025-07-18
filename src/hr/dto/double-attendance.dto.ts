import { IsDateString } from 'class-validator';

export class DoubleAttendanceQueryDto {
  @IsDateString()
  start: string;

  @IsDateString()
  end: string;
}

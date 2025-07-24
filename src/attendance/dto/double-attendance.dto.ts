import { IsString, IsOptional } from 'class-validator';

export class DoubleAttendanceQueryDto {
  @IsString()
  start: string;

  @IsString()
  end: string;
}

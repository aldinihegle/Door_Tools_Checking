import { IsDateString } from 'class-validator';

export class EmptyOrderFlowQueryDto {
  @IsDateString()
  start: string;

  @IsDateString()
  end: string;
}

import { IsString } from 'class-validator';

export class EmptyOrderFlowQueryDto {
  @IsString()
  start: string;

  @IsString()
  end: string;
}

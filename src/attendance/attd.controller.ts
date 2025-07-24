import { Controller, Get, Query, ValidationPipe, InternalServerErrorException } from '@nestjs/common';
import { AttdService } from './attd.service';
import { DoubleAttendanceQueryDto } from './dto/double-attendance.dto';

@Controller('attendance')
export class AttdController {
  constructor(private readonly attdService: AttdService) {}

  @Get('check-location')
  async checkLocationAttendance(@Query('date') date?: string) {
    return await this.attdService.checkLocationAttendance(date);
  }

  @Get('double')
  async getDoubleAttendance(
    @Query(new ValidationPipe({ transform: true })) query: DoubleAttendanceQueryDto
  ) {
    try {
      const data = await this.attdService.getDoubleAttendance(query);
      return { success: true, data, total: data.length };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}

import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { HrService } from './hr.service';
import { SearchEmployeeDto } from './dto/search-employee.dto';
import { DoubleJobQueryDto } from './dto/double-job.dto';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DoubleAttendanceQueryDto } from './dto/double-attendance.dto';
import { EmptyOrderFlowQueryDto } from './dto/empty-orderflow.dto';

@Controller('hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Get('active-employees')
  async getActiveEmployees(@Query() query: SearchEmployeeDto) {
    return await this.hrService.getActiveEmployees(query);
  }

  @Get('order-anomalies')
  async getOrderAnomalies(@Query('start') start: string, @Query('end') end: string) {
    return await this.hrService.getOrderAnomalies(start, end);

  }

  @Get('test-connection')
  async testConnection() {
    return await this.hrService.testConnection();
  }

  @Get('check-location-attendance')
  async checkLocationAttendance(@Query('date') date?: string) {
    return await this.hrService.checkLocationAttendance(date);
  }

  @Get('double-jobs')
  async getDoubleJobs(
    @Query(new ValidationPipe({ transform: true })) query: DoubleJobQueryDto
  ) {
    try {
      const data = await this.hrService.getDoubleJobs(query);
      return { success: true, data, total: data.length };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('double-attendance')
  async getDoubleAttendance(
    @Query(new ValidationPipe({ transform: true })) query: DoubleAttendanceQueryDto
  ) {
    try {
      const data = await this.hrService.getDoubleAttendance(query);
      return { success: true, data, total: data.length };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('expired-jobs')
  async getExpiredJobs() {
    try {
      const data = await this.hrService.getExpiredJobs();
      return { success: true, data, total: data.length };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('empty-orderflow')
  async getEmptyOrderFlow(
    @Query(new ValidationPipe({ transform: true })) query: EmptyOrderFlowQueryDto
  ) {
    try {
      const data = await this.hrService.getEmptyOrderFlow(query);
      return { success: true, data, total: data.length };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}


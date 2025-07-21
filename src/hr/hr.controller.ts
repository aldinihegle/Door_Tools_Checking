import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { HrService } from './hr.service';
import { SearchEmployeeDto } from './dto/search-employee.dto';
import { DoubleJobQueryDto } from './dto/double-job.dto';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DoubleAttendanceQueryDto } from './dto/double-attendance.dto';
import { EmptyOrderFlowQueryDto } from './dto/empty-orderflow.dto';
import { ComparePayrollDto } from './dto/compare-payroll.dto';

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

  @Get('compare-payroll')
  async comparePayroll(
    @Query('period_now') period_now: string,
    @Query('period_prev') period_prev: string,
  ) {
    return await this.hrService.getPayrollComparison(period_now, period_prev);
  }

  @Get('compare-trial-deduction')
  async compareTrialDeduction(
    @Query('period_now') period_now: string,
    @Query('period_prev') period_prev: string,
  ) {
    return await this.hrService.getTrialDeductionComparison(period_now, period_prev);
  }

  @Get('compare-koperasi-deduction')
  async compareKoperasiDeduction(
    @Query('period_now') period_now: string,
    @Query('period_prev') period_prev: string,
  ) {
    return await this.hrService.getKoperasiDeductionComparison(period_now, period_prev);
  }

  @Get('compare-mart-meal')
  async compareMartMeal(
    @Query('period') period: string,
  ) {
    return await this.hrService.getMartMealComparison(period);
  }

  @Get('compare-pemantra-attendance')
  async comparePemantraAttendance(
    @Query('period') period: string,
  ) {
    return await this.hrService.getPemantraAttendanceComparison(period);
  }

  @Get('payroll-instances')
  async getPayrollInstances() {
    return await this.hrService.getPayrollInstances();
  }

  @Get('payroll-periods')
  async getPayrollPeriods() {
    const periods = await this.hrService.getPayrollPeriods();
    return { success: true, data: periods };
  }

  @Get('compare-overtime')
  async compareOvertime(@Query('period') period: string) {
    return await this.hrService.getOvertimeComparison(period);
  }

  @Get('compare-holiday-overtime')
  async compareHolidayOvertime(@Query('period') period: string) {
    return await this.hrService.getHolidayOvertimeComparison(period);
  }
}


import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { ComparePayrollDto } from './dto/compare-payroll.dto';


@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get('compare')
  async comparePayroll(@Query(new ValidationPipe({ transform: true })) query: ComparePayrollDto) {
    return await this.payrollService.getPayrollComparison(query.period_now, query.period_prev, query.instance_id);
  }
  
  @Get('compare-trial-deduction')
  async compareTrialDeduction(
    @Query('period_now') period_now: string,
    @Query('period_prev') period_prev: string,
  ) {
    return await this.payrollService.getTrialDeductionComparison(period_now, period_prev);
  }

  @Get('compare-koperasi-deduction')
  async compareKoperasiDeduction(
    @Query('period_now') period_now: string,
    @Query('period_prev') period_prev: string,
  ) {
    return await this.payrollService.getKoperasiDeductionComparison(period_now, period_prev);
  }

  @Get('compare-mart-meal')
  async compareMartMeal(
    @Query('period') period: string,
  ) {
    return await this.payrollService.getMartMealComparison(period);
  }

  @Get('compare-pemantra-attendance')
  async comparePemantraAttendance(
    @Query('period') period: string,
  ) {
    return await this.payrollService.getPemantraAttendanceComparison(period);
  }

  @Get('instances')
  async getPayrollInstances() {
    return await this.payrollService.getPayrollInstances();
  }

  @Get('periods')
  async getPayrollPeriods() {
    const periods = await this.payrollService.getPayrollPeriods();
    return { success: true, data: periods };
  }

  @Get('compare-overtime')
  async compareOvertime(@Query('period') period: string) {
    return await this.payrollService.getOvertimeComparison(period);
  }

  @Get('compare-holiday-overtime')
  async compareHolidayOvertime(@Query('period') period: string) {
    return await this.payrollService.getHolidayOvertimeComparison(period);
  }
}

import { Controller, Get, Query, ValidationPipe, InternalServerErrorException } from '@nestjs/common';
import { OrderService } from './order.service';
import { DoubleJobQueryDto } from './dto/double-job.dto';
import { EmptyOrderFlowQueryDto } from './dto/empty-orderflow.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('anomalies')
  async getOrderAnomalies(@Query('start') start: string, @Query('end') end: string) {
    return await this.orderService.getOrderAnomalies(start, end);
  }

  @Get('double-jobs')
  async getDoubleJobs(
    @Query(new ValidationPipe({ transform: true })) query: DoubleJobQueryDto
  ) {
    try {
      const data = await this.orderService.getDoubleJobs(query);
      return { success: true, data, total: data.length };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('expired-jobs')
  async getExpiredJobs() {
    try {
      const data = await this.orderService.getExpiredJobs();
      return { success: true, data, total: data.length };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('empty-flow')
  async getEmptyOrderFlow(
    @Query(new ValidationPipe({ transform: true })) query: EmptyOrderFlowQueryDto
  ) {
    try {
      const data = await this.orderService.getEmptyOrderFlow(query);
      return { success: true, data, total: data.length };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}

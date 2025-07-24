import { Controller, Get, Query } from '@nestjs/common';
import { HrService } from './hr.service';
import { SearchEmployeeDto } from './dto/search-employee.dto';

@Controller('hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Get('active-employees')
  async getActiveEmployees(@Query() query: SearchEmployeeDto) {
    return await this.hrService.getActiveEmployees(query);
  }

  @Get('test-connection')
  async testConnection() {
    return await this.hrService.testConnection();
  }
}


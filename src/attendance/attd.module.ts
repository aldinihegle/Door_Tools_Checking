import { Module } from '@nestjs/common';
import { AttdController } from './attd.controller';
import { AttdService } from './attd.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AttdController],
  providers: [AttdService],
})
export class AttdModule {}

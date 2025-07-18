import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule} from '@nestjs/serve-static'; 
import { join } from 'path';
import { DatabaseModule } from './database/database.module';
import { HrModule } from './hr/hr.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'dist'),
      exclude: ['/api/(.*)'], 
    }),
    DatabaseModule,
    HrModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
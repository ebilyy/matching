import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopsModule } from '../shops/shops.module';
import { ManagersController } from './controllers/managers.controller';
import { ManagerEntity } from './entities/manager.entity';
import { ManagersService } from './services/managers.service';

@Module({
  imports: [TypeOrmModule.forFeature([ManagerEntity]), ShopsModule],
  controllers: [ManagersController],
  providers: [ManagersService],
})
export class ManagersModule {}

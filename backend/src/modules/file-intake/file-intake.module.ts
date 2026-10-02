import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopContextGuard } from '../../common/request-context/shop-context.guard';
import { ManagerEntity } from '../managers/entities/manager.entity';
import { ImportsController } from './controllers/imports.controller';
import { ImportEntity } from './entities/import.entity';
import { FileIntakeService } from './services/file-intake.service';
import { ImportsService } from './services/imports.service';

@Module({
  imports: [TypeOrmModule.forFeature([ImportEntity, ManagerEntity])],
  controllers: [ImportsController],
  providers: [FileIntakeService, ImportsService, ShopContextGuard],
  exports: [FileIntakeService],
})
export class FileIntakeModule {}

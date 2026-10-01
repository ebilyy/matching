import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopContextGuard } from '../../common/request-context/shop-context.guard';
import { SuppliersController } from './controllers/suppliers.controller';
import { SupplierEntity } from './entities/suppliers.entity';
import { SuppliersService } from './services/suppliers.service';

@Module({
  imports: [TypeOrmModule.forFeature([SupplierEntity])],
  controllers: [SuppliersController],
  providers: [SuppliersService, ShopContextGuard],
  exports: [SuppliersService],
})
export class SuppliersModule {}

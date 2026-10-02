import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopContextGuard } from '../../common/request-context/shop-context.guard';
import { FileIntakeModule } from '../file-intake/file-intake.module';
import { CatalogImportsController } from './controllers/catalog-imports.controller';
import { OwnProductEntity } from './entities/own-product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OwnProductEntity]), FileIntakeModule],
  controllers: [CatalogImportsController],
  providers: [ShopContextGuard],
})
export class CatalogModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopsController } from './controllers/shops.controller';
import { ShopEntity } from './entities/shop.entity';
import { ShopsService } from './services/shops.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShopEntity])],
  controllers: [ShopsController],
  providers: [ShopsService],
  exports: [ShopsService],
})
export class ShopsModule {}

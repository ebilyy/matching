import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnProductEntity } from './entities/own-product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OwnProductEntity])],
})
export class CatalogModule {}

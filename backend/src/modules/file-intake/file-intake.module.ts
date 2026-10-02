import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportEntity } from './entities/import.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ImportEntity])],
})
export class FileIntakeModule {}

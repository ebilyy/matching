import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// openapi parameters After / Before / Limit.
export class PageQueryDto {
  @IsOptional()
  @MaxLength(512)
  @Matches(/^[A-Za-z0-9_-]+$/)
  after?: string;

  @IsOptional()
  @MaxLength(512)
  @Matches(/^[A-Za-z0-9_-]+$/)
  before?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 50;
}

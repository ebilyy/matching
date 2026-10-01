import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import type { ShopEntity } from '../entities/shop.entity';

// openapi ShopCreate
export class CreateShopDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;
}

// openapi ShopUpdate
export class UpdateShopDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;
}

// openapi Shop
export type ShopResponse = { id: string; name: string; created_at: string };

export function toShopResponse(shop: ShopEntity): ShopResponse {
  return {
    id: shop.id,
    name: shop.name,
    created_at: shop.createdAt.toISOString(),
  };
}

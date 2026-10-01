import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import type { ManagerEntity } from '../entities/manager.entity';

// openapi ManagerCreate
export class CreateManagerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  display_name: string;
}

// openapi ManagerUpdate
export class UpdateManagerDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  display_name?: string;
}

// openapi Manager
export type ManagerResponse = {
  id: string;
  shop_id: string;
  display_name: string;
  created_at: string;
};

export function toManagerResponse(manager: ManagerEntity): ManagerResponse {
  return {
    id: manager.id,
    shop_id: manager.shopId,
    display_name: manager.displayName,
    created_at: manager.createdAt.toISOString(),
  };
}

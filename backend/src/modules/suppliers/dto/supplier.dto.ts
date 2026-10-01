import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import type {
  ColumnMapping,
  SupplierEntity,
} from '../entities/suppliers.entity';

const HTTP_URL = {
  protocols: ['http', 'https'],
  require_protocol: true,
  require_tld: false,
};

// Optional contact fields: absent = unchanged (update), null = cleared.
// @IsOptional skips validation for both null and undefined.
class SupplierContactsDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string | null;

  @IsOptional()
  @IsUrl(HTTP_URL)
  website?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  // Public http(s) only (PRD §6.1); the SSRF check runs at fetch time in the worker.
  @IsOptional()
  @IsUrl(HTTP_URL)
  feed_url?: string | null;
}

// openapi SupplierCreate
export class CreateSupplierDto extends SupplierContactsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;
}

// openapi SupplierUpdate (merge patch). `name` may be absent but never null.
export class UpdateSupplierDto extends SupplierContactsDto {
  @ValidateIf((dto: UpdateSupplierDto) => dto.name !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;
}

export const SUPPLIER_CARD_FIELDS = [
  'name',
  'email',
  'phone',
  'website',
  'description',
  'feed_url',
] as const;

// openapi Supplier
export type SupplierResponse = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  feed_url: string | null;
  column_mapping: ColumnMapping | null;
  price_date: string | null;
  is_price_stale: boolean;
  created_at: string;
};

// AC-18: global threshold for the pilot (PRD §8).
const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

export function toSupplierResponse(
  supplier: SupplierEntity,
  now: Date = new Date(),
): SupplierResponse {
  return {
    id: supplier.id,
    name: supplier.name,
    email: supplier.email,
    phone: supplier.phone,
    website: supplier.website,
    description: supplier.description,
    feed_url: supplier.feedUrl,
    column_mapping: supplier.columnMapping,
    price_date: supplier.priceDate?.toISOString() ?? null,
    is_price_stale:
      supplier.priceDate !== null &&
      now.getTime() - supplier.priceDate.getTime() > STALE_AFTER_MS,
    created_at: supplier.createdAt.toISOString(),
  };
}

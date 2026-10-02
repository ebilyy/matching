import type { DataSource } from 'typeorm';
import { newId } from '../../src/common/ids/new-id';
import { OwnProductEntity } from '../../src/modules/catalog/entities/own-product.entity';
import type { ShopEntity } from '../../src/modules/shops/entities/shop.entity';

let productSeq = 0;

// sku 'SKU-<uuid8>', name 'Test Product <n>', reliable codes NULL (data-model → Test fixtures).
export async function createOwnProduct(
  ds: DataSource,
  shop: ShopEntity,
  opts: Partial<OwnProductEntity> = {},
): Promise<OwnProductEntity> {
  const id = opts.id ?? newId();
  const product = Object.assign(new OwnProductEntity(), {
    id,
    sku: `SKU-${id.slice(-8)}`,
    name: `Test Product ${++productSeq}`,
    barcode: null,
    manufacturerCode: null,
    brand: null,
    category: null,
    archivedAt: null,
    ...opts,
    shopId: shop.id,
  });
  return ds.getRepository(OwnProductEntity).save(product);
}

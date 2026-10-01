import {
  type CanActivate,
  createParamDecorator,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { DataSource } from 'typeorm';
import { AppError } from '../errors/app-error';

type ShopRequest = Request & { shopId?: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const unauthenticated = () =>
  new AppError('common.unauthenticated', 401, 'Потрібна автентифікація.');

// TODO(T03): dev placeholder for RequestContext (ADR-0008, SAD §11 OQ). The bearer
// token IS the shop id, so anyone who knows an id acts as that shop. Replace with
// the real credential scheme before the pilot; handlers only see @ShopId().
@Injectable()
export class ShopContextGuard implements CanActivate {
  constructor(private readonly dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ShopRequest>();
    const [scheme, token] = (request.headers.authorization ?? '').split(' ');
    if (scheme !== 'Bearer' || !token || !UUID.test(token)) {
      throw unauthenticated();
    }
    const rows: unknown[] = await this.dataSource.query(
      'SELECT 1 FROM shops WHERE id = $1',
      [token],
    );
    if (rows.length === 0) throw unauthenticated();
    request.shopId = token;
    return true;
  }
}

/** shop_id of the caller, resolved by ShopContextGuard. Never taken from the request body. */
export const ShopId = createParamDecorator(
  (_: unknown, context: ExecutionContext): string => {
    const shopId = context.switchToHttp().getRequest<ShopRequest>().shopId;
    if (!shopId) throw unauthenticated();
    return shopId;
  },
);

import { Controller, Get } from '@nestjs/common';

// openapi.yaml → components.schemas.Health
export interface Health {
  status: 'ok' | 'okq';
}

@Controller('health')
export class HealthController {
  @Get()
  getHealth(): Health {
    return { status: 'ok' };
  }
}

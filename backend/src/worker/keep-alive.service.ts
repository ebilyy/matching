import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';

// Holds the event loop open until SIGTERM/SIGINT. Without an HTTP listener the
// worker has no handle of its own; remove once pg-boss (T06) keeps it alive.
@Injectable()
export class KeepAliveService implements OnModuleInit, OnApplicationShutdown {
  private timer?: NodeJS.Timeout;

  onModuleInit(): void {
    this.timer = setInterval(() => undefined, 1 << 30);
  }

  onApplicationShutdown(): void {
    clearInterval(this.timer);
  }
}

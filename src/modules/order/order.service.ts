import { Injectable } from '@nestjs/common';
import { Histogram, Registry } from 'prom-client';

@Injectable()
export class OrderService {
  private readonly register: Registry;
  private readonly httpRequestDuration: Histogram;
  private readonly httpRequestDurationMicroseconds: Histogram;

  constructor() {
    this.register = new Registry();
    this.register.setDefaultLabels({ app: 'example-nodejs-app' });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    });

    this.register.registerMetric(this.httpRequestDuration);
  }

  startTimer(route: string, method: string): () => void {
    return this.httpRequestDuration.startTimer({ route, method });
  }

  getMetrics() {
    return this.register.metrics();
  }

  async createOrder(): Promise<void> {
    const delaySeconds = Math.floor(Math.random() * (6 - 3)) + 3;
    await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
  }

  observeRequestDuration(route: string, method: string, code: number): void {
    this.httpRequestDurationMicroseconds
      .labels({ route, method, code: code.toString() })
      .observe(new Date().getTime());
  }
}

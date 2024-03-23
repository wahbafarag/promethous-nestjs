import { Injectable } from '@nestjs/common';
import client, {
  Counter,
  CounterConfiguration,
  Gauge,
  GaugeConfiguration,
  Histogram,
  HistogramConfiguration,
  register,
} from 'prom-client';

@Injectable()
export class CheckoutService {
  private checkoutsTotal: Counter<any>;
  private httpRequestDurationMicroseconds: Histogram<any>;

  constructor() {
    this.checkoutsTotal = new Counter({
      name: 'checkouts_total',
      help: 'Total number of checkouts',
      labelNames: ['payment_method'],
    });

    this.httpRequestDurationMicroseconds = new Histogram({
      name: 'http_request_duration_ms',
      help: 'Duration of HTTP requests in ms',
      labelNames: ['method', 'route', 'code'],
      buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500],
    });
  }

  incrementCheckouts(paymentMethod: string): void {
    this.checkoutsTotal.inc({ payment_method: paymentMethod });
  }

  observeRequestDuration(
    method: string,
    route: string,
    statusCode: number,
    responseTimeInMs: number,
  ): void {
    this.httpRequestDurationMicroseconds
      .labels(method, route, statusCode.toString())
      .observe(responseTimeInMs);
  }

  async getMetrics(): Promise<string> {
    return register.metrics();
  }
}

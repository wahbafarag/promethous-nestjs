import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Next,
  Post,
  Res,
} from '@nestjs/common';
import { promisify } from 'util';
import { Histogram, Registry, collectDefaultMetrics } from 'prom-client';

@Controller('order')
export class OrderController {
  private readonly register: Registry;
  private readonly httpRequestDurationMicroseconds: Histogram<string>;
  private delay = promisify(setTimeout);

  constructor() {
    this.register = new Registry();
    this.register.setDefaultLabels({ app: 'example-nodejs-app' });
    collectDefaultMetrics({ register: this.register });

    this.httpRequestDurationMicroseconds = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [this.register],
    });
    this.register.registerMetric(this.httpRequestDurationMicroseconds);
  }

  @Post('')
  async createOrder(@Res() res) {
    const end = this.httpRequestDurationMicroseconds.startTimer();
    const route = '/create';

    try {
      if (Math.floor(Math.random() * 100) === 0) {
        throw new Error('Internal Error');
      }

      const delaySeconds = Math.floor(Math.random() * (6 - 3)) + 3;
      await this.delay(delaySeconds * 1000);

      res.status(HttpStatus.CREATED).send('Order created successfully');
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      end({ route, code: res.statusCode, method: 'POST' });
    }
  }

  @Get('/bad')
  async badRoute(@Res() res) {
    const end = this.httpRequestDurationMicroseconds.startTimer();
    try {
      res.json({ message: 'this is a bad route' });
    } finally {
      end({ route: '/bad', code: res.statusCode, method: 'GET' });
    }
  }

  @Get('/metrics')
  async getMetrics(@Res() res) {
    res.setHeader('Content-Type', this.register.contentType);
    res.send(await this.register.metrics());
  }
}

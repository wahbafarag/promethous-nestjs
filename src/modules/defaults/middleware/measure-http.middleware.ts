import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import defaultConfigs from '../configs/configs';
import { Histogram } from 'prom-client';

import { ConfigType } from '@nestjs/config';
import { DefaultsService } from '../defaults.service';

@Injectable()
export class MeasureHttp implements NestMiddleware {
  httpRequests: Histogram;

  constructor(
    @Inject(defaultConfigs.KEY)
    private readonly config: ConfigType<typeof defaultConfigs>,
    private readonly defaultService: DefaultsService,
  ) {
    this.httpRequests = this.defaultService.createHistogram({
      help: 'Tracks HTTP requests',
      name: 'http_requests',
      labelNames: ['method', 'path', 'statusCode'],
      buckets: this.config.httpDurationBuckets,
    });
  }

  use(req: Request, res: Response, next: () => void) {
    const start = Date.now();
    res.once('finish', () => {
      const { method, route } = req;
      const { statusCode } = res;
      const duration = (Date.now() - start) / 1000;
      this.httpRequests.observe(
        {
          method,
          path: route?.path || 'unmatched',
          statusCode,
        },
        duration,
      );
    });
    next();
  }
}

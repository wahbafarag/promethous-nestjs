import { Controller, Get, Put, Res } from '@nestjs/common';
import { Response } from 'express';
import { register } from 'prom-client';

@Controller('defaults')
export class DefaultsController {
  @Get('/all-metrics')
  async allMetrics(@Res({ passthrough: true }) res: Response): Promise<string> {
    res.header('Content-Type', register.contentType);
    return register.metrics();
  }

  @Put('/clear-metrics')
  async clearMetrics(@Res() res: Response): Promise<void> {
    res.status(201).json({
      message: 'Clearing defaults metrics',
    });
  }

  @Get('/health')
  async health(@Res() res: Response): Promise<void> {
    res.status(200).json({
      status: 'UP , Its Good to Go!',
    });
  }
}

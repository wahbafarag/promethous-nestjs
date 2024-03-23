import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { CheckoutService } from './checkout.service';
import { register } from 'prom-client';
import { RequestTimeInterceptor } from './checkout-interceptor';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get('/say-hello')
  @UseInterceptors(RequestTimeInterceptor)
  async getHello(@Res() res: Response): Promise<object> {
    const delay = Math.round(Math.random() * 200);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return res.json({ message: 'Hello World!' });
  }

  @Get('/bad-checkout')
  @UseInterceptors(RequestTimeInterceptor)
  getBad() {
    throw new BadRequestException('Your Fault mf!');
  }

  @Get('increment')
  @UseInterceptors(RequestTimeInterceptor)
  getCheckout(@Res() res): object {
    const paymentMethod = Math.round(Math.random()) === 0 ? 'stripe' : 'paypal';
    this.checkoutService.incrementCheckouts(paymentMethod);
    return res.json({ status: 'incremented' });
  }

  @Get('/metrics')
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', register.contentType);
    return res.send(await this.checkoutService.getMetrics());
  }
}

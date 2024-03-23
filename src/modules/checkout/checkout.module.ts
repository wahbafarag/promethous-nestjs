import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { RequestTimeInterceptor } from './checkout-interceptor';

@Module({
  imports: [],
  providers: [CheckoutService, RequestTimeInterceptor],
  controllers: [CheckoutController],
  exports: [CheckoutService],
})
export class CheckoutModule {}

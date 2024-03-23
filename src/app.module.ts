import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { CheckoutService } from './modules/checkout/checkout.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RequestTimeInterceptor } from './modules/checkout/checkout-interceptor';
import { OrderModule } from './modules/order/order.module';
import { DefaultsModule } from './modules/defaults/defaults.module';
import { ErrorsModule } from './modules/errors/errors.module';

@Module({
  imports: [CheckoutModule, OrderModule, DefaultsModule, ErrorsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

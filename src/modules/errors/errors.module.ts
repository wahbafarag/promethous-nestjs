import { Module } from '@nestjs/common';
import { ErrorsService } from './errors.service';
import { ErrorsController } from './errors.controller';
import {
  PrometheusModule,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';
import { APP_FILTER } from '@nestjs/core';
import { CustomExceptionFilter } from './helpers/exception.filter';

@Module({
  imports: [PrometheusModule.register()],
  providers: [
    ErrorsService,
    makeCounterProvider({
      name: 'nestjs_errors',
      help: 'nestjs_errors',
      labelNames: ['domain', 'status'],
    }),
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
  ],
  controllers: [ErrorsController],
})
export class ErrorsModule {}

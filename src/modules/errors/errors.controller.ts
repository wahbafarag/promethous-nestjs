import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { AppController } from 'src/app.controller';
import { BusinessException, ErrorDomain } from './helpers/business.exception';
import { register } from 'prom-client';

@Controller('errors')
export class ErrorsController {
  //

  @Get()
  getHello() {
    throw ErrorsController.genError();
  }

  private static genError(): Error {
    const getRandom = <T>(...values: T[]): T =>
      values[Math.floor(Math.random() * values.length)];

    const domain = getRandom(
      ErrorDomain.Generic,
      ErrorDomain.Orders,
      ErrorDomain.Users,
    );
    const status = getRandom(
      HttpStatus.BAD_REQUEST,
      HttpStatus.NOT_FOUND,
      HttpStatus.CONFLICT,
      HttpStatus.FORBIDDEN,
      HttpStatus.UNAUTHORIZED,
      HttpStatus.BAD_GATEWAY,
      HttpStatus.GATEWAY_TIMEOUT,
    );

    switch (Math.floor(Math.random() * 3)) {
      case 0:
        return new HttpException('nestjs-exception', status);
      case 1:
        return new Error('unknown-error');
      case 2:
        console.log(status);
        return new BusinessException(
          domain,
          'business-exception',
          'business-exception',
          status,
        );
    }
  }

  @Get('metrics')
  async metrics(): Promise<string> {
    return register.metrics();
  }
}

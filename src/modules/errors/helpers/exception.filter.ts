import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessException, ErrorDomain } from './business.exception';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

export interface ApiError {
  id: string;
  domain: ErrorDomain;
  message: string;
  timestamp: Date;
}

@Catch(Error)
export class CustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CustomExceptionFilter.name);

  constructor(
    @InjectMetric('nestjs_errors') private readonly counter: Counter<string>,
  ) {}

  catch(exception: Error, host: ArgumentsHost) {
    let error: BusinessException;
    let status: HttpStatus;

    if (exception instanceof BusinessException) {
      error = exception;
      status = exception.status;
    } else if (exception instanceof HttpException) {
      error = new BusinessException(
        ErrorDomain.Generic,
        exception.message,
        exception.message,
        exception.getStatus(),
      );
      status = exception.getStatus();
    } else {
      error = new BusinessException(
        ErrorDomain.Generic,
        `Internal error occurred: ${exception.message}`,
        'Internal error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    this.counter.labels(error.domain, error.status.toString()).inc();

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    this.logger.error(
      `Got an exception: ${JSON.stringify({
        path: request.url,
        ...error,
      })}`,
    );

    console.log(HttpStatus[status]);

    response.status(status).json(error.toApiError());
  }
}

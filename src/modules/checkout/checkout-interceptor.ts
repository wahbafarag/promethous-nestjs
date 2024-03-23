import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RequestTimeInterceptor implements NestInterceptor {
  constructor(private readonly checkoutService: CheckoutService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    console.log('RequestTimeInterceptor: request started'); // Add logging for debugging

    res.locals.startEpoch = Date.now();

    return next.handle().pipe(
      tap(() => {
        if (res.locals && res.locals.startEpoch) {
          const responseTimeInMs = Date.now() - res.locals.startEpoch;
          this.checkoutService.observeRequestDuration(
            req.method,
            req.url,
            res.statusCode,
            responseTimeInMs,
          );
          console.log('RequestTimeInterceptor: request completed'); // Add logging for debugging
        }
      }),
    );
  }
}

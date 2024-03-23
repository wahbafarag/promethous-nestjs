import {
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { DefaultsService } from './defaults.service';
import { DefaultsController } from './defaults.controller';
import defaultConfigs from './configs/configs';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { MeasureHttp } from './middleware/measure-http.middleware';

@Module({
  imports: [ConfigModule.forFeature(defaultConfigs)],
  providers: [DefaultsService],
  controllers: [DefaultsController],
})
export class DefaultsModule implements NestModule, OnApplicationBootstrap {
  constructor(
    @Inject(defaultConfigs.KEY)
    private readonly config: ConfigType<typeof defaultConfigs>,
    private defaultService: DefaultsService,
  ) {}

  onApplicationBootstrap() {
    if (this.config.enableDefaultMetrics) {
      this.defaultService.enableDefaultMetrics();
    }
  }

  configure(consumer: MiddlewareConsumer): any {
    if (this.config.enableHttpMetrics) {
      consumer.apply(MeasureHttp).forRoutes('*');
    }
  }
}

import { Module } from '@nestjs/common';
import { PinoLogger } from './logger/pino.logger';
import { Logger } from '@/domain/application/gateways/tools/logger.interface';
import pino from 'pino';
import { EnvService } from '../env/env.service';
import { EnvModule } from '../env/env.module';

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: Logger,
      inject: [EnvService],
      useFactory: (env: EnvService) =>
        new PinoLogger(
          pino({
            level: env.get('LOG_LEVEL') as pino.Level,
          }),
        ),
    },
  ],
  exports: [Logger],
})
export class ToolsModule {}

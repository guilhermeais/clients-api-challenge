import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './infra/env/env';
import { EnvModule } from './infra/env/env.module';
import { HttpModule } from './infra/http/http.module';
import { ToolsModule } from './infra/tools/tools.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => envSchema.parse(env),
    }),
    EnvModule,
    ToolsModule,
    HttpModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

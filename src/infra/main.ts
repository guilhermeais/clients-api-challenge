import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvService } from './env/env.service';
import { DefaultExceptionFilter } from './http/filters/default-exception-filter.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new DefaultExceptionFilter());

  const env = app.get(EnvService);

  const port = env.get('PORT');

  console.log(`Starting application on port ${port} ⏳...`);
  await app.listen(3000);
  console.log(`Application started on port ${port} 🚀!`);
}
bootstrap();

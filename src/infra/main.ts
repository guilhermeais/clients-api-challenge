import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvService } from './env/env.service';
import { DefaultExceptionFilter } from './http/filters/default-exception-filter.filter';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import compression from 'compression';
import { ClusterService } from './clusterize';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalFilters(new DefaultExceptionFilter());
  app.use(compression());
  const env = app.get(EnvService);

  const port = env.get('PORT');

  console.log(`Starting application on port ${port} ⏳...`);
  await app.listen(port, '0.0.0.0');
  console.log(`Application started on port ${port} - ${process.pid} 🚀!`);
}
ClusterService.clusterize(bootstrap);

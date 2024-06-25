import { Logger } from '@/domain/application/gateways/tools/logger.interface';
import { EnvService } from '@/infra/env/env.service';
import { Provider } from '@nestjs/common';
import { MongoClient } from 'mongodb';

export const MONGO_DB_CONNECTION = Symbol('MONGO_DB_CONNECTION');

export const MONGO_DB_CONNECTION_PROVIDER: Provider<MongoClient> = {
  provide: MONGO_DB_CONNECTION,
  inject: [EnvService, Logger],
  useFactory: async (envService: EnvService, logger: Logger) => {
    const MONGO_URI = envService.get('MONGO_URI');
    logger.log(
      'MongoDBConnection',
      `Connecting to mongodb with uri ${MONGO_URI} ⏳...`,
    );
    const client = await new MongoClient(MONGO_URI).connect();

    logger.log('MongoDBConnection', 'Connected to mongodb 🚀');
    await createIndexes(client, logger);

    return client;
  },
};

async function createIndexes(client: MongoClient, logger: Logger) {
  logger.log('MongoDBConnection', 'Creating indexes ⏳...');
  const db = client.db();
  const customersCollection = db.collection('customers');

  await customersCollection.createIndex({ email: 1 }, { unique: true });

  logger.log('MongoDBConnection', 'Indexes created 🚀');
}

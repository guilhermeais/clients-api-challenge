import { Env } from '@/infra/env/env';
import {
  MongoDBContainer,
  StartedMongoDBContainer,
} from '@testcontainers/mongodb';

let mongoContainer: StartedMongoDBContainer;

async function startMongoDB() {
  console.log('⌛ Starting MongoDBContainer...');

  mongoContainer = await new MongoDBContainer().start();

  const uri = `${mongoContainer.getConnectionString()}?directConnection=true`;

  console.log(`🚀 MongoDBContainer started at ${uri}`);

  return { uri };
}

async function stopMongoDB() {
  console.log('⌛ Stopping MongoDBContainer...');
  await mongoContainer.stop();
  console.log('💤 MongoDBContainer stopped');
}

export async function setup() {
  const { uri } = await startMongoDB();

  const mockedEnvs: Env = {
    PORT: 3000,
    MONGO_URI: uri,
    PRODUCTS_SERVICE_URL: 'http://localhost:3001',
  };

  Object.entries(mockedEnvs).forEach(([key, value]) => {
    process.env[key] = value as any;
  });
}

export async function teardown() {
  console.log('teardown...');
  await stopMongoDB();
}

import { MongoClient } from 'mongodb';

export async function connectToMongoose() {
  const mongoUrl = process.env.MONGO_URI;

  if (!mongoUrl) {
    throw new Error('MONGO_URL not found');
  }

  const client = new MongoClient(mongoUrl, {
    directConnection: true,
  });

  await client.connect();

  return client;
}

export async function flushMongoDb() {
  console.log('🚿 Flushing MongoDB database...');
  const mongooseCon = await connectToMongoose();
  const collections = await mongooseCon.db().collections();

  console.log(
    `🧹 Flushing ${collections.length} collections from MongoDB database...`,
  );
  await Promise.all(
    collections.map(async (collection) => {
      await collection.deleteMany({});
    }),
  );

  await mongooseCon.close();

  console.log('🧼 MongoDB database flushed');
}

import { flushMongoDb } from './utils/mongodb.utils';

beforeEach(async () => {
  await flushMongoDb();
});

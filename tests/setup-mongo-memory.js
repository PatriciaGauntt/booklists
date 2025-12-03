import { MongoMemoryServer } from 'mongodb-memory-server';
import { mongo } from '../lib/mongo.js';

let mongod;

export const connectMemoryDB = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongo.connect(uri, 'testdb'); // your mongo.js should support this
};

export const closeMemoryDB = async () => {
  await mongo.disconnect();
  if (mongod) await mongod.stop();
};

export const clearCollections = async () => {
  const db = mongo.getDb();
  const collections = await db.collections();

  for (const col of collections) {
    await col.deleteMany({});
  }
};

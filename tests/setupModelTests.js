import { MongoMemoryServer } from "mongodb-memory-server";
import { mongo } from "../lib/mongo.js";

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongo.connect(uri);
});

afterEach(async () => {
  const db = mongo.getDb();
  const collections = await db.listCollections().toArray();

  for (const { name } of collections) {
    await db.collection(name).deleteMany({});
  }
});

afterAll(async () => {
  await mongo.close();
  await mongod.stop();
});
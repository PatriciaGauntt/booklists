import { MongoClient } from 'mongodb';
import { logger } from '../lib/logger.js';
import { Constants } from '../lib/constants.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/booknest';

function normalize(value) {
  return (value || '').trim().toLowerCase();
}

async function backfillIsPotentialDuplicate() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const db = client.db();
  const collection = db.collection(Constants.BOOKLIST_COLLECTIONS);

  logger.info('Starting duplicate backfill...');

  const books = await collection.find({}, { projection: { _id: 0 } }).toArray();

  const map = new Map();

  // Build lookup
  for (const book of books) {
    if (!book.title || !book.author_last_name) continue;

    const key = `${normalize(book.title)}|${normalize(book.author_last_name)}`;

    if (!map.has(key)) {
      map.set(key, []);
    }

    map.get(key).push(book.id);
  }

  let updates = 0;

  // Apply updates
  for (const book of books) {
    let isPotentialDuplicate = false;

    if (book.title && book.author_last_name) {
      const key = `${normalize(book.title)}|${normalize(book.author_last_name)}`;
      const matches = map.get(key) || [];

      isPotentialDuplicate = matches.length > 1;
    }

    await collection.updateOne(
      { id: book.id },
      { $set: { isPotentialDuplicate } }
    );

    updates++;
  }

  logger.info(`Backfill complete. Updated ${updates} books.`);
  await client.close();
}

backfillIsPotentialDuplicate()
  .then(() => {
    logger.info('Duplicate backfill finished successfully.');
    process.exit(0);
  })
  .catch(err => {
    logger.error('Duplicate backfill failed', err);
    process.exit(1);
  });

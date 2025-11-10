import { MongoClient } from 'mongodb';

import { Constants } from '../lib/constants.js';
import { logger } from './logger.js';

class Mongo {
  db = '';

  init = async (uri, database, connectionOptions) => {
    const client = new MongoClient(uri, connectionOptions);
    await client.connect();
    logger.info(`Connected to Mongo @ ${uri}`);
    this.db = client.db(database);
    logger.info(`Selected Mongo database named : ${database}`);
    try {
      await this.db
        .collection(Constants.BOOKLIST_COLLECTIONS)
        .createIndex({ id: 1 }, { unique: true });

      logger.info(`Ensured index on field 'id' (unique) for collection '${Constants.BOOKLIST_COLLECTIONS}'`);
    } catch (err) {
      logger.error(`Error creating index on 'id': ${err.message}`);
    }
  };

  getDb = () => {
    return this.db;
  }
}

export const mongo = new Mongo();
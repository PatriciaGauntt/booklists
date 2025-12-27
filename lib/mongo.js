import { MongoClient } from "mongodb";
import { Constants } from "./constants.js";
import { logger } from "./logger.js";

class Mongo {
  client = null;
  db = null;

  /** Compatible with both real MongoDB & MongoMemoryServer */
  async connect(uri, dbName = "testdb", connectionOptions = {}) {
    this.client = new MongoClient(uri, {
      ignoreUndefined: true,
      ...connectionOptions,
    });

    await this.client.connect();
    logger.info(`Connected to Mongo @ ${uri}`);

    this.db = this.client.db(dbName);
    logger.info(`Selected Mongo database named : ${dbName}`);

    try {
      await this.db
        .collection(Constants.BOOKLIST_COLLECTIONS)
        .createIndex({ id: 1 }, { unique: true });

      logger.info(
        `Ensured index on field 'id' (unique) for collection '${Constants.BOOKLIST_COLLECTIONS}'`
      );
    } 
    /* istanbul ignore next */
    catch (err) {
      logger.error(`Error creating index on 'id': ${err.message}`);
    }
  }

  /** Old name kept for backward compatibility */
  async init(uri, dbName, options) {
    return this.connect(uri, dbName, options);
  }

  getDb() {
    return this.db;
  }

  /** Required by Jest tear-down */
  async close() {
    /* istanbul ignore next */
    if (this.client) {
      await this.client.close();
    }
    this.client = null;
    this.db = null;
  }
}

export const mongo = new Mongo();

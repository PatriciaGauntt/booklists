import config from 'config';
import { logger } from './lib/logger.js';
import { mongo } from './lib/mongo.js';
import app from './app.js';

const port = 3000;
const mongoConfig = config.get('mongodb');

const mongoOptions = {
  appName: mongoConfig.applicationName,
  minPoolSize: mongoConfig.minPoolSize,
  maxPoolSize: mongoConfig.maxPoolSize,
};

async function start() {
  await mongo.init(mongoConfig.url, mongoConfig.database, mongoOptions);

  app.listen(port, () => {
    logger.info(`${new Date().toISOString()}: Book List API listening at http://localhost:${port}`);
  });
}

start();

import express from 'express';
import config from 'config';

import { logger } from './lib/logger.js';
import { mongo } from './lib/mongo.js';
import { errorHandler } from './middleware/error.middleware.js';
import { bookListRouter } from './routes/booklist.routes.js';

const app = express();
const port = 3000;
const mongoConfig = config.get('mongodb');


app.use(express.json());

app.use('/api/v1/booklists', bookListRouter);

app.use(errorHandler);
const mongoOptions = {
  appName: mongoConfig.applicationName,
  minPoolSize: mongoConfig.minPoolSize,
  maxPoolSize: mongoConfig.maxPoolSize,
};

await mongo.init(mongoConfig.url, mongoConfig.database, mongoOptions);

app.listen(port, () => {
  logger.info(`${new Date().toISOString()}: TODO List API listening at http://localhost:${port}`);
});

import fs from 'node:fs';
import path from 'node:path';

import config from 'config';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logDir = path.join(process.cwd(), 'logs');
/* istanbul ignore next */
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logLevel = config.get('logLevel');

const rotateTransport = new DailyRotateFile({
  level: logLevel,
  filename: path.join(logDir, 'booklists-api-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.json(),
  defaultMeta: { service: config.get('applicationName') },
  transports: [
    rotateTransport,
  ],
});
/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.json(),
  }));
}

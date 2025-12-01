import express from 'express';
import { errorHandler } from './middleware/error.middleware.js';
import { bookListRouter } from './routes/booklist.routes.js';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/v1/booklists', bookListRouter);

// Error middleware (MUST be last)
app.use(errorHandler);

export default app;
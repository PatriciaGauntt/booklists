import express from 'express';

import { FeedbackController } from '../controllers/feedback.controller.js';

export const feedbackRouter = express.Router();

feedbackRouter.get('/', FeedbackController.getAllFeedback);
feedbackRouter.get('/:id', FeedbackController.getFeedbackById);
feedbackRouter.post('/', FeedbackController.createFeedback);
feedbackRouter.delete('/:id', FeedbackController.deleteFeedback);
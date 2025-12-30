import AJV from "ajv";
import addFormats from "ajv-formats";
import { v4 as uuid } from "uuid";

import { logger } from "../lib/logger.js";
import { FeedbackModel } from "../models/feedback.model.js";
import feedbackSchema from "../schemas/feedback.json" with { type: "json" };

const ajv = new AJV();
addFormats(ajv);
const validate = (data) => ajv.validate(feedbackSchema, data);

export class FeedbackService {

  // -------------------------------------------------
  // GET ALL FEEDBACK
  // -------------------------------------------------
  static async getAllFeedback() {
    logger.debug("Service : getFeedback");

    const cursor = await FeedbackModel.getAllFeedback();
    return cursor.toArray();
  }

  // -------------------------------------------------
  // GET ONE FEEDBACK
  // -------------------------------------------------
  static async getFeedbackById(id) {
    logger.debug(`Service : getFeedbackById, id: ${id}`);
    return FeedbackModel.getFeedbackById(id);
  }

  // -------------------------------------------------
  // CREATE FEEDBACK
  // -------------------------------------------------
  static async createFeedback(feedback) {
    logger.debug("Service : createFeedback");

    const fullUuid = uuid();

    const newFeedback = {
      ...feedback,
      id: fullUuid.slice(0, 6),
      uuid: fullUuid,
      createdDate: new Date().toISOString()
    };

    const valid = validate(newFeedback);
    if (!valid) {
      logger.warn("Validation error on creating feedback!", validate.errors);
      const error = new Error("Validation failed on feedback message");
      error.statusCode = 400;
      error.details = validate.errors;
      throw error;
    }

    const created = await FeedbackModel.createFeedback(newFeedback);
    return created;
  }

  // -------------------------------------------------
  // DELETE FEEDBACK
  // -------------------------------------------------
  static async deleteFeedback(id) {
    logger.debug(`Service : deleteFeedback, id: ${id}`);

    const existing = await FeedbackModel.getFeedbackById(id);
    if (!existing) {
      const err = new Error(`Feedback message with id ${id} not found`);
      err.statusCode = 404;
      throw err;
    }

    await FeedbackModel.deleteFeedback(id);
    return { deleted: true };
  }
}

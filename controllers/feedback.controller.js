import { logger } from "../lib/logger.js";
import { FeedbackService } from "../services/feedback.service.js";

export class FeedbackController {

  // ============================================================
  // GET MANY
  // ============================================================
  static async getAllFeedback(req, res) {
    logger.debug("Controller : getFeedback");

    const feedback = await FeedbackService.getAllFeedback();
    res.status(200).json(feedback);
  }

  // ============================================================
  // GET ONE
  // ============================================================
  static async getFeedbackById(req, res) {
    logger.debug(`Controller : getFeedbackById, id: ${req.params.id}`);

    const result = await FeedbackService.getFeedbackById(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.status(200).json(result);
  }

  // ============================================================
  // CREATE
  // ============================================================
  static async createFeedback(req, res) {
    try {
      logger.debug("Controller : createFeedback");

      const created = await FeedbackService.createFeedback(req.body);
      return res.status(201).json(created);

    } catch (err) {
      logger.error(err.message);
      res.status(err.statusCode || 500).json({
        error: err.message
      });
    }
  }

  // ============================================================
  // DELETE
  // ============================================================
  static async deleteFeedback(req, res) {
    logger.debug(`Controller : deleteFeedback, id: ${req.params.id}`);

    try {
      await FeedbackService.deleteFeedback(req.params.id);
      return res.sendStatus(204);
    } catch (err) {
      logger.error(err.message);
      return res.status(err.statusCode || 500).json({
        error: err.message || "Unknown error deleting message"
      });
    }
  }
}

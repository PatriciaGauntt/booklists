import { Constants } from '../lib/constants.js';
import { logger } from '../lib/logger.js';
import { mongo } from '../lib/mongo.js';

export class FeedbackModel {

  // ============================================================
  // COLLECTION
  // ============================================================
  static getCollection() {
    const db = mongo.getDb();
    return db.collection(Constants.FEEDBACK_COLLECTIONS);
  }

  // ============================================================
  // GET MANY
  // ============================================================
  static getAllFeedback() {
    logger.debug('FeedbackModel : getAllFeedbackList');

    return this.getCollection()
      .find(
        {},
        { projection: { _id: 0 } }
      )
      .sort({ createdDate: -1 });
  }

  // ============================================================
  // GET ONE
  // ============================================================
  static async getFeedbackById(id) {
    logger.debug(`FeedbackModel : getFeedbackById, id: ${id}`);

    return this.getCollection().findOne(
      { id },
      { projection: { _id: 0 } }
    );
  }

  // ============================================================
  // CREATE
  // ============================================================
  static async createFeedback(feedback) {
    logger.debug('FeedbackModel : createFeedback');

    await this.getCollection().insertOne(feedback);
    delete feedback._id;

    return feedback;
  }

  // ============================================================
  // DELETE
  // ============================================================
  static async deleteFeedback(id) {
    logger.debug(`FeedbackModel : deleteFeedback, id: ${id}`);

    const result = await this.getCollection().deleteOne({ id });
    return result.deletedCount === 1;
  }

  // ============================================================
  // TEST / LEGACY COMPATIBILITY WRAPPERS
  // ============================================================

  // insertOne → createFeedback
  static async insertOne(feedback) {
    return this.createFeedback(feedback);
  }

  // findAll → getFeedbackList
  static async findAll() {
    const cursor = this.getFeedbackList();
    return cursor.toArray();
  }

  // findOne → getFeedbackById
  static async findOne(id) {
    return this.getFeedbackById(id);
  }

  // deleteOne → deleteFeedback
  static async deleteOne(id) {
    return this.deleteFeedback(id);
  }
}

import { Constants } from '../lib/constants.js';
import { logger } from '../lib/logger.js';
import { BookListService } from '../services/booklist.service.js';

export class BookListController {

  // ============================================================
  // GET MANY
  // ============================================================
  static async getBookLists(req, res) {
    logger.debug('Controller : getBookLists');

    const searchTerm = req.query.search;
    const skip = Number(req.query.skip) || 0;
    const limit = Number(req.query.limit) || Constants.DEFAULT_LIMIT; 

    const resultCursor = await BookListService.getBookLists(searchTerm, skip, limit);
    res.status(200).json(await resultCursor.toArray());
  }

  // ============================================================
  // GET ONE
  // ============================================================
  static async getBookList(req, res) {
    logger.debug(`Controller : getBookList, id: ${req.params.id}`);
    const result = await BookListService.getBookList(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "BookList not found" });
    }
    res.status(200).json(result);
  }

  // ============================================================
  // CREATE
  // ============================================================
  static async createBookList(req, res) {
    try {
      logger.debug('Controller : createBookList');
      const result = await BookListService.createBookList(req.body);
      res.status(201).json(result);
    } catch (err) {
      logger.error(err.message);
      res.status(err.statusCode || 500).json({
        error: err.message,
      });
    }
  }

  // ============================================================
  // PATCH — Partial Update
  // ============================================================
  static async updateBookList(req, res) {
    try {
      logger.debug(`Controller: updateBookList, id: ${req.params.id}`);
      const result = await BookListService.updateBookList(req.params.id, req.body);
      res.status(200).json(result);
    } catch (err) {
      logger.error(err.message);
      res.status(err.statusCode || 500).json({
        error: err.message,
      });
    }
  }

  // ============================================================
  // PUT — Replace 
  // ============================================================
  static async replaceBookList(req, res) {
    try {
      logger.debug(`Controller : replaceBookList, id: ${req.params.id}`);
      const result = await BookListService.replaceBookList(req.params.id, req.body);
      res.status(200).json(result);
    } catch (err) {
      logger.error(`Error replacing Book: ${err.message}`);
      res.status(err.statusCode || 500).json({
        error: err.message,
        ...(err.details && { details: err.details }),
      });
    }
  }

// ============================================================
// DELETE
// ============================================================
 
static async deleteBookList(req, res) {
  logger.debug(`Controller : deleteBookList, id: ${req.params.id}`);

  try {
    const deleted = await BookListService.deleteBookList(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Book not found" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      error: err.message || "Unknown error deleting booklist"
    });
  }
}

// ============================================================
// ADD COMMENT
// ============================================================
  
static async addComment(req, res, next) {
  try {

    const result = await BookListService.addComment(req.params.id, req.body);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// ============================================================
// DELETE COMMENT
// ============================================================
 
static async deleteComment(req, res) {
  try {
    const { id, commentId } = req.params;

    const result = await BookListService.deleteComment(id, commentId);

    if (!result) {
      return res.status(404).json({ message: 'Book or comment not found' });
    }

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Server error deleting comment' });
  }
}
}

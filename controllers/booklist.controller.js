import { logger } from '../lib/logger.js';
import { BookListService } from '../services/booklist.service.js';

export class BookListController {
  static async getBookLists(req, res, next) {
    logger.debug('Controller : getBookLists');
    const resultCursor = await BookListService.getBookLists();
    res.status(200).json(await resultCursor.toArray());
  }

  static async getBookList(req, res) {
    logger.debug(`Controller : getBookList, id: ${req.params.id}`);
    const result = await BookListService.getBookList(req.params.id);
    if (!result) {
      res.sendStatus(404);
      return;
    }
    res.status(200).json(result);
  }

  static async createBookList(req, res, next) {
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

  static async replaceBookList(req, res) {
    try {
      logger.debug(`Controller : replaceBookList, id: ${req.params.id}`);
      const result = await BookListService.replaceBookList(req.params.id, req.body);
      if (!result) {
        res.sendStatus(404);
        return;
      }
      res.status(200).json(result);
    } catch (err) {
      logger.error(`Error replacing Book: ${err.message}`);
      res.status(err.statusCode || 500).json({
        error: err.message,
        ...(err.details && { details: err.details }),
      });
    }
  }

  static async deleteBookList(req, res) {
    logger.debug(`Controller : deleteBookList, id: ${req.params.id}`);
    const result = await BookListService.deleteBookList(req.params.id);
    if (result) {
      res.sendStatus(204);
      return;
    }
    res.sendStatus(404);
  }
}

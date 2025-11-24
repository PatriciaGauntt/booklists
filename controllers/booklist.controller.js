import { Constants } from '../lib/constants.js';
import { logger } from '../lib/logger.js';
import { BookListService } from '../services/booklist.service.js';
//import { BookListModel } from '../models/booklist.model.js';

export class BookListController {
  static async getBookLists(req, res) {
    logger.debug('Controller : getBookLists');

    const searchTerm = req.query.search;
    const skip = Number(req.query.skip) || 0;
    const limit = Number(req.query.limit) || Constants.DEFAULT_LIMIT; 

    const resultCursor = await BookListService.getBookLists(searchTerm, skip, limit);
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
static async addComment(req, res, next) {
  try {

    const result = await BookListService.addComment(req.params.id, req.body);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
}

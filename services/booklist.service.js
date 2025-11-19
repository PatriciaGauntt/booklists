import AJV from 'ajv';
import addFormats from 'ajv-formats';
import { v4 as uuid } from 'uuid';

import { logger } from '../lib/logger.js';
import { BookListModel } from '../models/booklist.model.js';
import bookListSchema from '../schemas/booklist.json' with { type: 'json' };

const ajv = new AJV();
addFormats(ajv);
const validate = ajv.compile(bookListSchema);

export class BookListService {
  static getBookLists(searchTerm, skip, limit) {
    logger.debug('Service : getBookLists');
    return BookListModel.getBookLists(searchTerm, skip, limit);
  }

  static getBookList(id) {
    logger.debug(`Service : getBookList, id: ${id}`);
    return BookListModel.getBookList(id);
  }

static createBookList(bookList) {
  if (!bookList.title || !bookList.title.trim()) {
    const error = new Error('The "title" field cannot be empty or just spaces.');
    error.statusCode = 400;
    throw error;
  }

  const fullUuid = uuid(); // generate UUID once

  const newBookList = {
    ...bookList,
    id: fullUuid.slice(0, 5), // slice from the same UUID
    tracking: {
      uuid: fullUuid,         // keep full UUID here
      createdDate: new Date().toISOString()
    }
  };

    const valid = validate(newBookList);
    if (!valid) {
      logger.warn('Validation error on creating a new book!', validate.errors);
      throw validate.errors;
    }

    logger.debug('Service : createBookList');
    return BookListModel.createBookList(newBookList);
  }

  static async updateBookList(id, bookList) {
    if (bookList.title !== undefined && !bookList.title.trim()) {
      const error = new Error('The "title" field cannot be empty or just spaces.');
      error.statusCode = 400;
      throw error;
    }
    const existingBookList = await BookListModel.getBookList(id);

    if (!existingBookList) {
      throw new Error(`Book with ${id} not found`);
    }

    const updateBookList = {
      ...existingBookList,
      ...bookList,
      id,
      tracking: {
        ...existingBookList.tracking,
        updatedDate: new Date().toISOString()
      },
    };

    const valid = validate(updateBookList);
    if (!valid) {
      logger.warn('Validation error on updating a book!', validate.errors);
      throw validate.errors;
    }

    logger.debug(`Service : updateBookList, id: ${id}`);
    return BookListModel.updateBookList(id, updateBookList);
  }

  static async replaceBookList(id, bookList) {
    if (bookList.title !== undefined && !bookList.title.trim()) {
      const error = new Error('The "title" field cannot be empty or just spaces.');
      error.statusCode = 400;
      throw error;
    }
    const existingBookList = await BookListModel.getBookList(id);

    if (!existingBookList) {
      throw new Error(`Book with ${id} not found`);
    }

    const replaceBookList = {
      ...existingBookList,
      ...bookList,
      id,
      tracking: {
        ...existingBookList.tracking,
        updatedDate: new Date().toISOString()
      }
    };

      const valid = validate(replaceBookList);
      if (!valid) {
        logger.warn('Validation error on replacing a book!', validate.errors);
      throw validate.errors;
    }

    logger.debug(`Service : replaceBookList, id: ${id}`);
    return BookListModel.replaceBookList(id, replaceBookList);
  }

  static deleteBookList(id) {
    logger.debug(`Service : deleteBookList, id: ${id}`);
    return BookListModel.deleteBookList(id);
  }
}

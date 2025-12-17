import AJV from "ajv";
import addFormats from "ajv-formats";
import { v4 as uuid } from "uuid";

import { logger } from "../lib/logger.js";
import { BookListModel } from "../models/booklist.model.js";
import bookListSchema from "../schemas/booklist.json" with { type: "json" };

const ajv = new AJV();
addFormats(ajv);
const validate = (data) => ajv.validate(bookListSchema, data);

export class BookListService {

  // -------------------------------------------------
  // GET ALL BOOKLISTS
  // -------------------------------------------------
  static getBookLists(searchTerm, skip, limit) {
    logger.debug('Service : getBookLists');
    return BookListModel.getBookLists(searchTerm, skip, limit);
  }

  // -------------------------------------------------
  // GET ONE BOOKLIST
  // -------------------------------------------------
  static getBookList(id) {
    logger.debug(`Service : getBookList, id: ${id}`);
    return BookListModel.getBookList(id);
  }

  // -------------------------------------------------
  // GET COMMENTS
  // -------------------------------------------------
  static async getComments(id) {
    logger.debug(`Service : getComments, id: ${id}`);

    const book = await BookListModel.getBookList(id);

    if (!book) {
      const err = new Error(`Book with ${id} not found`);
      err.statusCode = 404;
      throw err;
    }

    return book.comments || [];
  }

  // -------------------------------------------------
  // CREATE BOOKLIST
  // -------------------------------------------------
  static createBookList(bookList) {
    if (!bookList.title || !bookList.title.trim()) {
      const error = new Error('The "title" field cannot be empty or just spaces.');
      error.statusCode = 400;
      throw error;
    }

    const fullUuid = uuid();

    const newBookList = {
      ...bookList,
      id: fullUuid.slice(0, 6),
      tracking: {
        uuid: fullUuid,
        createdDate: new Date().toISOString()
      }
    };

    const valid = validate(newBookList);
    if (!valid) {
      logger.warn('Validation error on creating a new book!', validate.errors);
      const error = new Error("Validation failed on creating book");
      error.statusCode = 400;
      error.details = validate.errors;
      throw error;
    }

    logger.debug('Service : createBookList');
    return BookListModel.createBookList(newBookList);
  }

  // -------------------------------------------------
  // UPDATE BOOKLIST (PATCH)
  // -------------------------------------------------
  static async updateBookList(id, bookList) {
    if (bookList.title !== undefined && !bookList.title.trim()) {
      const error = new Error('The "title" field cannot be empty or just spaces.');
      error.statusCode = 400;
      throw error;
    }

    const existingBookList = await BookListModel.getBookList(id);

    if (!existingBookList) {
      const error = new Error(`Book with ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    const updatedBookList = {
      ...existingBookList,
      ...bookList,
      id,
      tracking: {
        ...existingBookList.tracking,
        updatedDate: new Date().toISOString()
      },
    };

    const valid = validate(updatedBookList);
    if (!valid) {
      logger.warn('Validation error on updating a book!', validate.errors);
      const error = new Error("Validation failed on updating book");
      error.statusCode = 400;
      error.details = validate.errors;
      throw error;
    }

    logger.debug(`Service : updateBookList, id: ${id}`);
    return BookListModel.updateBookList(id, updatedBookList);
  }

  // -------------------------------------------------
  // REPLACE BOOKLIST (PUT)
  // -------------------------------------------------
  static async replaceBookList(id, bookList) {
    if (bookList.title !== undefined && !bookList.title.trim()) {
      const error = new Error('The "title" field cannot be empty or just spaces.');
      error.statusCode = 400;
      throw error;
    }

    const existingBookList = await BookListModel.getBookList(id);

    if (!existingBookList) {
      const error = new Error(`Book with ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    const replacedBookList = {
      ...existingBookList,
      ...bookList,
      id,
      tracking: {
        ...existingBookList.tracking,
        updatedDate: new Date().toISOString()
      }
    };

    const valid = validate(replacedBookList);
    if (!valid) {
      logger.warn('Validation error on replacing a book!', validate.errors);
      const error = new Error("Validation failed on replacing book");
      error.statusCode = 400;
      error.details = validate.errors;
      throw error;
    }

    logger.debug(`Service : replaceBookList, id: ${id}`);
    return BookListModel.replaceBookList(id, replacedBookList);
  }

  // -------------------------------------------------
  // DELETE BOOKLIST
  // -------------------------------------------------
  static async deleteBookList(id) {
    logger.debug(`Service : deleteBookList, id: ${id}`);

    const deleted = await BookListModel.deleteBookList(id);

    if (!deleted) {
      const err = new Error(`Book with id ${id} not found`);
      err.statusCode = 404;
      throw err;
    }

    return { success: true };
  }
  // -------------------------------------------------
  // ADD COMMENT (with field normalizing)
  // -------------------------------------------------
  static async addComment(id, comment) {
    const normalized = {};

    if (!comment || typeof comment !== "object") {
      const err = new Error("Comment must be an object");
      err.statusCode = 400;
      throw err;
    }

    // Normalize comment text
    if (comment.comment !== undefined) normalized.comment = comment.comment;
    else if (comment.text !== undefined) normalized.comment = comment.text;
    else if (comment.message !== undefined) normalized.comment = comment.message;

    // Normalize name
    if (comment.name !== undefined) normalized.name = comment.name;
    else if (comment.user !== undefined) normalized.name = comment.user;
    else if (comment.author !== undefined) normalized.name = comment.author;

    if (!normalized.comment || !String(normalized.comment).trim()) {
      const err = new Error("Comment cannot be empty.");
      err.statusCode = 400;
      throw err;
    }

    normalized.comment = String(normalized.comment).trim();
    if (normalized.name) normalized.name = String(normalized.name).trim();

    const existingBookList = await BookListModel.getBookList(id);

    if (!existingBookList) {
      const err = new Error(`Book with ${id} not found`);
      err.statusCode = 404;
      throw err;
    }

    const comments = existingBookList.comments || [];

    const newComment = {
      ...normalized,
      commentDate: new Date().toISOString(),
      commentId: uuid(),
    };

    const updatedBookList = {
      ...existingBookList,
      comments: [...comments, newComment],
      tracking: {
        ...existingBookList.tracking,
        updatedDate: new Date().toISOString(),
      },
    };

    const valid = validate(updatedBookList);
    if (!valid) {
      logger.warn("Validation error on adding comment!", validate.errors);
      const err = new Error("Validation failed when adding comment");
      err.statusCode = 400;
      err.details = validate.errors;
      throw err;
    }

    return BookListModel.updateBookList(id, updatedBookList);
  }

  // -------------------------------------------------
  // DELETE COMMENT
  // -------------------------------------------------
  static async deleteComment(bookId, commentId) {
    return await BookListModel.deleteComment(bookId, commentId);
  }

  // ============================================================
  // ISBN LOOKUP
  // ============================================================

  static async lookupBookByISBN(isbn) {
    logger.debug('Service : lookupBookByISBN');

    if (!isbn || !isbn.trim()) {
      const error = new Error('ISBN is required');
      error.statusCode = 400;
      throw error;
    }

    const normalizedIsbn = isbn.replace(/[-\s]/g, '');

    if (!/^\d{10}(\d{3})?$/.test(normalizedIsbn)) {
      const error = new Error('Invalid ISBN format');
      error.statusCode = 400;
      throw error;
    }

    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${normalizedIsbn}`;

    const response = await fetch(url);

    if (!response.ok) {
      const error = new Error('Failed to reach Google Books API');
      error.statusCode = 502;
      throw error;
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      const error = new Error('No book found for this ISBN');
      error.statusCode = 404;
      throw error;
    }

    const volumeInfo = data.items[0].volumeInfo;

    let author_first_name = '';
    let author_last_name = '';

    if (volumeInfo.authors && volumeInfo.authors.length > 0) {
      const parts = volumeInfo.authors[0].split(' ');
      author_first_name = parts.slice(0, -1).join(' ');
      author_last_name = parts.slice(-1).join('');
    }

    return {
      isbn: normalizedIsbn,
      title: volumeInfo.title || '',
      author_first_name,
      author_last_name,
      publication_year: volumeInfo.publishedDate
        ? parseInt(volumeInfo.publishedDate.slice(0, 4), 10)
        : null,
      series_name: '',
      imagePath:
        volumeInfo.imageLinks?.thumbnail
          || `https://covers.openlibrary.org/b/isbn/${normalizedIsbn}-L.jpg`
    };
  }
}


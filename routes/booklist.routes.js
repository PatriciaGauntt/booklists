import express from 'express';

import { BookListController } from '../controllers/booklist.controller.js';

export const bookListRouter = express.Router();

bookListRouter.get('/', BookListController.getBookLists);
bookListRouter.get('/:id', BookListController.getBookList);
bookListRouter.post('/', BookListController.createBookList);
bookListRouter.put('/:id', BookListController.replaceBookList);
bookListRouter.patch('/:id', BookListController.updateBookList);
bookListRouter.delete('/:id', BookListController.deleteBookList);
bookListRouter.post('/:id/comments', BookListController.addComment);
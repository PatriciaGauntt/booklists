import { Constants } from '../lib/constants.js';
import { logger } from '../lib/logger.js';
import { mongo } from '../lib/mongo.js';

export class BookListModel {

  static getCollection() {
    const db = mongo.getDb();
    const collection = db.collection(Constants.BOOKLIST_COLLECTIONS);

    // Ensure uniqueness of book id
    collection.createIndex({ id: 1 }, { unique: true }).catch(console.error);

    // Index ISBN
    collection.createIndex({ isbn: 1 }).catch(console.error);

    return collection;
  }

  // ============================================================
  // GET MANY
  // ============================================================
  static getBookLists(searchTerm, skip, limit) {
    logger.debug(`BookListModel : getBookLists(${searchTerm})`);

    const regexMatch = new RegExp(searchTerm, 'i');
    const regexSearch = {
      $or: [
        { title: regexMatch },
        { author_first_name: regexMatch },
        { author_last_name: regexMatch },
        { series_name: regexMatch },
      ]
    };

    return this.getCollection()
      .find(searchTerm ? regexSearch : {}, { projection: { _id: 0 } })
      .skip(skip)
      .limit(limit);
  }

  // ============================================================
  // GET ONE
  // ============================================================
  static getBookList(id) {
    logger.debug(`Model : getBookList, id: ${id}`);
    return this.getCollection().findOne({ id }, { projection: { _id: 0 } });
  }

  // ============================================================
  // CREATE
  // ============================================================
  static async createBookList(bookList) {
    logger.debug('Model : createBookList');
    const collection = this.getCollection();

    // Ensure comments always exists (optional but convenient)
    if (!bookList.comments) bookList.comments = [];

    await collection.insertOne(bookList);
    delete bookList._id;

    return bookList;
  }

  // ============================================================
  // PATCH — Partial Update
  // ============================================================
  static async updateBookList(id, bookList) {
    logger.debug(`Model : updateBookList, id: ${id}`);

    const updateStatement = { $set: {} };

    // Allow updating any field EXCEPT id
    Object.keys(bookList).forEach((key) => {
      if (key !== 'id') {
        updateStatement.$set[key] = bookList[key];
      }
    });

    const result = await this.getCollection().findOneAndUpdate(
      { id },
      updateStatement,
      {
        returnDocument: 'after',
        projection: { _id: 0 }
      }
    );

    return result.value;
  }

  // ============================================================
  // PUT — Replace 
  // ============================================================
  static async replaceBookList(id, bookList) {
    logger.debug(`Model : replaceBookList, id: ${id}`);

    const collection = this.getCollection();

    // Force the id to match the route id
    bookList.id = id;

    // Ensure the comments property always exists
    if (!bookList.comments) {
      bookList.comments = [];
    }

    const result = await collection.findOneAndReplace(
      { id },
      bookList,
      {
        returnDocument: 'after',
        projection: { _id: 0 }
      }
    );

    return result.value;
  }

  // ============================================================
  // DELETE
  // ============================================================
  static async deleteBookList(id) {
    logger.debug(`Model : deleteBookList, id: ${id}`);
  
    const collection = this.getCollection();
    const result = await collection.deleteOne({ id });

    // Return true/false instead of full document
    return result.deletedCount > 0;
  }

  // ============================================================
  // ADD COMMENT
  // ============================================================
  static async addComment(id, comment) {
    const result = await this.getCollection().findOneAndUpdate(
      { id },
      { $push: { comments: comment } },
      {
        returnDocument: 'after',
        projection: { _id: 0 }
      }
    );

    return result.value;
  }

  // ============================================================
  // DELETE COMMENT
  // ============================================================
  static async deleteComment(bookId, commentId) {
    const result = await this.getCollection().updateOne(
      { id: bookId },
      { $pull: { comments: { commentId: commentId } } }
    );

    return result.modifiedCount > 0;
  }
}

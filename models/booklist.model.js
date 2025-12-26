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

    Object.keys(bookList).forEach((key) => {
      if (key !== 'id') {
        updateStatement.$set[key] = bookList[key];
      }
    });


    if (Object.keys(updateStatement.$set).length === 0) {
      return null;
    }

    const result = await this.getCollection().findOneAndUpdate(
      { id },
      updateStatement,
      {
        returnDocument: 'after',
        projection: { _id: 0 }
      }
    );


    return result; 
}

  // ============================================================
  // PUT — Replace 
  // ============================================================

static async replaceBookList(id, bookList) {
  logger.debug(`Model : replaceBookList, id: ${id}`);

  bookList.id = id;
  if (!bookList.comments) bookList.comments = [];

  const result = await this.getCollection().findOneAndReplace(
    { id },
    bookList,
    {
      returnDocument: 'after',
      projection: { _id: 0 }
    }
  );

  return result;
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

    return result;
  }


  // ============================================================
  // DELETE COMMENT
  // ============================================================
  static async deleteComment(bookId, commentId) {
    const collection = this.getCollection();

    const book = await collection.findOne({ id: bookId });
    if (!book || !book.comments) return null;

    const exists = book.comments.some(c => c.commentId === commentId);
    if (!exists) return null;

    const result = await collection.updateOne(
      { id: bookId },
      { $pull: { comments: { commentId } } }
    );

    return result.modifiedCount > 0;
  }
  // -------------------------------------------------
  // CHECK FOR DUPLICATES (title + author_last_name)
  // -------------------------------------------------
  static async findPotentialDuplicates(title, author_last_name) {
    if (!title || !author_last_name) return [];

   return BookListModel.getCollection()
      .find(
        {
          title: { $regex: `^${title}$`, $options: 'i' },
          author_last_name: { $regex: `^${author_last_name}$`, $options: 'i' }
        },
        { projection: { _id: 0, id: 1, title: 1, author_last_name: 1, isbn: 1 } }
      )
      .toArray();
  }

// ============================================================
// TEST-COMPATIBILITY WRAPPERS
// ============================================================

// insertOne → createBookList
static async insertOne(book) {
  return this.createBookList(book);
}

// findAll → getBookLists
static async findAll() {
  const cursor = await this.getBookLists(null, 0, 1000);
  return cursor.toArray();
}

// findOne → getBookList
static async findOne(id) {
  return this.getBookList(id);
}

// updateOne → updateBookList
static async updateOne(id, patch) {
  return this.updateBookList(id, patch);
}

// replaceOne → replaceBookList
static async replaceOne(id, book) {
  return this.replaceBookList(id, book);
}

// deleteOne → deleteBookList
static async deleteOne(id) {
  return this.deleteBookList(id);
}

}

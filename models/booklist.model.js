import { Constants } from '../lib/constants.js';
import { logger } from '../lib/logger.js';
import { mongo } from '../lib/mongo.js';

export class BookListModel {
  static getCollection() {
    const db = mongo.getDb();
    const collection = db.collection(Constants.BOOKLIST_COLLECTIONS);

    collection.createIndex({ id: 1 }, { unique: true }).catch(console.error);

    return collection;
  }

  static getBookLists() {
    logger.debug('BookListModel : getBookLists()');
    return this.getCollection().find({}, {
      projection: { _id: 0 },
    });
  }

  static getBookList(id) {
    logger.debug(`Model : getBookList, id: ${id}`);
    return this.getCollection().findOne({ id }, {
      projection: { _id: 0 },
    });
  }

  static async createBookList(bookList) {
    logger.debug('Model : createBookList');
    const collection = this.getCollection();
    await collection.insertOne(bookList);
    delete bookList._id;
    return bookList;
  }

  static async updateBookList(id, bookList) {
    logger.debug(`Model : updateBookList, id: ${id}`);
    const updateStatement = { $set: {} };

    Object.keys(bookList).forEach((key) => {
      if (key === 'id') return;
      updateStatement.$set[key] = bookList[key];
    });

    const collection = this.getCollection();
    const result = await collection.updateOne({ id }, updateStatement, { returnDocument: 'after' });
    delete result._id;
    return result;
  }

  static async replaceBookList(id, bookList) {
    logger.debug(`Model : replacebookList, id: ${id}`);
    const collection = this.getCollection();
    const result = await collection.replaceOne({ id }, bookList);

    if (!result.modifiedCount) {
      return false;
    }
    delete result._id;
    return result;
  }

  static async deleteBookList(id) {
    logger.debug(`Model : deleteBookList, id: ${id}`);
    const collection = this.getCollection();
    const result = await collection.deleteOne({ id });

    return result.deletedCount > 0;
  }
}

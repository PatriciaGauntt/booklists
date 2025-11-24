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

    return this.getCollection().find(
      searchTerm ? regexSearch : {}, {
      projection: { _id: 0 },
    })
    .skip(skip).limit(limit);
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
    const result = await collection.findOneAndUpdate(
      { id },
      updateStatement,
      { returnDocument: 'after', projection: { _id: 0 } },
    );

    return result.value;
  }

  static async replaceBookList(id, bookList) {
    logger.debug(`Model : replacebookList, id: ${id}`);
    const collection = this.getCollection();
    const result = await collection.findOneAndReplace(
      { id },
      bookList,
      { returnDocument: 'after', projection: { _id: 0 } },
    );

    return result.value;
  }

  static async deleteBookList(id) {
    logger.debug(`Model : deleteBookList, id: ${id}`);
    const collection = this.getCollection();
    const result = await collection.findOneAndDelete({ id });
    return result.value;
  }
static async addComment(id, comment) {
  const collection = this.getCollection();

  const result = await collection.findOneAndUpdate(
    { id },
    {
      $push: { comments: comment }  // Append comment to array
    },
    {
      returnDocument: 'after',
      projection: { _id: 0 }
    }
  );

  return result.value;
}
}

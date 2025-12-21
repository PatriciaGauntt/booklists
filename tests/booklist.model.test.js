import { MongoMemoryServer } from "mongodb-memory-server";
import { mongo } from "../lib/mongo.js";
import { BookListModel } from "../models/booklist.model.js";
import { Constants } from "../lib/constants.js";

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongo.init(uri, "testdb", {});
});

afterEach(async () => {
  const db = mongo.getDb();
  const collections = await db.listCollections().toArray();
  for (const { name } of collections) {
    await db.collection(name).deleteMany({});
  }
});

afterAll(async () => {
  await mongod.stop();
});

describe("BookListModel", () => {
const sample = {
  id: "123",
  title: "Test Book",
  author_first_name: "Someone",
  author_last_name: "Tester",
  publication_year: 2024,
  location: "Living Room",
  comments: [],
};

  test("insertOne: inserts a book", async () => {
    const created = await BookListModel.createBookList(sample);
    expect(created.id).toBe("123");

    const db = mongo.getDb();
    const found = await db
      .collection(Constants.BOOKLIST_COLLECTIONS)
      .findOne({ id: "123" });

    expect(found).not.toBeNull();
    expect(found.title).toBe("Test Book");
  });

  test("findAll: returns a list", async () => {
    await BookListModel.createBookList(sample);
    const all = await BookListModel.findAll();

    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBe(1);
    expect(all[0].title).toBe("Test Book");
  });

  test("findOne: returns single book", async () => {
    await BookListModel.createBookList(sample);
    const book = await BookListModel.getBookList("123");

    expect(book).not.toBeNull();
    expect(book.author_first_name).toBe("Someone");
    expect(book.author_last_name).toBe("Tester");
  });

  test("findOne: returns null when not found", async () => {
    const result = await BookListModel.findOne("BAD-ID");
    expect(result).toBeNull();
  });

  test("updateOne: updates book data", async () => {
    await BookListModel.createBookList(sample);

      const updated = await BookListModel.updateBookList("123", { title: "New Title" });
    
      expect(updated.title).toBe("New Title");

    const book = await BookListModel.getBookList("123");
    expect(book.title).toBe("New Title");
  });

  test("updateOne: returns null when ID not found", async () => {
    const updated = await BookListModel.updateOne("missing", { title: "X" });
    expect(updated).toBeNull();
  });

test("replaceOne: replaces book entirely", async () => {
  await BookListModel.createBookList({
  id: "123",
  title: "Replaced",
  author_first_name: "Old",
  author_last_name: "Author",
  publication_year: 2025,
  location: "Office",
  });

const replacement = {
  id: "123",
  title: "Replaced",
  author_first_name: "New",
  author_last_name: "Author",
  publication_year: 2025,
  location: "Office",
};

  const replaced = await BookListModel.replaceBookList("123", replacement);

  expect(replaced.title).toBe("Replaced");
});

  test("replaceOne: returns null when not found", async () => {
    const result = await BookListModel.replaceBookList("nope", sample);
    expect(result).toBeNull();
  });

  test("deleteOne: deletes a book", async () => {
  await BookListModel.createBookList({ id: "123", title: "Delete Me" });

  const deleted = await BookListModel.deleteBookList("123");
  expect(deleted).not.toBeNull();

  const book = await BookListModel.getBookList("123");
  expect(book).toBeNull();
});

  test("deleteOne: returns false when not found", async () => {
    const deleted = await BookListModel.deleteOne("missing");
    expect(deleted).toBe(false);
  });

  test("addComment: adds a comment to a book", async () => {
  await BookListModel.createBookList({
    id: "123",
    title: "Comment book",
    comments: [],
  });

  const updated = await BookListModel.addComment("123", {
    commentId: 1,
    text: "Nice",
  });

  expect(updated.comments.length).toBe(1);
  expect(updated.comments[0].text).toBe("Nice");
});

  test("addComment: returns null when book missing", async () => {
    const updated = await BookListModel.addComment("BAD", {
      text: "Fail"
    });
    expect(updated).toBeNull();
  });

  test("deleteComment: removes a comment", async () => {
  await BookListModel.createBookList({
    id: "123",
    title: "Test",
    comments: [
      { commentId: 0, text: "A" },
      { commentId: 1, text: "B" },
    ],
  });

  const success = await BookListModel.deleteComment("123", 0);
  expect(success).toBe(true);

  const book = await BookListModel.getBookList("123");
  expect(book.comments.length).toBe(1);
  expect(book.comments[0].text).toBe("B");
});

  test("deleteComment: returns null if comment or book missing", async () => {
    await BookListModel.createBookList(sample);

    const bad1 = await BookListModel.deleteComment("missing", 0);
    const bad2 = await BookListModel.deleteComment("123", 999);

    expect(bad1).toBeNull();
    expect(bad2).toBeNull();
  });
});

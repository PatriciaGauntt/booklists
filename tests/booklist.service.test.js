import { jest } from "@jest/globals";

/* -------------------------------------------------
   GLOBAL FETCH MOCK (for ISBN lookup)
------------------------------------------------- */
global.fetch = jest.fn();

jest.unstable_mockModule("../models/booklist.model.js", () => ({
  BookListModel: {
    getBookList: jest.fn(),
    getBookLists: jest.fn(),
    createBookList: jest.fn(),
    updateBookList: jest.fn(),
    replaceBookList: jest.fn(),
    deleteBookList: jest.fn(),
    deleteComment: jest.fn(),

    // REQUIRED for findPotentialDuplicates
    getCollection: jest.fn(() => ({
      find: jest.fn(() => ({
        toArray: jest.fn().mockResolvedValue([]),
      })),
    })),
  },
}));

const { BookListService } = await import("../services/booklist.service.js");
const { BookListModel } = await import("../models/booklist.model.js");

/* -------------------------------------------------
   SHARED MOCK DATA
------------------------------------------------- */
const mockBook = {
  id: "abc123",
  title: "Test Book",
  author_first_name: "John",
  author_last_name: "Doe",
  publication_year: 1999,
  location: "Shelf A",
  bookcase: 1,
  series_name: "Series",
  imagePath: "/img/test.jpg",
  comments: [],
  isPotentialDuplicate: false,
  tracking: {
    uuid: "11111111-1111-1111-1111-111111111111",
    createdDate: "2024-01-01T00:00:00.000Z",
    updatedDate: "2024-01-01T00:00:00.000Z",
  },
};

/* =================================================
   BOOK LIST SERVICE TESTS
================================================= */
describe("BookListService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* -------------------------------------------------
     CREATE
  ------------------------------------------------- */
  describe("createBookList", () => {
    it("creates a new book with valid data", async () => {
      BookListModel.createBookList.mockResolvedValue({
        ...mockBook,
        id: "123456",
      });

      const result = await BookListService.createBookList({
        title: "New Book",
        author_first_name: "Test",
        author_last_name: "Author",
        publication_year: 2000,
        location: "Shelf A",
      });



      expect(BookListModel.createBookList).toHaveBeenCalled();
      expect(result.book).toMatchObject({
        id: "123456",
        title: "Test Book",
      });
    });

    it("throws 400 when schema validation fails on create", async () => {
      await expect(
        BookListService.createBookList({
          title: "Valid Title",
          publication_year: "not-a-number" // schema violation
        })
      ).rejects.toHaveProperty("statusCode", 400);
    });
  });

  /* -------------------------------------------------
     UPDATE
  ------------------------------------------------- */
  describe("updateBookList", () => {
    it("updates a book", async () => {
      BookListModel.getBookList.mockResolvedValue(mockBook);
      BookListModel.updateBookList.mockResolvedValue({
        ...mockBook,
        title: "Updated",
      });

      const result = await BookListService.updateBookList("abc123", {
        title: "Updated",
      });

      expect(result.title).toBe("Updated");
    });

    it("throws if book not found", async () => {
      BookListModel.getBookList.mockResolvedValue(null);

      await expect(
        BookListService.updateBookList("missing", { title: "x" })
      ).rejects.toThrow("not found");
    });

    it("throws 400 when schema validation fails on update", async () => {
      BookListModel.getBookList.mockResolvedValue(mockBook);

      await expect(
        BookListService.updateBookList("abc123", {
          publication_year: "bad"
        })
      ).rejects.toHaveProperty("statusCode", 400);
    });

    it("throws if title empty", async () => {
      BookListModel.getBookList.mockResolvedValue(mockBook);

      await expect(
        BookListService.updateBookList("abc123", { title: " " })
      ).rejects.toHaveProperty("statusCode", 400);
    });
  });

  /* -------------------------------------------------
     REPLACE
  ------------------------------------------------- */
  describe("replaceBookList", () => {
    it("replaces a book", async () => {
      BookListModel.getBookList.mockResolvedValue(mockBook);
      BookListModel.replaceBookList.mockResolvedValue({
        ...mockBook,
        title: "Replaced",
      });

      const result = await BookListService.replaceBookList("abc123", {
        title: "Replaced",
      });

      expect(result.title).toBe("Replaced");
    });

    it("throws 400 when schema validation fails on replace", async () => {
      BookListModel.getBookList.mockResolvedValue(mockBook);

      await expect(
        BookListService.replaceBookList("abc123", {
        publication_year: "bad"
        })
      ).rejects.toHaveProperty("statusCode", 400);
    });    

    it("throws if title empty", async () => {
      BookListModel.getBookList.mockResolvedValue(mockBook);

      await expect(
        BookListService.replaceBookList("abc123", { title: "" })
      ).rejects.toHaveProperty("statusCode", 400);
    });

    it("throws if book not found", async () => {
      BookListModel.getBookList.mockResolvedValue(null);

      await expect(
        BookListService.replaceBookList("abc123", { title: "x" })
      ).rejects.toThrow("not found");
    });
  });

  /* -------------------------------------------------
     ADD COMMENT
  ------------------------------------------------- */
  describe("addComment", () => {
    it("adds a comment", async () => {
      BookListModel.getBookList.mockResolvedValue(mockBook);
      BookListModel.updateBookList.mockResolvedValue({
        ...mockBook,
        comments: [
          {
            name: "Patricia",
            comment: "Nice!",
            commentDate: "2024-03-01T00:00:00.000Z",
            commentId: "cid1",
          },
        ],
      });

      const result = await BookListService.addComment("abc123", {
        name: "Patricia",
        comment: "Nice!",
      });

      expect(result.comments.length).toBe(1);
    });

    it("throws 400 when updated book fails schema validation after comment", async () => {
      BookListModel.getBookList.mockResolvedValue({
        ...mockBook,
        publication_year: "bad" // already invalid
      });

      await expect(
        BookListService.addComment("abc123", {
          comment: "Nice book"
        })
      ).rejects.toHaveProperty("statusCode", 400);
    });

    it("throws for invalid comment", async () => {
      BookListModel.getBookList.mockResolvedValue(mockBook);

      await expect(
        BookListService.addComment("abc123", { text: "" })
      ).rejects.toThrow("Comment");
    });

    it("throws if book not found", async () => {
      BookListModel.getBookList.mockResolvedValue(null);

      await expect(
        BookListService.addComment("abc123", { text: "ok" })
      ).rejects.toThrow("not found");
    });
  });

  /* -------------------------------------------------
   GET ALL
------------------------------------------------- */
describe("getBookLists", () => {
  it("returns an array of books", async () => {
    const mockCursor = {
      toArray: jest.fn().mockResolvedValue([
        { ...mockBook },
        { ...mockBook, id: "def456", title: "Another Book" },
      ]),
    };

    BookListModel.getBookLists.mockReturnValue(mockCursor);

    const result = await BookListService.getBookLists("test", 0, 10);

    expect(BookListModel.getBookLists).toHaveBeenCalledWith("test", 0, 10);
    expect(mockCursor.toArray).toHaveBeenCalled();
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Test Book");
  });

  it("returns an empty array when no books found", async () => {
    const mockCursor = {
      toArray: jest.fn().mockResolvedValue([]),
    };

    BookListModel.getBookLists.mockReturnValue(mockCursor);

    const result = await BookListService.getBookLists("", 0, 10);

    expect(result).toEqual([]);
  });
});


  /* -------------------------------------------------
     GET ONE
  ------------------------------------------------- */
  describe("getBookList", () => {
    it("returns a book by ID", async () => {
      BookListModel.getBookList.mockResolvedValue(mockBook);

      const result = await BookListService.getBookList("abc123");

      expect(result).toEqual({
        ...mockBook,
        isPotentialDuplicate: false,
      });
    });

    it("returns null when book not found", async () => {
      BookListModel.getBookList.mockResolvedValue(null);

      const result = await BookListService.getBookList("missing");

      expect(result).toBeNull();
    });
  });

    /* -------------------------------------------------
     GET COMMENTS
  ------------------------------------------------- */

  describe("getComments", () => {
    it("returns comments array", async () => {
      BookListModel.getBookList.mockResolvedValue({
        ...mockBook,
        comments: [{ commentId: "1", text: "Great!" }],
      });

      const result = await BookListService.getComments("abc123");

      expect(result.length).toBe(1);
    });

    it("throws if book not found", async () => {
      BookListModel.getBookList.mockResolvedValue(null);

      await expect(
        BookListService.getComments("missing")
      ).rejects.toHaveProperty("statusCode", 404);
    });
  });

  /* -------------------------------------------------
     DELETE
  ------------------------------------------------- */
describe("deleteBookList", () => {
  it("deletes a book", async () => {
    BookListModel.getBookList.mockResolvedValue(mockBook); 
    BookListModel.deleteBookList.mockResolvedValue(true);

    const result = await BookListService.deleteBookList("abc123");

    expect(result).toEqual({ deleted: true });
  });

  it("skips duplicate recompute when title or author missing", async () => {
    BookListModel.getBookList.mockResolvedValue({
      ...mockBook,
      author_last_name: null
    });

    BookListModel.deleteBookList.mockResolvedValue(true);

    const result = await BookListService.deleteBookList("abc123");

    expect(BookListModel.updateBookList).not.toHaveBeenCalled();
    expect(result).toEqual({ deleted: true });
  });

  it("recomputes isPotentialDuplicate for remaining books", async () => {
  const deletedBook = {
    ...mockBook,
    title: "Same Title",
    author_last_name: "Doe",
  };

  const remainingBooks = [
    { id: "b1", title: "Same Title", author_last_name: "Doe" },
    { id: "b2", title: "Same Title", author_last_name: "Doe" },
  ];

  BookListModel.getBookList.mockResolvedValue(deletedBook);
  BookListModel.deleteBookList.mockResolvedValue(true);


  BookListService.findPotentialDuplicates = jest
    .fn()
    .mockResolvedValueOnce(remainingBooks) // after delete
    .mockResolvedValueOnce([remainingBooks[1]]) // b1 has duplicate
    .mockResolvedValueOnce([]); // b2 has no duplicates

  BookListModel.updateBookList.mockResolvedValue(true);

  const result = await BookListService.deleteBookList("abc123");

  expect(BookListModel.updateBookList).toHaveBeenCalledTimes(2);
  expect(BookListModel.updateBookList).toHaveBeenCalledWith("b1", {
    isPotentialDuplicate: true,
  });
  expect(BookListModel.updateBookList).toHaveBeenCalledWith("b2", {
    isPotentialDuplicate: false,
  });

  expect(result).toEqual({ deleted: true });
});


  it("throws if book not found", async () => {
    BookListModel.getBookList.mockResolvedValue(null); // ✅ THIS is what triggers 404

    await expect(
      BookListService.deleteBookList("bad-id")
    ).rejects.toHaveProperty("statusCode", 404);
  });
});

  /* -------------------------------------------------
     DELETE COMMENT
  ------------------------------------------------- */

  describe("deleteComment", () => {
    it("deletes a comment", async () => {
      BookListModel.deleteComment.mockResolvedValue({ deleted: true });

      const result = await BookListService.deleteComment("abc123", "cid1");

      expect(result).toEqual({ deleted: true });
    });
  });

  /* -------------------------------------------------
     ISBN LOOKUP
  ------------------------------------------------- */
  describe("lookupBookByISBN", () => {
    it("returns book data for valid ISBN", async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
              volumeInfo: {
                title: "Test Book",
                authors: ["Jane Doe"],
                publishedDate: "2020",
                imageLinks: { thumbnail: "img.jpg" },
              },
            },
          ],
        }),
      });

      const book = await BookListService.lookupBookByISBN("1234567890");

      expect(book.title).toBe("Test Book");
      expect(book.author_first_name).toBe("Jane");
      expect(book.author_last_name).toBe("Doe");
    });

    it("throws for invalid ISBN", async () => {
      await expect(
        BookListService.lookupBookByISBN("bad")
      ).rejects.toHaveProperty("statusCode", 400);
    });

    it("throws 502 when Google Books API responds with error", async () => {
      fetch.mockResolvedValue({ ok: false });

      await expect(
        BookListService.lookupBookByISBN("1234567890")
      ).rejects.toHaveProperty("statusCode", 502);
    });

    it("throws when no book found", async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }),
      });

      await expect(
        BookListService.lookupBookByISBN("1234567890")
      ).rejects.toHaveProperty("statusCode", 404);
    });
  });

  /* -------------------------------------------------
     GLOBAL TEARDOWN (FIX 3)
  ------------------------------------------------- */
  afterAll(() => {
    jest.restoreAllMocks();
  });
});

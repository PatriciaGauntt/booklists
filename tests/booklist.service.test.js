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
     GET
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
      BookListModel.deleteBookList.mockResolvedValue(true);

      const result = await BookListService.deleteBookList("abc123");

      expect(result).toEqual({ deleted: true });
    });

    it("throws if book not found", async () => {
      BookListModel.deleteBookList.mockResolvedValue(false);

      await expect(
        BookListService.deleteBookList("bad-id")
      ).rejects.toHaveProperty("statusCode", 404);
    });
  });

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

import { jest } from "@jest/globals";

// ---------------- MOCK THE MODEL ----------------
jest.unstable_mockModule("../models/booklist.model.js", () => ({
  BookListModel: {
    getBookList: jest.fn(),
    getBookLists: jest.fn(),
    createBookList: jest.fn(),
    updateBookList: jest.fn(),
    replaceBookList: jest.fn(),
    deleteBookList: jest.fn(),
    deleteComment: jest.fn(),
  },
}));

const { BookListService } = await import("../services/booklist.service.js");
const { BookListModel } = await import("../models/booklist.model.js");

// ---------------- SHARED MOCK DATA ----------------
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
    updatedDate: "2024-01-01T00:00:00.000Z"
  }
};
// =====================================================================
// CREATE
// =====================================================================
describe("BookListService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
  expect(result.id).toBe("123456");
});

    it("throws when title is blank", () => {
      expect(() =>
        BookListService.createBookList({ title: "  " })
      ).toThrow('title');
    });
  });

  // =====================================================================
  // UPDATE
  // =====================================================================
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

      expect(BookListModel.updateBookList).toHaveBeenCalled();
      expect(result.title).toBe("Updated");
    });

    it("throws if book not found", async () => {
      BookListModel.getBookList.mockResolvedValue(null);

      await expect(
        BookListService.updateBookList("missing", { title: "x" })
      ).rejects.toThrow("not found");
    });

    it("throws if title empty", async () => {
      await expect(
        BookListService.updateBookList("abc123", { title: " " })
      ).rejects.toThrow("title");
    });
  });

  // =====================================================================
  // REPLACE
  // =====================================================================
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
      await expect(
        BookListService.replaceBookList("abc123", { title: "" })
      ).rejects.toThrow("title");
    });

    it("throws if book not found", async () => {
      BookListModel.getBookList.mockResolvedValue(null);

      await expect(
        BookListService.replaceBookList("abc123", { title: "x" })
      ).rejects.toThrow("not found");
    });
  });

  // =====================================================================
  // ADD COMMENT
  // =====================================================================
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
            commentId: "33333333-3333-3333-3333-333333333333"
          }
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
  it("throws a validation error when AJV validation fails on updatedBookList", async () => {
  // Mock the existing book so that adding a comment will produce INVALID schema
  BookListModel.getBookList.mockResolvedValue({
    id: "abc123",
    title: "Bad Book",
    author_first_name: "John",
    author_last_name: "Doe",
    publication_year: 1999,
    series_name: "Series",
    location: "Shelf A",
    bookcase: 1,
    tracking: { uuid: "u1", createdDate: "2024-01-01T00:00:00.000Z" },

    // INVALID comments structure — AJV will reject this
    comments: [
      { randomField: "invalid!" } // guaranteed to fail schema
    ]
  });

  // Prevent updateBookList from being called
  BookListModel.updateBookList.mockResolvedValue(null);

  const badComment = { text: "Should fail" };

  await expect(
    BookListService.addComment("abc123", badComment)
  ).rejects.toThrow("Validation failed when adding comment");
});

  // =====================================================================
  // GET 
  // =====================================================================
  describe("getBookLists", () => {
  it("returns a list of books", async () => {
    BookListModel.getBookLists.mockResolvedValue([mockBook]);

    const result = await BookListService.getBookLists("Test", 0, 10);

    expect(BookListModel.getBookLists).toHaveBeenCalledWith("Test", 0, 10);
    expect(result).toEqual([mockBook]);
    });
  });
  describe("getBookList", () => {
  it("returns a book by ID", async () => {
    BookListModel.getBookList.mockResolvedValue(mockBook);

    const result = await BookListService.getBookList("abc123");

    expect(BookListModel.getBookList).toHaveBeenCalledWith("abc123");
    expect(result).toEqual(mockBook);
  });
  });
  it("returns null when book not found", async () => {
    BookListModel.getBookList.mockResolvedValue(null);

    const result = await BookListService.getBookList("missing");

    expect(result).toBeNull();
  });
  describe("getComments", () => {
   it("returns comments array for an existing book", async () => {
    BookListModel.getBookList.mockResolvedValue({
      ...mockBook,
      comments: [
        { 
          commentId: "1", 
          user: "Patricia",      // updated field
          text: "Great!",        // updated field
          commentDate: "2024-01-01" 
        }
      ]
    });

    const result = await BookListService.getComments("abc123");

    expect(BookListModel.getBookList).toHaveBeenCalledWith("abc123");
    expect(result.length).toBe(1);
    expect(result[0].text).toBe("Great!");  // updated field
    });

    it("throws if book not found", async () => {
      BookListModel.getBookList.mockResolvedValue(null);

      await expect(
       BookListService.getComments("missing")
      ).rejects.toThrow("not found");
    });
  });

  // =====================================================================
  // DELETE 
  // =====================================================================
  describe("deleteBookList", () => {
    it("deletes a book by ID", async () => {
      BookListModel.deleteBookList.mockResolvedValue({ deleted: true });

      const result = await BookListService.deleteBookList("abc123");

      expect(BookListModel.deleteBookList).toHaveBeenCalledWith("abc123");
      expect(result).toEqual({ deleted: true });
    });
  });
  describe("deleteComment", () => {
    it("deletes a comment from a book", async () => {
      BookListModel.deleteComment.mockResolvedValue({ deleted: true });

      const result = await BookListService.deleteComment("abc123", "comment123");

      expect(BookListModel.deleteComment).toHaveBeenCalledWith("abc123", "comment123");
      expect(result).toEqual({ deleted: true });
    });
  });
});
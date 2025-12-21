import { jest } from "@jest/globals";

// -------------------------------------------------
// MOCK MODEL (ESM-safe)
// -------------------------------------------------
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

// IMPORT AFTER MOCKING
const { BookListService } = await import("../services/booklist.service.js");
const { BookListModel } = await import("../models/booklist.model.js");

// -------------------------------------------------
// TESTS
// -------------------------------------------------
describe("BookListService coverage boost", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------
  // CREATE
  // -------------------------------------------------
  test("createBookList throws 400 when title is empty", () => {
    expect(() =>
      BookListService.createBookList({ title: "   " })
    ).toThrow(/title/i);
  });

  // -------------------------------------------------
  // UPDATE — validation failure
  // -------------------------------------------------
  test("updateBookList throws 400 on validation failure", async () => {
    BookListModel.getBookList.mockResolvedValue({
      id: "123",
      title: "Valid Title",
      comments: [],
      tracking: {},
    });

    await expect(
      BookListService.updateBookList("123", { title: "" })
    ).rejects.toHaveProperty("statusCode", 400);
  });

  // -------------------------------------------------
  // GET COMMENTS — not found
  // -------------------------------------------------
  test("getComments throws 404 when book not found", async () => {
    BookListModel.getBookList.mockResolvedValue(null);

    await expect(
      BookListService.getComments("missing-id")
    ).rejects.toHaveProperty("statusCode", 404);
  });

  // -------------------------------------------------
  // ISBN — invalid format
  // -------------------------------------------------
  test("lookupBookByISBN throws 400 for invalid ISBN format", async () => {
    await expect(
      BookListService.lookupBookByISBN("BADISBN")
    ).rejects.toHaveProperty("statusCode", 400);
  });
});


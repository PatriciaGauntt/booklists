import { jest } from "@jest/globals";

// -------------------------------------------------
// MOCK SERVICE (ESM-SAFE)
// -------------------------------------------------
jest.unstable_mockModule("../services/booklist.service.js", () => ({
  BookListService: {
    lookupBookByISBN: jest.fn(),
  },
}));

// IMPORTANT: dynamic imports AFTER mock
const { BookListController } = await import(
  "../controllers/booklist.controller.js"
);
const { BookListService } = await import(
  "../services/booklist.service.js"
);

describe("BookListController.lookupBookByISBN", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { isbn: "1234567890" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  // -------------------------------------------------
  // SUCCESS
  // -------------------------------------------------
  test("returns 200 with book data on success", async () => {
    BookListService.lookupBookByISBN.mockResolvedValue({
      title: "Test Book",
      author_first_name: "Jane",
      author_last_name: "Doe",
    });

    await BookListController.lookupBookByISBN(req, res);

    expect(BookListService.lookupBookByISBN)
      .toHaveBeenCalledWith("1234567890");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Test Book" })
    );
  });

  // -------------------------------------------------
  // 400 ERROR
  // -------------------------------------------------
  test("returns 400 when service throws validation error", async () => {
    const err = new Error("Invalid ISBN");
    err.statusCode = 400;

    BookListService.lookupBookByISBN.mockRejectedValue(err);

    await BookListController.lookupBookByISBN(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid ISBN" });
  });

  // -------------------------------------------------
  // 404 ERROR
  // -------------------------------------------------
  test("returns 404 when book not found", async () => {
    const err = new Error("No book found");
    err.statusCode = 404;

    BookListService.lookupBookByISBN.mockRejectedValue(err);

    await BookListController.lookupBookByISBN(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No book found" });
  });

  // -------------------------------------------------
  // 500 FALLBACK
  // -------------------------------------------------
  test("returns 500 when service throws without statusCode", async () => {
    BookListService.lookupBookByISBN.mockRejectedValue(
      new Error("Unexpected failure")
    );

    await BookListController.lookupBookByISBN(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unexpected failure",
    });
  });
});

import { jest } from "@jest/globals";
import { mockResponse } from "./test-helpers.js";

// Mock service before import
jest.unstable_mockModule("../services/booklist.service.js", () => ({
  BookListService: {
    getBookLists: jest.fn(),
    getBookList: jest.fn(),
    createBookList: jest.fn(),
    updateBookList: jest.fn(),
    replaceBookList: jest.fn(),
    deleteBookList: jest.fn(),
    addComment: jest.fn(),
    deleteComment: jest.fn(),
  },
}));


let BookListService;
let BookListController;

beforeAll(async () => {
  ({ BookListService } = await import("../services/booklist.service.js"));
  ({ BookListController } = await import("../controllers/booklist.controller.js"));
});

describe("BookListController.getBookList", () => {
  it("returns 200 with book list", async () => {
    BookListService.getBookList.mockResolvedValue({ id: "1", title: "A Book" });

    const req = { params: { id: "1" } };
    const res = mockResponse();

    await BookListController.getBookList(req, res);

    expect(BookListService.getBookList).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: "1", title: "A Book" });
  });

  it("returns 404 when not found", async () => {
    BookListService.getBookList.mockResolvedValue(null);

    const req = { params: { id: "999" } };
    const res = mockResponse();

    await BookListController.getBookList(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "BookList not found" });
  });
});

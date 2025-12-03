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

/*
// ----------------------------------------------------
// GET /api/v1/booklists/:id
// ----------------------------------------------------
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

// ----------------------------------------------------
// POST /api/v1/booklists
// ----------------------------------------------------
describe("BookListController.createBookList", () => {
  it("returns 201 when created", async () => {
    BookListService.createBookList.mockResolvedValue({
      id: "1",
      title: "Created Book",
    });

    const req = { body: { title: "Created Book" } };
    const res = mockResponse();

    await BookListController.createBookList(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: "1",
      title: "Created Book",
    });
  });

  it("returns 400 on validation error", async () => {
    BookListService.createBookList.mockRejectedValue({
      statusCode: 400,
      message: "Validation error",
    });

    const req = { body: {} };
    const res = mockResponse();

    await BookListController.createBookList(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Validation error" });
  });
});

// ----------------------------------------------------
// PUT /api/v1/booklists/:id
// ----------------------------------------------------
describe("BookListController.updateBookList", () => {
  it("returns 200 when updated", async () => {
    BookListService.updateBookList.mockResolvedValue({
      id: "1",
      title: "Updated",
    });

    const req = { params: { id: "1" }, body: { title: "Updated" } };
    const res = mockResponse();

    await BookListController.updateBookList(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: "1",
      title: "Updated",
    });
  });
});

// ----------------------------------------------------
// PATCH /api/v1/booklists/:id
// ----------------------------------------------------
describe("BookListController.replaceBookList", () => {
  it("returns 200 on replace", async () => {
    BookListService.replaceBookList.mockResolvedValue({
      id: "1",
      title: "Replaced",
    });

    const req = { params: { id: "1" }, body: { title: "Replaced" } };
    const res = mockResponse();

    await BookListController.replaceBookList(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: "1",
      title: "Replaced",
    });
  });
});

// ----------------------------------------------------
// DELETE /api/v1/booklists/:id
// ----------------------------------------------------
describe("BookListController.deleteBookList", () => {
  it("returns 204 when deleted", async () => {
    BookListService.deleteBookList.mockResolvedValue(true);

    const req = { params: { id: "1" } };
    const res = mockResponse();

    await BookListController.deleteBookList(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledWith();
  });

  it("returns 404 when not found", async () => {
    BookListService.deleteBookList.mockResolvedValue(false);

    const req = { params: { id: "999" } };
    const res = mockResponse();

    await BookListController.deleteBookList(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "BookList not found" });
  });
});
*/
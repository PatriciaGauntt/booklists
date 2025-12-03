import { jest } from "@jest/globals";

// MUST BE BEFORE ANY IMPORT OF THE MODULE
jest.unstable_mockModule("../services/booklist.service.js", () => ({
  __esModule: true,
  BookListService: {
    createBookList: jest.fn(),
    updateBookList: jest.fn(),
    replaceBookList: jest.fn(),
    deleteBookList: jest.fn(),
    addComment: jest.fn(),
    deleteComment: jest.fn(),
    getBookList: jest.fn(),
    getBookLists: jest.fn(),
  }
}));

const { BookListService } = await import("../services/booklist.service.js");
const { BookListController } = await import("../controllers/booklist.controller.js");

function mockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    sendStatus: jest.fn(),
  };
}

describe("BookListController CRUD + comment methods", () => {
  // --------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------
  test("createBookList returns 201 with created object", async () => {
    const req = { body: { title: "Test" } };
    const res = mockResponse();

    const created = { id: 1, title: "Test" };
    BookListService.createBookList.mockResolvedValue(created);

    await BookListController.createBookList(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(created);
  });

  test("createBookList returns 500 on error", async () => {
    const req = { body: {} };
    const res = mockResponse();

    BookListService.createBookList.mockRejectedValue(new Error("Boom"));

    await BookListController.createBookList(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Boom" });
  });

  // --------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------
  test("updateBookList returns 200 with updated data", async () => {
    const req = { params: { id: "1" }, body: { title: "Updated" } };
    const res = mockResponse();

    const updated = { id: "1", title: "Updated" };
    BookListService.updateBookList.mockResolvedValue(updated);

    await BookListController.updateBookList(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  test("updateBookList returns 500 on service error", async () => {
    const req = { params: { id: "1" }, body: {} };
    const res = mockResponse();

    BookListService.updateBookList.mockRejectedValue(new Error("Update error"));

    await BookListController.updateBookList(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Update error" });
  });

  // --------------------------------------------------------------
  // REPLACE
  // --------------------------------------------------------------
  test("replaceBookList returns 200 with replaced object", async () => {
    const req = { params: { id: "1" }, body: { title: "New Book" } };
    const res = mockResponse();

    const replaced = { id: "1", title: "New Book" };
    BookListService.replaceBookList.mockResolvedValue(replaced);

    await BookListController.replaceBookList(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(replaced);
  });

  test("replaceBookList returns 500 on error", async () => {
    const req = { params: { id: "1" }, body: {} };
    const res = mockResponse();

    BookListService.replaceBookList.mockRejectedValue(new Error("Replace error"));

    await BookListController.replaceBookList(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Replace error" });
  });

  // --------------------------------------------------------------
  // DELETE
  // --------------------------------------------------------------
  test("deleteBookList returns 204 when deleted", async () => {
    const req = { params: { id: "1" } };
    const res = mockResponse();

    BookListService.deleteBookList.mockResolvedValue(true);

    await BookListController.deleteBookList(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  test("deleteBookList returns 404 when not found", async () => {
    const req = { params: { id: "1" } };
    const res = mockResponse();

    BookListService.deleteBookList.mockResolvedValue(false);

    await BookListController.deleteBookList(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(404);
  });

  // --------------------------------------------------------------
  // ADD COMMENT
  // --------------------------------------------------------------
  test("addComment returns 200 with updated book", async () => {
    const req = { params: { id: "1" }, body: { text: "Hi" } };
    const res = mockResponse();
    const next = jest.fn();

    const updated = { id: "1", comments: [{ text: "Hi" }] };

    BookListService.addComment.mockResolvedValue(updated);

    await BookListController.addComment(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
    expect(next).not.toHaveBeenCalled();
  });

  test("addComment calls next on error", async () => {
    const req = { params: { id: "1" }, body: {} };
    const res = mockResponse();
    const next = jest.fn();

    BookListService.addComment.mockRejectedValue(new Error("Add comment error"));

    await BookListController.addComment(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  // --------------------------------------------------------------
  // DELETE COMMENT
  // --------------------------------------------------------------
  test("deleteComment returns success JSON", async () => {
    const req = { params: { id: "1", commentId: "9" } };
    const res = mockResponse();

    BookListService.deleteComment.mockResolvedValue(true);

    await BookListController.deleteComment(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "Comment deleted" });
  });

  test("deleteComment returns 404 if book or comment missing", async () => {
    const req = { params: { id: "1", commentId: "9" } };
    const res = mockResponse();

    BookListService.deleteComment.mockResolvedValue(false);

    await BookListController.deleteComment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Book or comment not found",
    });
  });

  test("deleteComment returns 500 on error", async () => {
    const req = { params: { id: "1", commentId: "9" } };
    const res = mockResponse();

    BookListService.deleteComment.mockRejectedValue(new Error("DB error"));

    await BookListController.deleteComment(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Server error deleting comment",
    });
  });
});

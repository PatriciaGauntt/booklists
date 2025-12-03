import { jest } from "@jest/globals";
import request from "supertest";

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
  } // your mocks
}));
// Now import the mocked service
let BookListService;
let app;

beforeAll(async () => {
  ({ BookListService } = await import("../services/booklist.service.js"));

  // Import app ONLY after the mock exists
  app = (await import("../app.js")).default;
});

  // ---------------------------
  // GET /api/v1/booklists/:id
  // ---------------------------
describe("GET /api/v1/booklists/:id", () => {
  it("returns one book list", async () => {
    BookListService.getBookList.mockResolvedValue({
      id: "1",
      title: "A Book"
    });

    const res = await request(app).get("/api/v1/booklists/1");

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("A Book");
  });

  it("returns 404 if not found", async () => {
    BookListService.getBookList.mockResolvedValue(null);

    const res = await request(app).get("/api/v1/booklists/999");

    expect(res.status).toBe(404);
  });
});

  // ---------------------------
  // POST /api/v1/booklists
  // ---------------------------
  describe("POST /api/v1/booklists", () => {
    it("creates a new book list", async () => {
      BookListService.createBookList.mockResolvedValue({
        id: "1",
        title: "Created Book"
      });

      const res = await request(app)
        .post("/api/v1/booklists")
        .send({ title: "Created Book" });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe("Created Book");
    });

    it("returns 400 on validation error", async () => {
      BookListService.createBookList.mockRejectedValue({
        statusCode: 400,
        message: "Validation error"
      });

      const res = await request(app)
        .post("/api/v1/booklists")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation error");
    });
  });
/*
  // ---------------------------
  // PUT /api/v1/booklists/:id
  // ---------------------------
  describe("PUT /api/v1/booklists/:id", () => {
    it("updates a book list", async () => {
      BookListService.updateBookList.mockResolvedValue({
        id: "1",
        title: "Updated Book"
      });

      const res = await request(app)
        .put("/api/v1/booklists/1")
        .send({ title: "Updated Book" });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Updated Book");
    });
  });

  // ---------------------------
  // PATCH /api/v1/booklists/:id
  // (your replaceBookList)
  // ---------------------------
  describe("PATCH /api/v1/booklists/:id", () => {
    it("replaces a book list", async () => {
      BookListService.replaceBookList.mockResolvedValue({
        id: "1",
        title: "Replaced"
      });

      const res = await request(app)
        .patch("/api/v1/booklists/1")
        .send({ title: "Replaced" });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Replaced");
    });
  });

  // ---------------------------
  // DELETE /api/v1/booklists/:id
  // ---------------------------
  describe("DELETE /api/v1/booklists/:id", () => {
    it("deletes and returns 204", async () => {
      BookListService.deleteBookList.mockResolvedValue(true);

      const res = await request(app)
        .delete("/api/v1/booklists/1");

      expect(res.status).toBe(204);
    });

    it("returns 404 if not found", async () => {
      BookListService.deleteBookList.mockResolvedValue(false);

      const res = await request(app)
        .delete("/api/v1/booklists/999");

      expect(res.status).toBe(404);
    });
  });

  // ---------------------------
  // POST /api/v1/booklists/:id/comments
  // ---------------------------
  describe("POST /api/v1/booklists/:id/comments", () => {
    it("adds a comment", async () => {
      BookListService.addComment.mockResolvedValue({
        id: "1",
        comments: [{ text: "Nice", user: "Pat" }]
      });

      const res = await request(app)
        .post("/api/v1/booklists/1/comments")
        .send({ text: "Nice", user: "Pat" });

      expect(res.status).toBe(200);
      expect(res.body.comments.length).toBe(1);
    });
  });

  // ---------------------------
  // DELETE /api/v1/booklists/:id/comments/:cid
  // ---------------------------
  describe("DELETE /api/v1/booklists/:id/comments/:cid", () => {
    it("deletes a comment", async () => {
      BookListService.deleteComment.mockResolvedValue(true);

      const res = await request(app)
        .delete("/api/v1/booklists/1/comments/abc123");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Comment deleted");
    });

    it("returns 404 for missing comment", async () => {
      BookListService.deleteComment.mockResolvedValue(false);

      const res = await request(app)
        .delete("/api/v1/booklists/1/comments/xyz");

      expect(res.status).toBe(404);
    });
  });

*/
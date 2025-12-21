import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

/**
 * 1️⃣ MOCK CONTROLLER USING ESM API
 */
await jest.unstable_mockModule(
  "../controllers/booklist.controller.js",
  () => ({
    BookListController: {
      getBookLists: jest.fn((req, res) => res.status(200).json([])),
      getBookList: jest.fn((req, res) => res.status(200).json({ id: "123" })),
      createBookList: jest.fn((req, res) =>
        res.status(201).json({ id: "123" })
      ),
      updateBookList: jest.fn((req, res) =>
        res.status(200).json({ id: "123" })
      ),
      replaceBookList: jest.fn((req, res) =>
        res.status(200).json({ id: "123" })
      ),
      deleteBookList: jest.fn((req, res) => res.sendStatus(204)),
      addComment: jest.fn((req, res) =>
        res.status(200).json({ comments: [] })
      ),
      deleteComment: jest.fn((req, res) =>
        res.status(200).json({ message: "Comment deleted" })
      ),
      lookupBookByISBN: jest.fn((req, res) =>
        res.status(200).json({ title: "ISBN Book" })
      ),
    },
  })
);

/**
 * 2️⃣ IMPORT ROUTER AFTER MOCK (DYNAMIC IMPORT)
 */
const { bookListRouter } = await import(
  "../routes/booklist.routes.js"
);

const app = express();
app.use(express.json());
app.use("/api/v1/booklists", bookListRouter);

describe("BookList Routes", () => {
  test("GET /api/v1/booklists", async () => {
    const res = await request(app).get("/api/v1/booklists");
    expect(res.statusCode).toBe(200);
  });

  test("GET /api/v1/booklists/:id", async () => {
    const res = await request(app).get("/api/v1/booklists/123");
    expect(res.statusCode).toBe(200);
  });

  test("POST /api/v1/booklists", async () => {
    const res = await request(app)
      .post("/api/v1/booklists")
      .send({ title: "New Book" });

    expect(res.statusCode).toBe(201);
  });

  test("PATCH /api/v1/booklists/:id", async () => {
    const res = await request(app)
      .patch("/api/v1/booklists/123")
      .send({ title: "Updated" });

    expect(res.statusCode).toBe(200);
  });

  test("PUT /api/v1/booklists/:id", async () => {
    const res = await request(app)
      .put("/api/v1/booklists/123")
      .send({ title: "Replaced" });

    expect(res.statusCode).toBe(200);
  });

  test("DELETE /api/v1/booklists/:id", async () => {
    const res = await request(app).delete("/api/v1/booklists/123");
    expect(res.statusCode).toBe(204);
  });

  test("POST /api/v1/booklists/:id/comments", async () => {
    const res = await request(app)
      .post("/api/v1/booklists/123/comments")
      .send({ text: "Nice book" });

    expect(res.statusCode).toBe(200);
  });

  test("DELETE /api/v1/booklists/:id/comments/:commentId", async () => {
    const res = await request(app).delete(
      "/api/v1/booklists/123/comments/456"
    );

    expect(res.statusCode).toBe(200);
  });

  test("GET /api/v1/booklists/isbn/:isbn", async () => {
    const res = await request(app).get(
      "/api/v1/booklists/isbn/9781234567890"
    );

    expect(res.statusCode).toBe(200);
  });
});


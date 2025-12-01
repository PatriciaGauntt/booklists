import { jest } from "@jest/globals";
import request from "supertest";
import app from "../app.js";

jest.unstable_mockModule('../services/booklist.service.js', () => ({
  BookListService: {
    getBookList: jest.fn(),
    // etc...
  }
}));

let BookListService;

beforeAll(async () => {
  ({ BookListService } = await import("../services/booklist.service.js"));
});

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
});
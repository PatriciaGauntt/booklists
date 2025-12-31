import request from "supertest";
import express from "express";
import { jest } from "@jest/globals";

/* -------------------------------------------------
   MOCK CONTROLLER
------------------------------------------------- */
jest.unstable_mockModule("../controllers/feedback.controller.js", () => ({
  FeedbackController: {
    getAllFeedback: jest.fn(),
    getFeedbackById: jest.fn(),
    createFeedback: jest.fn(),
    deleteFeedback: jest.fn(),
  },
}));

const { FeedbackController } = await import(
  "../controllers/feedback.controller.js"
);
const { feedbackRouter } = await import("../routes/feedback.routes.js");

/* -------------------------------------------------
   TEST APP
------------------------------------------------- */
const app = express();
app.use(express.json());
app.use("/feedback", feedbackRouter);

/* =================================================
   FEEDBACK ROUTES TESTS
================================================= */
describe("Feedback Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* -------------------------------------------------
     GET /
  ------------------------------------------------- */
  it("GET /feedback → returns all feedback", async () => {
    FeedbackController.getAllFeedback.mockImplementation((req, res) => {
      res.status(200).json([{ id: "1", message: "Test" }]);
    });

    const res = await request(app).get("/feedback");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ id: "1", message: "Test" }]);
    expect(FeedbackController.getAllFeedback).toHaveBeenCalled();
  });

  /* -------------------------------------------------
     GET /:id
  ------------------------------------------------- */
  it("GET /feedback/:id → returns feedback by id", async () => {
    FeedbackController.getFeedbackById.mockImplementation((req, res) => {
      res.status(200).json({ id: "abc123", message: "Hello" });
    });

    const res = await request(app).get("/feedback/abc123");

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe("abc123");
    expect(FeedbackController.getFeedbackById).toHaveBeenCalled();
  });

  /* -------------------------------------------------
     POST /
  ------------------------------------------------- */
  it("POST /feedback → creates feedback", async () => {
    FeedbackController.createFeedback.mockImplementation((req, res) => {
      res.status(201).json({ id: "new1", message: "Created" });
    });

    const res = await request(app)
      .post("/feedback")
      .send({ type: "bug", message: "Broken" });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBe("new1");
    expect(FeedbackController.createFeedback).toHaveBeenCalled();
  });

  /* -------------------------------------------------
     DELETE /:id
  ------------------------------------------------- */
  it("DELETE /feedback/:id → deletes feedback", async () => {
    FeedbackController.deleteFeedback.mockImplementation((req, res) => {
      res.sendStatus(204);
    });

    const res = await request(app).delete("/feedback/abc123");

    expect(res.statusCode).toBe(204);
    expect(FeedbackController.deleteFeedback).toHaveBeenCalled();
  });
});

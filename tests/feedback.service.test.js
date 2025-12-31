import { jest } from "@jest/globals";

/* -------------------------------------------------
   MOCK FEEDBACK MODEL
------------------------------------------------- */
jest.unstable_mockModule("../models/feedback.model.js", () => ({
  FeedbackModel: {
    getAllFeedback: jest.fn(),
    getFeedbackById: jest.fn(),
    createFeedback: jest.fn(),
    deleteFeedback: jest.fn(),
  },
}));

const { FeedbackService } = await import("../services/feedback.service.js");
const { FeedbackModel } = await import("../models/feedback.model.js");

/* -------------------------------------------------
   SHARED MOCK DATA
------------------------------------------------- */
const mockFeedback = {
  id: "abc123",
  type: "bug",
  message: "Something is broken",
  uuid: "11111111-1111-1111-1111-111111111111",
  createdDate: "2024-01-01T00:00:00.000Z",
};

/* =================================================
   FEEDBACK SERVICE TESTS
================================================= */
describe("FeedbackService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* -------------------------------------------------
     GET ALL
  ------------------------------------------------- */
  describe("getAllFeedback", () => {
    it("returns all feedback entries", async () => {
      FeedbackModel.getAllFeedback.mockResolvedValue({
        toArray: jest.fn().mockResolvedValue([mockFeedback]),
      });

      const result = await FeedbackService.getAllFeedback();

      expect(FeedbackModel.getAllFeedback).toHaveBeenCalled();
      expect(result).toEqual([mockFeedback]);
    });
  });

  /* -------------------------------------------------
     GET ONE
  ------------------------------------------------- */
  describe("getFeedbackById", () => {
    it("returns feedback when found", async () => {
      FeedbackModel.getFeedbackById.mockResolvedValue(mockFeedback);

      const result = await FeedbackService.getFeedbackById("abc123");

      expect(result).toEqual(mockFeedback);
    });

    it("returns null when feedback not found", async () => {
      FeedbackModel.getFeedbackById.mockResolvedValue(null);

      const result = await FeedbackService.getFeedbackById("missing");

      expect(result).toBeNull();
    });
  });

  /* -------------------------------------------------
     CREATE
  ------------------------------------------------- */
  describe("createFeedback", () => {
    it("creates feedback with valid data", async () => {
      FeedbackModel.createFeedback.mockResolvedValue(mockFeedback);

      const result = await FeedbackService.createFeedback({
        type: "bug",
        message: "Something is broken",
      });

      expect(FeedbackModel.createFeedback).toHaveBeenCalled();

      const passedArg =
        FeedbackModel.createFeedback.mock.calls[0][0];

      expect(passedArg).toHaveProperty("id");
      expect(passedArg).toHaveProperty("uuid");
      expect(passedArg).toHaveProperty("createdDate");
      expect(result).toEqual(mockFeedback);
    });

    it("throws 400 when validation fails", async () => {
      await expect(
        FeedbackService.createFeedback({
          type: "bug",
        })
      ).rejects.toHaveProperty("statusCode", 400);
    });
  });

  /* -------------------------------------------------
     DELETE
  ------------------------------------------------- */
  describe("deleteFeedback", () => {
    it("deletes feedback when it exists", async () => {
      FeedbackModel.getFeedbackById.mockResolvedValue(mockFeedback);
      FeedbackModel.deleteFeedback.mockResolvedValue(true);

      const result = await FeedbackService.deleteFeedback("abc123");

      expect(FeedbackModel.deleteFeedback).toHaveBeenCalledWith("abc123");
      expect(result).toEqual({ deleted: true });
    });

    it("throws 404 when feedback does not exist", async () => {
      FeedbackModel.getFeedbackById.mockResolvedValue(null);

      await expect(
        FeedbackService.deleteFeedback("missing")
      ).rejects.toHaveProperty("statusCode", 404);
    });
  });
});

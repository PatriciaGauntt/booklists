import { jest } from "@jest/globals";

/* -------------------------------------------------
   MOCK SERVICE
------------------------------------------------- */
jest.unstable_mockModule("../services/feedback.service.js", () => ({
  FeedbackService: {
    getAllFeedback: jest.fn(),
    getFeedbackById: jest.fn(),
    createFeedback: jest.fn(),
    deleteFeedback: jest.fn(),
  },
}));

const { FeedbackController } = await import(
  "../controllers/feedback.controller.js"
);
const { FeedbackService } = await import(
  "../services/feedback.service.js"
);

/* -------------------------------------------------
   MOCK EXPRESS RESPONSE
------------------------------------------------- */
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};

/* -------------------------------------------------
   SHARED MOCK DATA
------------------------------------------------- */
const mockFeedback = {
  id: "abc123",
  type: "bug",
  message: "Something is broken",
};

/* =================================================
   FEEDBACK CONTROLLER TESTS
================================================= */
describe("FeedbackController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* -------------------------------------------------
     GET MANY
  ------------------------------------------------- */
  describe("getAllFeedback", () => {
    it("returns 200 with feedback list", async () => {
      FeedbackService.getAllFeedback.mockResolvedValue([mockFeedback]);

      const req = {};
      const res = mockRes();

      await FeedbackController.getAllFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockFeedback]);
    });
  });

  /* -------------------------------------------------
     GET ONE
  ------------------------------------------------- */
  describe("getFeedbackById", () => {
    it("returns 200 when feedback exists", async () => {
      FeedbackService.getFeedbackById.mockResolvedValue(mockFeedback);

      const req = { params: { id: "abc123" } };
      const res = mockRes();

      await FeedbackController.getFeedbackById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockFeedback);
    });

    it("returns 404 when feedback not found", async () => {
      FeedbackService.getFeedbackById.mockResolvedValue(null);

      const req = { params: { id: "missing" } };
      const res = mockRes();

      await FeedbackController.getFeedbackById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Message not found",
      });
    });
  });

  /* -------------------------------------------------
     CREATE
  ------------------------------------------------- */
  describe("createFeedback", () => {
    it("returns 201 on success", async () => {
      FeedbackService.createFeedback.mockResolvedValue(mockFeedback);

      const req = {
        body: { type: "bug", message: "Broken" },
      };
      const res = mockRes();

      await FeedbackController.createFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockFeedback);
    });

    it("returns 400 on validation error", async () => {
      FeedbackService.createFeedback.mockRejectedValue({
        statusCode: 400,
        message: "Validation failed",
      });

      const req = {
        body: { type: "bug" },
      };
      const res = mockRes();

      await FeedbackController.createFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Validation failed",
      });
    });
  });

  /* -------------------------------------------------
     DELETE
  ------------------------------------------------- */
  describe("deleteFeedback", () => {
    it("returns 204 on successful delete", async () => {
      FeedbackService.deleteFeedback.mockResolvedValue({ deleted: true });

      const req = { params: { id: "abc123" } };
      const res = mockRes();

      await FeedbackController.deleteFeedback(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it("returns 404 when feedback not found", async () => {
      FeedbackService.deleteFeedback.mockRejectedValue({
        statusCode: 404,
        message: "Not found",
      });

      const req = { params: { id: "missing" } };
      const res = mockRes();

      await FeedbackController.deleteFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Not found",
      });
    });
  });
});

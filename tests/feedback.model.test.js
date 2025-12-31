import { jest } from "@jest/globals";

/* -------------------------------------------------
   MOCK MONGO
------------------------------------------------- */
const mockCursor = {
  sort: jest.fn().mockReturnThis(),
  toArray: jest.fn(),
};

const mockCollection = {
  find: jest.fn(() => mockCursor),
  findOne: jest.fn(),
  insertOne: jest.fn(),
  deleteOne: jest.fn(),
};

jest.unstable_mockModule("../lib/mongo.js", () => ({
  mongo: {
    getDb: jest.fn(() => ({
      collection: jest.fn(() => mockCollection),
    })),
  },
}));

jest.unstable_mockModule("../lib/constants.js", () => ({
  Constants: {
    FEEDBACK_COLLECTIONS: "feedback",
  },
}));

const { FeedbackModel } = await import("../models/feedback.model.js");

/* -------------------------------------------------
   SHARED MOCK DATA
------------------------------------------------- */
const mockFeedback = {
  id: "abc123",
  type: "bug",
  message: "Something is broken",
  createdDate: "2024-01-01T00:00:00.000Z",
};

/* =================================================
   FEEDBACK MODEL TESTS
================================================= */
describe("FeedbackModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* -------------------------------------------------
     COLLECTION
  ------------------------------------------------- */
  it("getCollection returns feedback collection", () => {
    const collection = FeedbackModel.getCollection();
    expect(collection).toBeDefined();
  });

  /* -------------------------------------------------
     GET MANY
  ------------------------------------------------- */
  describe("getAllFeedback", () => {
    it("returns sorted cursor", async () => {
      const cursor = FeedbackModel.getAllFeedback();

      expect(mockCollection.find).toHaveBeenCalledWith(
        {},
        { projection: { _id: 0 } }
      );
      expect(cursor).toBe(mockCursor);
    });
  });

  /* -------------------------------------------------
     GET ONE
  ------------------------------------------------- */
  describe("getFeedbackById", () => {
    it("returns feedback when found", async () => {
      mockCollection.findOne.mockResolvedValue(mockFeedback);

      const result = await FeedbackModel.getFeedbackById("abc123");

      expect(mockCollection.findOne).toHaveBeenCalledWith(
        { id: "abc123" },
        { projection: { _id: 0 } }
      );
      expect(result).toEqual(mockFeedback);
    });

    it("returns null when not found", async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await FeedbackModel.getFeedbackById("missing");

      expect(result).toBeNull();
    });
  });

  /* -------------------------------------------------
     CREATE
  ------------------------------------------------- */
  describe("createFeedback", () => {
    it("inserts and returns feedback", async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const feedback = { ...mockFeedback };
      const result = await FeedbackModel.createFeedback(feedback);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(feedback);
      expect(result).toEqual(mockFeedback);
    });
  });

  /* -------------------------------------------------
     DELETE
  ------------------------------------------------- */
  describe("deleteFeedback", () => {
    it("returns true when deleted", async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await FeedbackModel.deleteFeedback("abc123");

      expect(result).toBe(true);
    });

    it("returns false when nothing deleted", async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const result = await FeedbackModel.deleteFeedback("missing");

      expect(result).toBe(false);
    });
  });

  /* -------------------------------------------------
     LEGACY / WRAPPER METHODS
  ------------------------------------------------- */
  describe("legacy wrappers", () => {
    it("insertOne calls createFeedback", async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const result = await FeedbackModel.insertOne({ ...mockFeedback });

      expect(result.id).toBe("abc123");
    });

    it("findOne calls getFeedbackById", async () => {
      mockCollection.findOne.mockResolvedValue(mockFeedback);

      const result = await FeedbackModel.findOne("abc123");

      expect(result).toEqual(mockFeedback);
    });

    it("deleteOne calls deleteFeedback", async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await FeedbackModel.deleteOne("abc123");

      expect(result).toBe(true);
    });
  });
});

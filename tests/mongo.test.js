import { mongo } from "../lib/mongo.js";
import { jest } from "@jest/globals";

describe("mongo.close", () => {
  test("closes client and clears db/client references", async () => {
    // Mock a connected client
    const closeMock = jest.fn().mockResolvedValue();

    mongo.client = { close: closeMock };
    mongo.db = {};

    await mongo.close();

    expect(closeMock).toHaveBeenCalled();
    expect(mongo.client).toBeNull();
    expect(mongo.db).toBeNull();
  });
});

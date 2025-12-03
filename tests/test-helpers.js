import { jest } from "@jest/globals";

export function mockResponse() {
  const res = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  // Add missing Express methods
  res.sendStatus = jest.fn(status => {
    res.status(status);
    return res;
  });

  res.send = jest.fn().mockReturnValue(res);

  return res;
}
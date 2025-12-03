export default {
  testEnvironment: 'node',
  transform: {}, // Disable Babel transform, use native ESM
  verbose: true,
  injectGlobals: true,
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.js"],
  collectCoverage: true,
  collectCoverageFrom: [
    "controllers/**/*.js",
    "services/**/*.js",
    "models/**/*.js",
    "lib/**/*.js"
  ],

  // Output coverage into /coverage
  coverageDirectory: "coverage",

  // Fail if coverage too low (helps guarantee quality)
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};


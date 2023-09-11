export default {
  preset: "ts-jest",
  testMatch: ["<rootDir>/src/**/*.spec.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/test-utils/jestGlobalSetup.ts", "<rootDir>/src/test-utils/requestInterceptor.ts"],
};

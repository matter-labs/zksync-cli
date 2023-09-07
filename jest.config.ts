export default {
  preset: "ts-jest",
  roots: ["<rootDir>/tests/"],
  testMatch: ["./**/*.spec.ts"],
  setupFilesAfterEnv: ["./tests/jestGlobalSetup.ts"],
  transform: {
    "^.+\\.ts?$": ["ts-jest", { tsconfig: "./tests/tsconfig.json" }],
  },
};

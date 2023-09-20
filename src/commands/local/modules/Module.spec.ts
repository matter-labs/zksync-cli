import { mockModuleInstance } from "../../../test-utils/mocks";
import { getLocalPath } from "../../../utils/files";

import type { DefaultModuleFields } from "./Module";

describe("local Module", () => {
  const defaultModuleFields: DefaultModuleFields = {
    name: "Test Module",
    description: "A test module for zksync",
    key: "testModule",
    tags: ["node"],
  };

  let moduleInstance: ReturnType<typeof mockModuleInstance>;

  beforeEach(() => {
    moduleInstance = mockModuleInstance(defaultModuleFields);
  });

  describe("constructor", () => {
    it("initializes module with provided data", () => {
      expect(moduleInstance.name).toBe(defaultModuleFields.name);
      expect(moduleInstance.description).toBe(defaultModuleFields.description);
      expect(moduleInstance.key).toBe(defaultModuleFields.key);
      expect(moduleInstance.tags).toEqual(defaultModuleFields.tags);
    });
  });

  describe("dataDirPath", () => {
    it("returns the correct local path for the module", () => {
      const expectedPath = getLocalPath("modules", defaultModuleFields.key);
      expect(moduleInstance.dataDirPath).toBe(expectedPath);
    });
  });
});

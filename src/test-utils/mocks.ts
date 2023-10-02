/* eslint-disable @typescript-eslint/no-explicit-any */
/* import * as config from "../commands/local/config.js";
import * as modules from "../commands/local/modules.js";
import Module from "../commands/local/modules/Module"; */
import { jest } from "@jest/globals";

import * as files from "../utils/files.js";
import * as helpers from "../utils/helpers.js";

/* import type { DefaultModuleFields } from "../commands/local/modules/Module"; */

export const mockExecute = () => {
  return jest.spyOn(helpers, "executeCommand").mockImplementation(() => Promise.resolve(""));
};

export const mockFileOrDirExists = () => {
  return jest.spyOn(files, "fileOrDirExists").mockReturnValue(false);
};

export const mockL2Provider = (params: any = {}) => {
  return jest.spyOn(helpers, "getL2Provider").mockImplementation(() => ({
    ...params,
  }));
};

export const mockL1Provider = (params: any = {}) => {
  return jest.spyOn(helpers, "getL1Provider").mockImplementation(() => ({
    ...params,
  }));
};

export const mockL2Wallet = (params: any = {}) => {
  return jest.spyOn(helpers, "getL2Wallet").mockImplementation(() => ({
    ...params,
  }));
};

/* local command mocks */
/* export const mockGetConfig = (params: any = {}) => {
  return jest.spyOn(config, "getConfig").mockImplementation(() => ({
    modules: [],
    ...params,
  }));
};

export const mockGetConfigModules = () => {
  return jest.spyOn(modules, "getConfigModules").mockImplementation(() => []);
};

class MockModule extends Module {
  async isInstalled() {
    return true;
  }
  async install() {}
  async isRunning() {
    return true;
  }
  async start() {}
  async stop() {}
  async clean() {}
}
export const mockModuleInstance = (moduleMetaParams: any = {}, configParams: any = {}) => {
  const defaultModuleFields: DefaultModuleFields = {
    name: "Test Module",
    description: "A test module for zksync",
    key: "testModule",
    tags: ["node"],
  };
  const mockConfig: config.Config = { modules: [] };
  return new MockModule({ ...defaultModuleFields, ...moduleMetaParams }, { ...mockConfig, ...configParams });
}; */

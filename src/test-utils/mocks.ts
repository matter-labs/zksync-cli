/* eslint-disable @typescript-eslint/no-explicit-any */
import * as config from "../commands/local/config";
import * as modules from "../commands/local/modules";
import Module from "../commands/local/modules/Module";
import * as files from "../utils/files";
import * as helpers from "../utils/helpers";

import type { DefaultModuleFields } from "../commands/local/modules/Module";

export const mockExecute = (): jest.SpyInstance => {
  return jest.spyOn(helpers, "executeCommand").mockImplementation(jest.fn());
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
export const mockGetConfig = (params: any = {}) => {
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
};

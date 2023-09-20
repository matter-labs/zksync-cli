import * as configFile from "./config";
import { handler } from "./start";
import { mockConsoleOutput } from "../../test-utils/mockers";
import { mockGetConfig, mockGetConfigModules, mockModuleInstance } from "../../test-utils/mocks";

import type { Config } from "./config";

describe("local start", () => {
  let stdOutMock: ReturnType<typeof mockConsoleOutput>;
  let getConfigMock: ReturnType<typeof mockGetConfig>;
  let getConfigModulesMock: ReturnType<typeof mockGetConfigModules>;
  let configExistsMock: jest.SpyInstance;
  let installedModule: ReturnType<typeof mockModuleInstance>;
  let notInstalledModule: ReturnType<typeof mockModuleInstance>;
  let dummyModules: ReturnType<typeof mockModuleInstance>[];
  let config: Config;

  beforeEach(() => {
    installedModule = mockModuleInstance({ name: "Module1", tags: [] });
    jest.spyOn(installedModule, "isInstalled").mockResolvedValue(true);
    jest.spyOn(installedModule, "install").mockImplementation(jest.fn());
    jest.spyOn(installedModule, "start").mockImplementation(jest.fn());
    jest.spyOn(installedModule, "onStartCompleted").mockImplementation(jest.fn());

    notInstalledModule = mockModuleInstance({ name: "Module2", tags: ["node"] });
    jest.spyOn(notInstalledModule, "isInstalled").mockResolvedValue(false);
    jest.spyOn(notInstalledModule, "install").mockImplementation(jest.fn());
    jest.spyOn(notInstalledModule, "start").mockImplementation(jest.fn());
    jest.spyOn(notInstalledModule, "onStartCompleted").mockImplementation(jest.fn());

    dummyModules = [installedModule, notInstalledModule];
    config = { modules: dummyModules.map((e) => e.name) };

    stdOutMock = mockConsoleOutput();
    getConfigMock = mockGetConfig().mockReturnValue(config);
    getConfigModulesMock = mockGetConfigModules().mockReturnValue(dummyModules);
    configExistsMock = jest.spyOn(configFile, "configExists").mockReturnValue(true);
  });

  afterEach(() => {
    stdOutMock.mockRestore();
    getConfigMock.mockRestore();
    getConfigModulesMock.mockRestore();
    configExistsMock.mockRestore();
  });

  it("checks if config exists", async () => {
    await handler();

    expect(configExistsMock).toHaveBeenCalled();
  });

  it("sets up config if it does not exist", async () => {
    configExistsMock.mockReturnValueOnce(false);
    const setupConfigMock = jest.spyOn(configFile, "handler").mockImplementation(jest.fn());

    await handler();

    expect(setupConfigMock).toHaveBeenCalled();
  });

  it("gets the config modules", async () => {
    await handler();

    expect(getConfigModulesMock).toHaveBeenCalledWith(config);
  });

  it("installs only uninstalled modules", async () => {
    await handler();

    expect(installedModule.isInstalled).toHaveBeenCalled();
    expect(installedModule.install).not.toHaveBeenCalled();
    expect(notInstalledModule.isInstalled).toHaveBeenCalled();
    expect(notInstalledModule.install).toHaveBeenCalled();
  });

  it("outputs expected logs for starting", async () => {
    await handler();

    expect(stdOutMock).not.toBeInConsole(`Installing "${installedModule.name}"...`);
    expect(stdOutMock).toBeInConsole(`Installing "${notInstalledModule.name}"...`);
    expect(stdOutMock).toBeInConsole(`Starting: ${config.modules.join(", ")}...`);
  });

  it("starts all modules", async () => {
    await handler();

    expect(installedModule.start).toHaveBeenCalled();
    expect(notInstalledModule.start).toHaveBeenCalled();
  });

  it("triggers on start completed for all modules", async () => {
    await handler();

    expect(installedModule.onStartCompleted).toHaveBeenCalled();
    expect(notInstalledModule.onStartCompleted).toHaveBeenCalled();
  });
});

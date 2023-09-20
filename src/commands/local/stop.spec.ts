import { handler } from "./stop";
import { mockConsoleOutput } from "../../test-utils/mockers";
import { mockGetConfig, mockGetConfigModules, mockModuleInstance } from "../../test-utils/mocks";

import type { Config } from "./config";

describe("local stop", () => {
  let stdOutMock: ReturnType<typeof mockConsoleOutput>;
  let getConfigMock: ReturnType<typeof mockGetConfig>;
  let getConfigModulesMock: ReturnType<typeof mockGetConfigModules>;
  let installedModule: ReturnType<typeof mockModuleInstance>;
  let notInstalledModule: ReturnType<typeof mockModuleInstance>;
  let dummyModules: ReturnType<typeof mockModuleInstance>[];
  let config: Config;

  beforeEach(() => {
    installedModule = mockModuleInstance({ name: "Module1" });
    jest.spyOn(installedModule, "isInstalled").mockResolvedValue(true);
    jest.spyOn(installedModule, "stop").mockImplementation(jest.fn());
    notInstalledModule = mockModuleInstance({ name: "Module2" });
    jest.spyOn(notInstalledModule, "isInstalled").mockResolvedValue(false);
    jest.spyOn(notInstalledModule, "stop").mockImplementation(jest.fn());

    dummyModules = [installedModule, notInstalledModule];
    config = { modules: dummyModules.map((e) => e.name) };

    stdOutMock = mockConsoleOutput();
    getConfigMock = mockGetConfig().mockReturnValue(config);
    getConfigModulesMock = mockGetConfigModules().mockReturnValue(dummyModules);
  });

  afterEach(() => {
    stdOutMock.mockRestore();
    getConfigMock.mockRestore();
    getConfigModulesMock.mockRestore();
  });

  it("gets the config modules", async () => {
    await handler();

    expect(getConfigModulesMock).toHaveBeenCalledWith(config);
  });
  it("outputs expected logs", async () => {
    await handler();

    expect(stdOutMock).toBeInConsole(`Stopping: ${config.modules.join(", ")}...`);
  });
  it("stops only installed modules", async () => {
    await handler();

    expect(installedModule.isInstalled).toHaveBeenCalled();
    expect(installedModule.stop).toHaveBeenCalled();
    expect(notInstalledModule.isInstalled).toHaveBeenCalled();
    expect(notInstalledModule.stop).not.toHaveBeenCalled();
  });
});

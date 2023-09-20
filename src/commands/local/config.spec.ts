import fs from "fs";

import { handler, getConfig } from "./config";
import { mockConsoleOutput } from "../../test-utils/mockers";
import * as files from "../../utils/files";

describe("localConfig", () => {
  let stdOutMock: ReturnType<typeof mockConsoleOutput>;
  let existsSyncMock: jest.SpyInstance;
  let readFileSyncMock: jest.SpyInstance;
  let writeFileMock: jest.SpyInstance;

  const options = {
    node: "in-memory-node",
    modules: ["portal"],
  };

  beforeEach(() => {
    stdOutMock = mockConsoleOutput();
    existsSyncMock = jest.spyOn(fs, "existsSync");
    readFileSyncMock = jest.spyOn(fs, "readFileSync");
    writeFileMock = jest.spyOn(fs, "writeFileSync");
  });

  afterEach(() => {
    stdOutMock.mockRestore();
    existsSyncMock.mockRestore();
    readFileSyncMock.mockRestore();
    writeFileMock.mockRestore();
  });

  it("throws an error when config doesn't exist", () => {
    existsSyncMock.mockReturnValue(false);

    expect(() => getConfig()).toThrow("Config file does not exist. Run `zksync-cli local config` to create one.");
  });

  it("returns correct config when it exists", () => {
    const mockConfig = {
      modules: ["node1", "module1"],
    };
    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockReturnValue(JSON.stringify(mockConfig));

    const config = getConfig();
    expect(config).toEqual(mockConfig);
  });

  it("runs handler and saves configuration to a local file", async () => {
    await handler(options);

    expect(writeFileMock).toHaveBeenCalledWith(
      files.getLocalPath("config.json"),
      JSON.stringify(
        {
          modules: [options.node, ...options.modules],
        },
        null,
        2
      )
    );
    expect(stdOutMock).toBeInConsole("Configured with:");
  });

  it("outputs expected logs", async () => {
    await handler(options);

    expect(stdOutMock).not.hasConsoleErrors();
    expect(stdOutMock).toBeInConsole("Saving configuration to local config file...");
    expect(stdOutMock).toBeInConsole("Configured with:");
    expect(stdOutMock).toBeInConsole("Node Type: In memory node");
    expect(stdOutMock).toBeInConsole("Modules: Portal");
  });
});

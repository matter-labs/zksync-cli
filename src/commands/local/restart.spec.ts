import { handler } from "./restart";
import * as startModule from "./start";
import * as stopModule from "./stop";
import { mockConsoleOutput } from "../../test-utils/mockers";

describe("local restart", () => {
  let stdOutMock: ReturnType<typeof mockConsoleOutput>;
  let startSpy: jest.SpyInstance;
  let stopSpy: jest.SpyInstance;

  beforeEach(() => {
    stdOutMock = mockConsoleOutput();

    startSpy = jest.spyOn(startModule, "handler").mockImplementation(jest.fn());
    stopSpy = jest.spyOn(stopModule, "handler").mockImplementation(jest.fn());
  });

  afterEach(() => {
    stdOutMock.mockRestore();
    startSpy.mockRestore();
    stopSpy.mockRestore();
  });

  it("calls stop and start handlers", async () => {
    await handler();

    expect(stopSpy).toHaveBeenCalled();
    expect(startSpy).toHaveBeenCalled();
  });
});

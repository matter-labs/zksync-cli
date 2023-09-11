/* eslint-disable @typescript-eslint/no-explicit-any */

export const mockConsoleOutput = () => {
  const unifiedSpy = jest.fn();

  const spies = {
    log: jest.spyOn(console, "log").mockImplementation(unifiedSpy),
    info: jest.spyOn(console, "info").mockImplementation(unifiedSpy),
    // Winston logger uses console._stdout.write
    _stdout: jest.spyOn((console as any)._stdout, "write").mockImplementation(unifiedSpy),
    processStdout: jest.spyOn(process.stdout, "write").mockImplementation(unifiedSpy),
  };

  unifiedSpy.mockRestore = () => {
    Object.values(spies).forEach((spy) => spy.mockRestore());
  };

  return unifiedSpy;
};

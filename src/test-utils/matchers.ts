import { errorSymbol } from "../utils/logger";

export const toBeInConsole = (received: jest.SpyInstance, expected: string) => {
  const calls = received.mock.calls.flat();

  // Collect all messages from the mock calls
  const getAllMessages = () => calls.join("\n");

  for (let i = 0; i < calls.length; i++) {
    if (calls[i]?.toString().includes(expected)) {
      return {
        message: () => `Not expected in console: "${expected}".\n\nReceived in console:\n${getAllMessages()}`,
        pass: true,
      };
    }
  }

  return {
    message: () => `Expected in console: "${expected}".\n\nReceived in console:\n${getAllMessages()}`,
    pass: false,
  };
};

export const hasConsoleErrors = (received: jest.SpyInstance) => {
  const result = toBeInConsole(received, errorSymbol);
  if (result.pass) {
    return {
      message: () =>
        `No console errors expected, but there were some:\n${received.mock.calls
          .flat()
          .filter((e) => e.includes(errorSymbol))}`,
      pass: true,
    };
  } else {
    return {
      message: () => "Expected console errors, but there were none.",
      pass: false,
    };
  }
};

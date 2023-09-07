import type { mockProcessStdout } from "jest-mock-process";

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInConsole(value: string): R;
    }
  }
}

export const toBeInConsole = (received: ReturnType<typeof mockProcessStdout>, expected: string) => {
  const calls = received.mock.calls;

  for (let i = 0; i < calls.length; i++) {
    for (let j = 0; j < calls[i].length; j++) {
      if (calls?.[i][j]?.toString().includes(expected)) {
        return {
          message: () => `Not expected in console: "${expected}"`,
          pass: true,
        };
      }
    }
  }

  // Collect all messages from the mock calls
  const allMessages = calls.flat().join("\n");

  return {
    message: () => `Expected in console: "${expected}".\n\nReceived in console:\n${allMessages}`,
    pass: false,
  };
};

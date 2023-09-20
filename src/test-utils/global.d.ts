declare global {
  namespace jest {
    interface Matchers<R> {
      hasConsoleErrors(): R;
      toBeInConsole(value: string): R;
    }
  }
}

// This makes TypeScript treat this file as a module
export {};

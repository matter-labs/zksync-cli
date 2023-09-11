declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInConsole(value: string): R;
      hasConsoleErrors(): R;
    }
  }
}

// This makes TypeScript treat this file as a module
export {};

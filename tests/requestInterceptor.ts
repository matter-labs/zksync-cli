import { setupServer } from "msw/node";

const server = setupServer();

const unexpectedRequests: { [file: string]: { [testName: string]: { method: string; href: string }[] } } = {};

beforeEach(function () {
  const testState = expect.getState();
  const testPath = testState.testPath?.slice(__dirname.length, -3) || "unknown location";
  const testName = testState.currentTestName || "unknown test name";

  server.listen({
    onUnhandledRequest(req) {
      if (!unexpectedRequests[testPath]) {
        unexpectedRequests[testPath] = {};
      }
      if (!unexpectedRequests[testPath][testName]) {
        unexpectedRequests[testPath][testName] = [];
      }
      unexpectedRequests[testPath][testName].push({
        method: req.method,
        href: req.url.href,
      });
    },
  });
});
afterEach(() => {
  server?.close();
});

afterAll(() => {
  server.close();
  if (Object.keys(unexpectedRequests).length) {
    let errorMessage = "Unexpected requests at ";
    for (const [testPath, testRequests] of Object.entries(unexpectedRequests)) {
      errorMessage += `${testPath}:`;
      for (const [testName, testRequest] of Object.entries(testRequests)) {
        errorMessage += `\n\t"${testName}":`;

        // join same request strings, remove duplicates and show amount: eg "POST https://testnet.era.zksync.dev/ (5)"
        const requestStrings = testRequest
          .map((req) => `${req.method} ${req.href}`)
          .reduce(
            (acc, req) => {
              if (!acc[req]) {
                acc[req] = 1;
              } else {
                acc[req]++;
              }
              return acc;
            },
            {} as { [req: string]: number }
          );
        for (const [req, amount] of Object.entries(requestStrings)) {
          errorMessage += `\n\t\t${req} (${amount})`;
        }
      }
    }

    throw new Error(errorMessage);
  }
});

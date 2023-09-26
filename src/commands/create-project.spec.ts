import { handler as createProject } from "./create-project";
import { mockConsoleOutput } from "../test-utils/mockers";
import { mockExecute } from "../test-utils/mocks";

jest.mock("axios", () => ({
  get: jest.fn().mockResolvedValue({
    data: [
      {
        q: "mocked quote",
        a: "mocked author",
        h: "mocked hash",
      },
    ],
  }),
}));

describe("create-project", () => {
  let stdOutMock: ReturnType<typeof mockConsoleOutput>;
  let runCommandMock: ReturnType<typeof mockExecute>;
  const folderName = "new_project";

  beforeEach(() => {
    stdOutMock = mockConsoleOutput();
    runCommandMock = mockExecute();
  });

  afterEach(() => {
    stdOutMock.mockRestore();
    runCommandMock.mockRestore();
  });

  it("runs expected commands", async () => {
    await createProject(folderName, {
      framework: "hardhat_solidity",
      project: "hello_world",
    });

    expect(stdOutMock).not.hasConsoleErrors();

    expect(runCommandMock).toHaveBeenCalledTimes(1);
    expect(runCommandMock).toHaveBeenCalledWith(`cd ${folderName} && yarn`);
  });

  it("outputs expected logs", async () => {
    await createProject(folderName, {
      framework: "hardhat_solidity",
      project: "hello_world",
      zeek: true,
    });

    expect(stdOutMock).not.hasConsoleErrors();

    expect(stdOutMock).toBeInConsole(`Creating new project from "Hardhat + Solidity" template at "${folderName}/"`);
    expect(stdOutMock).toBeInConsole("Installing dependencies with yarn...");
    expect(stdOutMock).toBeInConsole("All ready 🎉🎉");
    expect(stdOutMock).toBeInConsole(`Run cd ${folderName} to enter your project folder`);
    expect(stdOutMock).toBeInConsole(`zeek would like to tell you "mocked quote - mocked author"`); // eslint-disable-line quotes
  });

  it("uses correct template for Vyper template", async () => {
    await createProject(folderName, {
      framework: "hardhat_vyper",
      project: "hello_world",
    });

    expect(stdOutMock).not.hasConsoleErrors();

    expect(runCommandMock).toHaveBeenCalledWith("cd new_project && yarn");
    expect(stdOutMock).toBeInConsole(`Creating new project from "Hardhat + Vyper" template at "${folderName}/"`);
  });
});

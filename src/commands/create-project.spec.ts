import { handler as createProject } from "./create-project";
import { mockConsoleOutput } from "../test-utils/mockers";
import { mockExecute } from "../test-utils/mocks";

describe("create-project", () => {
  let stdOutMock: ReturnType<typeof mockConsoleOutput>;
  let runCommandMock: ReturnType<typeof mockExecute>;

  beforeEach(() => {
    stdOutMock = mockConsoleOutput();
    runCommandMock = mockExecute();
  });

  afterEach(() => {
    stdOutMock.mockRestore();
    runCommandMock.mockRestore();
  });

  const folderName = "new_project";
  const template = "hardhat_solidity";

  it("runs expected commands", async () => {
    await createProject(folderName, {
      template,
    });

    expect(runCommandMock).toHaveBeenCalledWith(
      `git clone https://github.com/matter-labs/zksync-hardhat-template ${folderName}`
    );
    expect(runCommandMock).toHaveBeenCalledWith(`cd ${folderName} && rm -rf -r .git`);
    expect(runCommandMock).toHaveBeenCalledWith(`cd ${folderName} && yarn`);
  });

  it("outputs expected logs", async () => {
    await createProject(folderName, {
      template,
    });

    expect(stdOutMock).not.hasConsoleErrors();

    expect(stdOutMock).toBeInConsole(`Creating new project from "Hardhat + Solidity" template at "${folderName}/"`);
    expect(stdOutMock).toBeInConsole("Installing dependencies with yarn...");
    expect(stdOutMock).toBeInConsole("All ready 🎉🎉");
    expect(stdOutMock).toBeInConsole(`Run cd ${folderName} to enter your project folder`);
  });

  it("uses correct template for Vyper template", async () => {
    await createProject(folderName, {
      template: "hardhat_vyper",
    });

    expect(stdOutMock).not.hasConsoleErrors();

    expect(runCommandMock).toHaveBeenCalledWith(
      `git clone https://github.com/matter-labs/zksync-hardhat-vyper-template ${folderName}`
    );
    expect(stdOutMock).toBeInConsole(`Creating new project from "Hardhat + Vyper" template at "${folderName}/"`);
  });
});

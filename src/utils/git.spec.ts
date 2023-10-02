import { cloneRepo } from "./git.js";
import { mockExecute, mockFileOrDirExists } from "../test-utils/mocks.js";

describe("git", () => {
  let runCommandMock: ReturnType<typeof mockExecute>;
  let fileOrDirExistsMock: ReturnType<typeof mockFileOrDirExists>;

  beforeEach(() => {
    runCommandMock = mockExecute();
    fileOrDirExistsMock = mockFileOrDirExists();
  });

  afterEach(() => {
    runCommandMock.mockRestore();
    fileOrDirExistsMock.mockRestore();
  });

  describe("cloneRepo", () => {
    const repoUrl = "https://example.com/repo.git";
    const destination = "local_path/repo";

    it("throws an error if git is not installed", async () => {
      runCommandMock.mockRejectedValue(new Error("Command exited with code 127: git: command not found"));

      await expect(cloneRepo(repoUrl, destination)).rejects.toThrow(
        "Git is not installed. Download: https://git-scm.com"
      );
    });

    it("clones the repository if not already cloned", async () => {
      await cloneRepo(repoUrl, destination);

      expect(runCommandMock).toHaveBeenCalledWith(`git clone ${repoUrl} ${destination}`);
    });

    it("skips cloning if repo is already cloned", async () => {
      fileOrDirExistsMock.mockReturnValue(true);

      await cloneRepo(repoUrl, destination);

      expect(runCommandMock).not.toHaveBeenCalledWith(`git clone ${repoUrl} ${destination}`);
    });
  });
});

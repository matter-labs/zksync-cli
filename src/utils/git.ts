import { fileOrDirExists } from "./files";
import { executeCommand } from "./helpers";
import Logger from "./logger";

let gitInstalled = false;

const checkGitInstallation = async () => {
  if (gitInstalled) return;
  try {
    await executeCommand("git --version", { silent: true });
    gitInstalled = true;
  } catch {
    throw new Error("Git is not installed. Download: https://git-scm.com");
  }
};

export const cloneRepo = async (repoUrl: string, destination: string) => {
  if (fileOrDirExists(destination)) {
    Logger.debug(`${repoUrl} repository is already cloned. Skipping...`);
    return;
  }

  checkGitInstallation();

  const command = `git clone ${repoUrl} ${destination}`;
  Logger.debug(`Cloning ${repoUrl} repository to ${destination}`);
  await executeCommand(command);
};

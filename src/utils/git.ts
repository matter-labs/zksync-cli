import { fileOrDirExists } from "./files.js";
import { executeCommand } from "./helpers.js";
import Logger from "./logger.js";

import type { ExecuteOptions } from "./helpers.js";

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

export const cloneRepo = async (repoUrl: string, destination: string, options?: ExecuteOptions) => {
  if (fileOrDirExists(destination)) {
    Logger.debug(`${repoUrl} repository is already cloned. Skipping...`);
    return;
  }

  await checkGitInstallation();

  const command = `git clone ${repoUrl} ${destination}`;
  Logger.debug(`Cloning ${repoUrl} repository to ${destination}`);
  await executeCommand(command, options);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const gitApiRequest = async (url: string): Promise<any> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`GitHub API request failed with status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to make the GitHub API request: ${error.message}`);
    }
    throw error;
  }
};

export const getLatestReleaseVersion = async (repo: string): Promise<string> => {
  const releaseInfo = await gitApiRequest(`https://api.github.com/repos/${repo}/releases/latest`);
  if (typeof releaseInfo?.tag_name !== "string") {
    throw new Error(`Failed to parse the latest release version: ${JSON.stringify(releaseInfo)}`);
  }
  return releaseInfo.tag_name;
};

export const getLatestCommitHash = async (repo: string): Promise<string> => {
  const commitsInfo = await gitApiRequest(`https://api.github.com/repos/${repo}/commits?per_page=1`);
  if (!commitsInfo?.length) {
    throw new Error(
      `Unable to get the latest commit hash. Latest commit not found. The response: ${JSON.stringify(commitsInfo)}`
    );
  }
  if (typeof commitsInfo[0].sha !== "string") {
    throw new Error(`Failed to parse the latest commit hash: ${JSON.stringify(commitsInfo)}`);
  }
  return commitsInfo[0].sha;
};

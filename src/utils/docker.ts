import path from "path";

import { executeCommand } from "./helpers";
import Logger from "./logger";

let dockerInstalled = false;

const checkDockerInstallation = async () => {
  if (dockerInstalled) return;
  try {
    await executeCommand("docker --version", { silent: true });
    dockerInstalled = true;
  } catch {
    throw new Error("Docker is not installed. Download: https://www.docker.com/get-started/");
  }
};

const getComposeCommandBase = (dockerComposePath: string, projectDir?: string) => {
  return `docker compose -f ${dockerComposePath} --project-directory ${projectDir ?? path.dirname(dockerComposePath)}`;
};
const createComposeCommand = (action: string) => async (dockerComposePath: string, projectDir?: string) => {
  await checkDockerInstallation();
  return await executeCommand(`${getComposeCommandBase(dockerComposePath, projectDir)} ${action}`);
};

type ContainerStatus = "running" | "exited" | "paused" | "restarting" | "dead" | "unknown";
type Container = { Name: string; State: ContainerStatus };
interface ContainerInfo {
  name: string;
  isRunning: boolean;
}
export const composeStatus = async (dockerComposePath: string, projectDir?: string): Promise<ContainerInfo[]> => {
  await checkDockerInstallation();
  let statusJson = (
    await executeCommand(`${getComposeCommandBase(dockerComposePath, projectDir)} ps --format json --all`, {
      silent: true,
    })
  ).trim();

  if (!statusJson.length) {
    return [];
  }
  if (statusJson.startsWith("{") && statusJson.endsWith("}")) {
    statusJson = "[" + statusJson.split("\n").join(",") + "]";
  }

  try {
    const containers = JSON.parse(statusJson) as Array<Container>;

    return containers.map((container) => ({
      name: container.Name,
      isRunning: container.State === "running" || container.State === "restarting",
    }));
  } catch (error) {
    Logger.debug(`Failed to JSON.parse compose status ${dockerComposePath}: ${error?.toString()}`);
    Logger.debug(statusJson);
    return [];
  }
};

export const compose = {
  create: createComposeCommand("create"),
  up: createComposeCommand("up -d"),
  stop: createComposeCommand("stop"),
  down: createComposeCommand("down"),
  status: composeStatus,
};

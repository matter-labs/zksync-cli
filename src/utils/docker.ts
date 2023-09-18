import { executeCommand } from "./helpers";

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

export const composeCreate = async (dockerComposePath: string, projectDir: string) => {
  await checkDockerInstallation();
  await executeCommand(`docker compose -f ${dockerComposePath} --project-directory ${projectDir} create`);
};

export const composeUp = async (dockerComposePath: string, projectDir: string) => {
  await checkDockerInstallation();
  await executeCommand(`docker compose -f ${dockerComposePath} --project-directory ${projectDir} up -d`);
};

export const composeStop = async (dockerComposePath: string, projectDir: string) => {
  await checkDockerInstallation();
  await executeCommand(`docker compose -f ${dockerComposePath} --project-directory ${projectDir} stop`);
};

export const composeDown = async (dockerComposePath: string, projectDir: string) => {
  await checkDockerInstallation();
  await executeCommand(`docker compose -f ${dockerComposePath} --project-directory ${projectDir} down`);
};

export const composeRestart = async (dockerComposePath: string, projectDir: string) => {
  await checkDockerInstallation();
  await executeCommand(`docker compose -f ${dockerComposePath} --project-directory ${projectDir} restart`);
};

type ContainerStatus = "running" | "exited" | "paused" | "restarting" | "dead" | "unknown";
interface ContainerInfo {
  name: string;
  isRunning: boolean;
}
export const composeStatus = async (dockerComposePath: string, projectDir: string): Promise<ContainerInfo[]> => {
  await checkDockerInstallation();
  const statusJson = await executeCommand(
    `docker compose -f ${dockerComposePath} --project-directory ${projectDir} ps --format json --all`,
    { silent: true }
  );
  const containers = JSON.parse(statusJson) as { Name: string; State: ContainerStatus }[];

  return containers.map((container) => ({
    name: container.Name,
    isRunning: container.State === "running" || container.State === "restarting",
  }));
};

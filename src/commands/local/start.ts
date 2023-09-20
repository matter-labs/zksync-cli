import { configExists, getConfig, handler as setupConfig } from "./config";
import { getConfigModules, stopOtherNodes } from "./modules";
import { track } from "../../utils/analytics";
import Logger from "../../utils/logger";

import { local } from "./";

import type Module from "./modules/Module";

const installModules = async (modules: Module[]) => {
  for (const module of modules) {
    if (await module.isInstalled()) {
      Logger.debug(`Module "${module.name}" is already installed. Skipping...`);
      continue;
    }
    Logger.info(`\nInstalling "${module.name}"...`);
    await module.install();
  }
};

const startModules = async (modules: Module[]) => {
  Logger.info(`\nStarting: ${modules.map((m) => m.name).join(", ")}...`);
  await Promise.all(modules.map((m) => m.start()));
};

const triggerOnCompleted = async (modules: Module[]) => {
  Logger.info("\n");
  for (const module of modules) {
    await module.onStartCompleted();
  }
};

export const handler = async () => {
  try {
    if (!configExists()) {
      await setupConfig();
      Logger.info("");
    }

    const config = getConfig();
    Logger.debug(`Local config: ${JSON.stringify(config, null, 2)}`);

    const modules = getConfigModules(config);

    await installModules(modules);
    await stopOtherNodes(config, modules.find((module) => module.tags.includes("node"))!.key);
    await startModules(modules);
    await triggerOnCompleted(modules);
  } catch (error) {
    Logger.error("There was an error while starting the testing environment:");
    Logger.error(error);
    track("error", { error });
  }
};

local.command("start").description("Starts the local zkSync environment and modules").action(handler);

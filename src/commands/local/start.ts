import chalk from "chalk";

import Program from "./command.js";
import { configExists, getConfig, handler as setupConfig } from "./config.js";
import { ModuleCategory } from "./modules/Module.js";
import { getAllModules, getConfigModules } from "./modules/utils/helpers.js";
import { getModulesRequiringUpdates } from "./modules/utils/updates.js";
import { track } from "../../utils/analytics.js";
import { formatLogs } from "../../utils/formatters.js";
import Logger from "../../utils/logger.js";

import type { Config } from "./config.js";
import type Module from "./modules/Module.js";

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

const stopOtherNodes = async (config: Config, currentModules: Module[]) => {
  const modules = await getAllModules(config);
  const currentNodeKeys = currentModules.filter((e) => e.category === ModuleCategory.Node).map((m) => m.package.name);

  for (const module of modules) {
    if (
      module.category === ModuleCategory.Node &&
      !currentNodeKeys.includes(module.package.name) &&
      (await module.isInstalled()) &&
      (await module.isRunning())
    ) {
      Logger.info(`Stopping conflicting node "${module.name}"...`);
      await module.stop();
    }
  }
};

const checkForUpdates = async (modules: Module[]) => {
  const modulesRequiringUpdates = await getModulesRequiringUpdates(modules);
  if (!modulesRequiringUpdates.length) {
    return;
  }

  Logger.info(chalk.yellow("\nModule updates available:"));
  for (const { module, currentVersion, latestVersion } of modulesRequiringUpdates) {
    let str = `${module.name}: ${latestVersion}`;
    if (currentVersion) {
      str += chalk.gray(` (current: ${currentVersion})`);
    }
    str += chalk.gray(` - zksync-cli local update ${module.package.name}`);
    Logger.info(str);
  }
};

const showStartupInfo = async (modules: Module[]) => {
  Logger.info("");
  for (const module of modules) {
    const startupInfo = await module.getStartupInfo();
    if (!startupInfo.length) {
      Logger.info(`${module.name} started.`);
      continue;
    }

    Logger.info(`${module.name} started:`);
    Logger.info(formatLogs(startupInfo, " "));
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

    const modules = await getConfigModules(config);
    if (!modules.length) {
      Logger.warn("Config does not contain any installed modules.");
      Logger.warn("Run `zksync-cli local config` to select which modules to use.");
      return;
    }

    await installModules(modules);
    await stopOtherNodes(config, modules);
    await startModules(modules);
    await checkForUpdates(modules);
    await showStartupInfo(modules);
  } catch (error) {
    Logger.error("There was an error while starting the testing environment:");
    Logger.error(error);
    track("error", { error });
  }
};

Program.command("start").description("Starts the local zkSync environment and modules").action(handler);

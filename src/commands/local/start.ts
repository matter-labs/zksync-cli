import chalk from "chalk";

import Program from "./command.js";
import { handler as setupConfig } from "./config.js";
import configHandler from "./ConfigHandler.js";
import { ModuleCategory } from "./modules/Module.js";
import { getModulesRequiringUpdates } from "./modules/utils/updates.js";
import { track } from "../../utils/analytics.js";
import { formatLogs } from "../../utils/formatters.js";
import Logger from "../../utils/logger.js";

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

const stopOtherNodes = async (currentModules: Module[]) => {
  const modules = await configHandler.getAllModules();
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
    let startedStr = chalk.magentaBright(`${module.name} started`);
    const moduleVersion = module.version;
    if (moduleVersion) {
      startedStr += chalk.gray(` ${moduleVersion}`);
    }
    if (!startupInfo.length) {
      Logger.info(`${startedStr}`);
      continue;
    }

    Logger.info(`${startedStr}:`);
    Logger.info(formatLogs(startupInfo, " "));
  }
};

export const handler = async () => {
  try {
    if (!configHandler.configExists) {
      await setupConfig();
      Logger.info("");
    }

    const modules = await configHandler.getConfigModules();
    if (!modules.length) {
      Logger.warn("Config does not contain any installed modules.");
      Logger.warn("Run `zksync-cli local config` to select which modules to use.");
      return;
    }

    await installModules(modules);
    await stopOtherNodes(modules);
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

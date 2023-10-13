import Program from "./command.js";
import configHandler from "./ConfigHandler.js";
import Logger from "../../utils/logger.js";

import type Module from "./modules/Module.js";

export const cleanModule = async (module: Module) => {
  try {
    const isInstalled = await module.isInstalled();
    if (!isInstalled) {
      return;
    }
    module.removeDataDir();
    await module.clean();
  } catch (error) {
    Logger.error(`There was an error while cleaning module "${module.name}":`);
    Logger.error(error);
  }
};

export const handler = async (modulePackageNames: string[]) => {
  try {
    const modules = [];
    if (modulePackageNames.length) {
      const allModules = await configHandler.getAllModules();
      for (const moduleName of modulePackageNames) {
        const module = allModules.find((m) => m.package.name === moduleName);
        if (!module) {
          throw new Error(`Module "${moduleName}" not found`);
        }
        modules.push(module);
      }
    } else {
      const configModules = await configHandler.getConfigModules();
      modules.push(...configModules);
    }
    Logger.info(`Cleaning: ${modules.map((module) => module.name).join(", ")}...`);
    await Promise.all(modules.map((module) => cleanModule(module)));
  } catch (error) {
    Logger.error("There was an error while cleaning the testing environment:");
    Logger.error(error);
  }
};

Program.command("clean")
  .description("Clean data for all config modules")
  .argument("[module...]", "NPM package names of the modules to clean")
  .action(handler);

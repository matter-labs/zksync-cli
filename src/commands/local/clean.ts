import Program from "./command.js";
import configHandler from "./ConfigHandler.js";
import { track } from "../../utils/analytics.js";
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

export const handler = async () => {
  try {
    const modules = await configHandler.getConfigModules();
    Logger.info(`Cleaning: ${modules.map((module) => module.name).join(", ")}...`);
    await Promise.all(modules.map((module) => cleanModule(module)));
  } catch (error) {
    Logger.error("There was an error while cleaning the testing environment:");
    Logger.error(error);
    track("error", { error });
  }
};

Program.command("clean").description("Cleans data for all config modules").action(handler);

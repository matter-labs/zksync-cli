import chalk from "chalk";

import { track } from "../../../utils/analytics.js";
import Logger from "../../../utils/logger.js";
import Program from "../command.js";
import configHandler from "../ConfigHandler.js";

export const handler = async () => {
  try {
    const modules = await configHandler.getAllModules();
    if (!modules.length) {
      Logger.warn("There are no modules installed");
      Logger.info("You can install modules with: `zksync-cli dev install [module-name...]");
      return;
    }

    Logger.info("Installed modules:");
    for (const module of modules) {
      let logStr = `"${module.name}"`;
      const moduleVersion = module.version;
      if (moduleVersion) {
        logStr += ` ${moduleVersion}`;
      }
      logStr += chalk.blue(` - ${module.package.name}${chalk.gray("@" + module.package.version)}`);
      if (module.package.symlinked) {
        logStr += chalk.blue(" (installed via --link)");
      }
      Logger.info(logStr, { noFormat: true });
    }
  } catch (error) {
    Logger.error("There was an error displaying installed modules:");
    Logger.error(error);
    track("error", { error });
  }
};

Program.command("modules").description("Displays list of installed modules").action(handler);

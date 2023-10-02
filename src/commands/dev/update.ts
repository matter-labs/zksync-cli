import { Option } from "commander";

import Program from "./command.js";
import configHandler from "./ConfigHandler.js";
import { modulesPath } from "./modules/Module.js";
import { track } from "../../utils/analytics.js";
import { executeCommand } from "../../utils/helpers.js";
import Logger from "../../utils/logger.js";

const packageOption = new Option("--package", "Update NPM package instead of module");

type ModuleUpdateOptions = {
  package?: boolean;
};

export const handler = async (moduleNames: string[], options: ModuleUpdateOptions = {}) => {
  try {
    if (options.package) {
      Logger.info(`Updating NPM packages: ${moduleNames.join(", ")}`);
      const fullCommand = `npm update${moduleNames.length ? ` ${moduleNames.join(" ")}` : ""}`;

      await executeCommand(fullCommand, { cwd: modulesPath });
    } else {
      if (moduleNames.length > 1) {
        Logger.info(`Modules to update: ${moduleNames.join(", ")}`);
      }
      const modules = await configHandler.getAllModules();
      for (const moduleName of moduleNames) {
        Logger.info("");
        const module = modules.find((module) => module.package.name === moduleName);
        if (!module) {
          Logger.error(`Module "${moduleName}" is not installed`);
          continue;
        }

        try {
          const currentVersion = module.version;
          const latestVersion = await module.getLatestVersion();

          if (currentVersion === latestVersion) {
            Logger.info(`Module "${moduleName}" is already up to date`);
            continue;
          } else if (!latestVersion) {
            Logger.error(`Latest version wasn't found for module "${moduleName}"`);
            continue;
          }

          Logger.info(
            `Updating module "${moduleName}"${currentVersion && " from " + currentVersion} to ${latestVersion}`
          );
          await module.update();
        } catch (error) {
          Logger.error(`There was an error while updating module "${moduleName}":`);
          Logger.error(error);
          continue;
        }
      }
    }
  } catch (error) {
    Logger.error("There was an error while updating module:");
    Logger.error(error);
    track("error", { error });
  }
};

Program.command("update")
  .argument("[module...]", "NPM package name of the module to update")
  .description("Update installed module")
  .addOption(packageOption)
  .action(handler);

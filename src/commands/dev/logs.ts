import chalk from "chalk";

import Program from "./command.js";
import configHandler from "./ConfigHandler.js";
import Logger from "../../utils/logger.js";

export const handler = async () => {
  try {
    const modules = await configHandler.getConfigModules();
    if (!modules.length) {
      Logger.warn("There are no configured modules");
      Logger.info("You can configure them with: `zksync-cli dev config");
      return;
    }

    for (const module of modules) {
      try {
        Logger.info(`\n${module.name}:`);
        if (!(await module.isInstalled())) {
          Logger.info("Module is not installed");
          continue;
        }
        const logs = await module.getLogs();
        if (Array.isArray(logs) && logs.length) {
          Logger.info(logs.join("\n"), { noFormat: true });
        } else {
          Logger.info(chalk.gray("No logs to display"));
        }
      } catch (error) {
        Logger.error(`There was an error displaying logs: ${error?.toString()}`);
      }
    }
  } catch (error) {
    Logger.error("There was an error displaying logs:");
    Logger.error(error);
  }
};

Program.command("logs").description("Show logs for configured modules").action(handler);

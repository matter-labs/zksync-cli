import chalk from "chalk";

import Program from "./command.js";
import configHandler from "./ConfigHandler.js";
import { track } from "../../utils/analytics.js";
import Logger from "../../utils/logger.js";

export const handler = async () => {
  try {
    const modules = await configHandler.getConfigModules();
    if (!modules.length) {
      Logger.warn("There are no configured modules");
      Logger.info("You can configure them with: `zksync-cli local config");
      return;
    }

    for (const module of modules) {
      try {
        Logger.info("");
        const logs = await module.getLogs();
        Logger.info(`${module.name}:`);
        if (Array.isArray(logs) && logs.length) {
          Logger.info(logs.join("\n"), { noFormat: true });
        } else {
          Logger.info(chalk.gray("No logs to display"));
        }
      } catch (error) {
        Logger.error(`There was an error displaying logs for module "${module.name}":`);
        Logger.error(error);
      }
    }
  } catch (error) {
    Logger.error("There was an error displaying logs:");
    Logger.error(error);
    track("error", { error });
  }
};

Program.command("logs").description("Displays logs for configured modules").action(handler);

import chalk from "chalk";

import { getModulePackages } from "./utils/packages.js";
import { track } from "../../../utils/analytics.js";
import Logger from "../../../utils/logger.js";
import Program from "../command.js";

export const handler = async () => {
  try {
    const modules = await getModulePackages();
    Logger.info("Installed modules:");
    for (const module of modules) {
      let logStr = `${module.name}${chalk.gray("@" + module.version)}`;
      if (module.symlinked) {
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

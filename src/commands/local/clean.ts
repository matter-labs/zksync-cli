import Program from "./command.js";
import { getConfig } from "./config.js";
import { getConfigModules } from "./modules/index.js";
import { track } from "../../utils/analytics.js";
import Logger from "../../utils/logger.js";

export const handler = async () => {
  try {
    const config = getConfig();
    Logger.debug(`Local config: ${JSON.stringify(config, null, 2)}`);

    const modules = getConfigModules(config);
    Logger.info(`Cleaning: ${modules.map((m) => m.name).join(", ")}...`);
    await Promise.all(modules.map((m) => m.isInstalled().then((installed) => (installed ? m.clean() : undefined))));
  } catch (error) {
    Logger.error("There was an error while cleaning the testing environment:");
    Logger.error(error);
    track("error", { error });
  }
};

Program.command("clean").description("Cleans data for all config modules").action(handler);

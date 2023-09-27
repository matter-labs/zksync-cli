import Program from "./command.js";
import { getConfig } from "./config.js";
import { getConfigModules } from "./modules/utils/helpers.js";
import { track } from "../../utils/analytics.js";
import Logger from "../../utils/logger.js";

export const handler = async () => {
  try {
    const config = getConfig();
    Logger.debug(`Local config: ${JSON.stringify(config, null, 2)}`);

    const modules = await getConfigModules(config);
    Logger.info(`Stopping: ${modules.map((m) => m.name).join(", ")}...`);
    await Promise.all(modules.map((m) => m.isInstalled().then((installed) => (installed ? m.stop() : undefined))));
  } catch (error) {
    Logger.error("There was an error while stopping the testing environment:");
    Logger.error(error);
    track("error", { error });
  }
};

Program.command("stop").description("Stops the local zkSync environment and modules").action(handler);

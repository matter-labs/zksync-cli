import { getConfig } from "./config";
import { getConfigModules } from "./modules";
import { track } from "../../utils/analytics";
import Logger from "../../utils/logger";

import { local } from ".";

export const handler = async () => {
  try {
    const config = getConfig();
    Logger.debug(`Local config: ${JSON.stringify(config, null, 2)}`);

    const modules = getConfigModules(config);
    Logger.info(`Cleaning: ${modules.map((m) => m.name).join(", ")}...`);
    await Promise.all(modules.map((m) => m.isInstalled().then((installed) => (installed ? m.clean() : undefined))));
  } catch (error) {
    Logger.error("There was an error while stopping the testing environment:");
    Logger.error(error);
    track("error", { error });
  }
};

local.command("clean").description("Stops the local zkSync environment and modules").action(handler);

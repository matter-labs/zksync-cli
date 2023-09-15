import { Option } from "commander";

import { getConfig } from "./config";
import { getConfigModules } from "./modules";
import { track } from "../../utils/analytics";
import Logger from "../../utils/logger";

import { local } from ".";

const allOption = new Option("--all", "Node type to use");
type LocalStopOptions = {
  all?: true;
};

export const handler = async (options: LocalStopOptions) => {
  try {
    Logger.debug(`Local stop options: ${JSON.stringify(options, null, 2)}`);

    const config = getConfig();
    Logger.debug(`Local config: ${JSON.stringify(config, null, 2)}`);

    const modules = getConfigModules(config);
    Logger.info(`Stopping: ${modules.map((m) => m.name).join(", ")}...`);
    await Promise.all(modules.map((m) => m.stop()));
  } catch (error) {
    Logger.error("There was an error while stopping the testing environment:");
    Logger.error(error);
    track("error", { error });
  }
};

local
  .command("stop")
  .description("Stops the local zkSync environment and modules")
  .addOption(allOption)
  .action(handler);

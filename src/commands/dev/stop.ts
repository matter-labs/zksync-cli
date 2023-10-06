import Program from "./command.js";
import configHandler from "./ConfigHandler.js";
import { track } from "../../utils/analytics.js";
import Logger from "../../utils/logger.js";

export const handler = async () => {
  try {
    const modules = await configHandler.getConfigModules();
    Logger.info(`Stopping: ${modules.map((m) => m.name).join(", ")}...`);
    await Promise.all(modules.map((m) => m.isInstalled().then((installed) => (installed ? m.stop() : undefined))));
  } catch (error) {
    Logger.error("There was an error while stopping the testing environment:");
    Logger.error(error);
    track("error", { error });
  }
};

Program.command("stop").description("Stop local zkSync environment and modules").action(handler);

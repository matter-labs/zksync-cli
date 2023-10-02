import Program from "./command.js";
import { handler as start } from "./start.js";
import { handler as stop } from "./stop.js";
import { track } from "../../utils/analytics.js";
import Logger from "../../utils/logger.js";

export const handler = async () => {
  try {
    await stop();
    await start();
  } catch (error) {
    Logger.error("There was an error while restarting the testing environment:");
    Logger.error(error);
    track("error", { error });
  }
};

Program.command("restart").description("Restarts the local zkSync environment and modules").action(handler);

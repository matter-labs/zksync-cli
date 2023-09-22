import { handler as start } from "./start";
import { handler as stop } from "./stop";
import { track } from "../../utils/analytics";
import Logger from "../../utils/logger";

import { local } from ".";

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

local.command("restart").description("Restarts the local zkSync environment and modules").action(handler);

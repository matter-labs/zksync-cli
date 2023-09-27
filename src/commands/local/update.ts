import Program from "./command.js";
import { modulesPath } from "./modules/utils/packages.js";
import { track } from "../../utils/analytics.js";
import { executeCommand } from "../../utils/helpers.js";
import Logger from "../../utils/logger.js";

export const handler = async (moduleNames: string[]) => {
  try {
    const fullCommand = `npm update${moduleNames.length ? ` ${moduleNames.join(" ")}` : ""}`;

    await executeCommand(fullCommand, { cwd: modulesPath });
  } catch (error) {
    Logger.error("There was an error while updating module:");
    Logger.error(error);
    track("error", { error });
  }
};

Program.command("update")
  .argument("[module...]", "NPM package name of the module to update")
  .description("Update module with NPM")
  .action(handler);

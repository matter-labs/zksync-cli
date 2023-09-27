import { Option } from "commander";

import Program from "./command.js";
import { modulesPath } from "./modules/utils/packages.js";
import { track } from "../../utils/analytics.js";
import { executeCommand } from "../../utils/helpers.js";
import Logger from "../../utils/logger.js";

const unlinkOption = new Option(
  "--unlink",
  "Use `npm unlink` instead of `npm uninstall` (useful during module development)"
);

export const handler = async (moduleNames: string[], options: { unlink: boolean }) => {
  try {
    const command = options.unlink ? "npm unlink" : "npm uninstall";
    const fullCommand = `${command}${moduleNames.length ? ` ${moduleNames.join(" ")}` : ""}`;

    await executeCommand(fullCommand, { cwd: modulesPath });
  } catch (error) {
    Logger.error("There was an error while uninstalling module:");
    Logger.error(error);
    track("error", { error });
  }
};

Program.command("uninstall")
  .argument("[module...]", "NPM package name of the module to uninstall")
  .description("Uninstall module with NPM")
  .addOption(unlinkOption)
  .action(handler);

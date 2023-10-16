import { Command } from "commander";
import { compare } from "compare-versions";
import { readFileSync } from "fs";
import path from "path";

import { getDirPath } from "./utils/files.js";
import Logger from "./utils/logger.js";
import { getNodeVersion } from "./utils/node.js";

const Package: {
  name: string;
  description: string;
  version: string;
} = JSON.parse(readFileSync(path.join(getDirPath(import.meta.url), "../package.json"), "utf-8"));

const program = new Command();
program.name(Package.name).description(Package.description).version(Package.version).showHelpAfterError();
program.hook("preAction", async () => {
  const nodeVersion = await getNodeVersion();
  const minimumNodeVersion = "18.0.0";
  try {
    if (compare(nodeVersion, minimumNodeVersion, "<")) {
      Logger.error("Minimum Node.js version required: v18.x");
      Logger.error(`Current version: v${nodeVersion}`);
      process.exit(1);
    }
  } catch (error) {
    Logger.warn(`Failed to check Node.js version. Make sure you are using version ${minimumNodeVersion} or higher`);
  }
});

export default program;

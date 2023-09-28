import { Command } from "commander";
import { readFileSync } from "fs";
import path from "path";

import { getDirPath } from "./utils/files.js";

const Package: {
  name: string;
  description: string;
  version: string;
} = JSON.parse(readFileSync(path.join(getDirPath(import.meta.url), "../package.json"), "utf-8"));

const program = new Command();
program.name(Package.name).description(Package.description).version(Package.version).showHelpAfterError();

export default program;

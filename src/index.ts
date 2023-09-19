#! /usr/bin/env node
import { Command } from "commander";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Package from "../package.json";

export const program = new Command();
program.name(Package.name).description(Package.description).version(Package.version).showHelpAfterError();

import "./commands/deposit";
import "./commands/withdraw";
import "./commands/withdraw-finalize";
import "./commands/create-project";
import "./commands/local";

program.parse();

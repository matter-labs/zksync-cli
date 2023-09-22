#! /usr/bin/env node
import Program from "./program";

import "./commands/deposit";
import "./commands/withdraw";
import "./commands/withdraw-finalize";
import "./commands/create-project";
import "./commands/local";

Program.parse();

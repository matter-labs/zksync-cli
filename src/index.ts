#! /usr/bin/env node
import Program from "./program.js";

import "./commands/dev/index.js";
import "./commands/deposit.js";
import "./commands/withdraw.js";
import "./commands/withdraw-finalize.js";
import "./commands/create-project.js";

Program.parse();

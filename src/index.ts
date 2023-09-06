#! /usr/bin/env node

import { program } from "./setup";

import "./commands/deposit";
import "./commands/withdraw";
import "./commands/withdraw-finalize";
import "./commands/create-project";

program.parse();

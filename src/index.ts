import { program } from "./setup";

import "./commands/deposit";
import "./commands/withdraw";
import "./commands/withdraw-finalize";

program.parse();

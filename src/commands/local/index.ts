import { program } from "../../";

export const local = program.command("local").description("All-in-one tool for local zkSync development");

import "./config";
import "./start";
import "./stop";
import "./clean";

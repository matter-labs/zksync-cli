import Program from "../../program";

export const local = Program.command("local").description("All-in-one tool for local zkSync development");

import "./config";
import "./start";
import "./restart";
import "./stop";
import "./clean";

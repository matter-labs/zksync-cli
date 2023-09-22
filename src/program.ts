import { Command } from "commander";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Package from "../package.json";

const program = new Command();
program.name(Package.name).description(Package.description).version(Package.version).showHelpAfterError();

export default program;

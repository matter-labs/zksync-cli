import chalk, { Chalk } from "chalk";
import { format, createLogger, transports } from "winston";

import { hasColor } from "./helpers.js";

export const errorSymbol = "ⓘ"; // used in ../test-utils/matchers.ts to check for errors in console output

export type LogLevelToColorMap = Record<string, Chalk | ((msg: string) => string)>;

const logLevelToColorMap: LogLevelToColorMap = {
  error: (msg: string) => chalk.redBright(`${errorSymbol} ${msg}`),
  warn: chalk.yellowBright,
  info: chalk.magentaBright,
  debug: chalk.gray,
};

const styleLogs = format.printf((info) => {
  if (hasColor(info.message) || info.noFormat) {
    return info.message;
  }

  const colorize = logLevelToColorMap[info.level];
  return colorize ? colorize(info.message) : info.message;
});

const logger = createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  format: format.combine(styleLogs),
  transports: [new transports.Console()],
});

export default logger;

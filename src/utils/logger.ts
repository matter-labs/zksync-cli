import chalk from "chalk";
import { format, createLogger, transports } from "winston";

export const errorSymbol = "ⓘ"; // used in ../test-utils/matchers.ts to check for errors in console output

const styleLogs = format.printf((info) => {
  if (info.noFormat) {
    return info.message;
  }
  if (info.level === "error") {
    return chalk.redBright(`${errorSymbol} ${info.message}`);
  } else if (info.level === "warn") {
    return chalk.yellowBright(info.message);
  } else if (info.level === "info") {
    return chalk.magentaBright(info.message);
  } else if (info.level === "debug") {
    return chalk.gray(info.message);
  }
  return info.message;
});

const logger = createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  format: format.combine(styleLogs),
  transports: [new transports.Console()],
});

export default logger;

import chalk from "chalk";
import { format, createLogger, transports } from "winston";

import { track } from "./analytics";

const trackErrorsFormat = format((info) => {
  if (info.level === "error") {
    track("error", { error: info.message });
  }
  return info;
});
const styleLogs = format.printf((info) => {
  if (info.level === "error") {
    return chalk.redBright("ⓘ " + info.message);
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
  format: format.combine(trackErrorsFormat(), styleLogs),
  transports: [new transports.Console()],
});

export default logger;

import logger from "../utils/logger";

export default async () => {
  logger.info("Hello, world!");
  await new Promise((resolve) => setTimeout(resolve, 100));
  logger.info("Sup!");
};

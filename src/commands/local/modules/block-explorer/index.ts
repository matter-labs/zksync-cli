import Logger from "../../../../utils/logger.js";
import Module from "../Module.js";

import type { Config } from "../../config.js";

export default class SetupModule extends Module {
  constructor(config: Config) {
    super(
      {
        name: "Block Explorer",
        description: "Includes explorer UI and API",
        key: "explorer",
        tags: ["service", "explorer"],
      },
      config
    );
  }

  async isInstalled() {
    return true;
  }

  async install() {}

  async isRunning() {
    return false;
  }

  async start() {
    Logger.warn("Block explorer is not implemented yet");
  }

  async stop() {}

  async clean() {}
}

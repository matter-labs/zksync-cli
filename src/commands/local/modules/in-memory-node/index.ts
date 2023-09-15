import { Module } from "..";
import { executeCommand } from "../../../../utils/helpers";
import Logger from "../../../../utils/logger";

import type { Config } from "../../config";

export default class SetupModule extends Module {
  constructor(config: Config) {
    super(
      {
        name: "In memory node",
        description: "Quick startup, no persisted state, only L2 node",
        key: "in-memory-node",
        tags: ["node"],
      },
      config
    );
  }

  async isInstalled() {
    try {
      await executeCommand("era_test_node -V", { silent: true });
      return true;
    } catch {
      return false;
    }
  }

  async install() {
    Logger.warn("Not implemented yet");
  }

  async isRunning() {
    return false;
  }

  async start() {}

  async onStartCompleted() {
    Logger.warn(`${this.name}: please start manually with \`era_test_node run\``);
  }

  async stop() {}

  async clean() {
    this.stop();
  }

  async restart() {
    this.stop();
    this.start();
  }
}

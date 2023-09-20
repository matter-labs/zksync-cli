import chalk from "chalk";
import path from "path";

import { Module } from "..";
import { compose } from "../../../../utils/docker";
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

  composeFile = path.join(__dirname, "docker-compose-binary.yml");

  async isInstalled() {
    return (await compose.status(this.composeFile)).length ? true : false;
  }

  async install() {
    await compose.create(this.composeFile);
  }

  async isRunning() {
    return (await compose.status(this.composeFile)).some(({ isRunning }) => isRunning);
  }

  async start() {
    await compose.up(this.composeFile);
  }

  async onStartCompleted() {
    Logger.info(`${this.name} ready:`);
    Logger.info(
      chalk.blue(` - zkSync Node (L2):
    - Chain ID: 260
    - RPC URL: http://localhost:8011`),
      { noFormat: true }
    );
    Logger.warn(" - Note: every restart will necessitate a reset of MetaMask's cached account data");
  }

  async stop() {
    await compose.stop(this.composeFile);
  }

  async clean() {
    await compose.down(this.composeFile);
  }
}

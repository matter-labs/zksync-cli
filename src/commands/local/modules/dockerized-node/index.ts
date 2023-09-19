import path from "path";

import { Module } from "..";
import {
  composeCreate,
  composeDown,
  composeRestart,
  composeStatus,
  composeStop,
  composeUp,
} from "../../../../utils/docker";
import { fileOrDirExists } from "../../../../utils/files";
import { cloneRepo } from "../../../../utils/git";
import Logger from "../../../../utils/logger";

import type { Config } from "../../config";

export default class SetupModule extends Module {
  constructor(config: Config) {
    super(
      {
        name: "Dockerized node",
        description: "Persistent state, includes L1 and L2 nodes",
        key: "dockerized-node",
        tags: ["node"],
      },
      config
    );
  }

  justInstalled = false;

  git = "https://github.com/matter-labs/local-setup.git";
  composeFile = path.join(this.dataDirPath, "docker-compose.yml");

  async isInstalled() {
    if (!fileOrDirExists(this.dataDirPath)) return false;
    return (await composeStatus(this.composeFile, this.dataDirPath)).length ? true : false;
  }

  async install() {
    await cloneRepo(this.git, this.dataDirPath);
    await composeCreate(this.composeFile, this.dataDirPath);
    this.justInstalled = true;
  }

  async isRunning() {
    return (await composeStatus(this.composeFile, this.dataDirPath)).some(({ isRunning }) => isRunning);
  }

  async start() {
    await composeUp(this.composeFile, this.dataDirPath);
  }

  async onStartCompleted() {
    Logger.info(`${this.name} ready:
 - zkSync Node (L2):
    - Chain ID: 270
    - RPC URL: http://localhost:3050
 - Ethereum Node (L1):
    - Chain ID: 9
    - RPC URL: http://localhost:8545
 - Rich accounts: ${path.join(this.dataDirPath, "rich-wallets.json")}`);
    if (this.justInstalled) {
      Logger.warn(" - First start may take a while until zkSync node is actually running, please be patient...");
    }
  }

  async stop() {
    await composeStop(this.composeFile, this.dataDirPath);
  }

  async clean() {
    await composeDown(this.composeFile, this.dataDirPath);
  }

  async restart() {
    await composeRestart(this.composeFile, this.dataDirPath);
  }
}

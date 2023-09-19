import path from "path";

import { Module } from "..";
import { compose } from "../../../../utils/docker";
import Logger from "../../../../utils/logger";

import type { Config } from "../../config";

export default class SetupModule extends Module {
  constructor(config: Config) {
    super(
      {
        name: "Portal",
        description: "DApp with Wallet and Bridge functionality",
        key: "portal",
        tags: ["dapp"],
      },
      config
    );
  }

  private composeFiles = {
    "dockerized-node": path.join(__dirname, "docker-compose-dockerized-node.yml"),
    "in-memory-node": path.join(__dirname, "docker-compose-in-memory-node.yml"),
  };
  get composeFile() {
    return this.config.modules.some((module) => module === "in-memory-node")
      ? this.composeFiles["in-memory-node"]
      : this.composeFiles["dockerized-node"];
  }

  isContainerRunning = async () => {
    const composeFileKey = Object.entries(this.composeFiles).find(([, composeFilePath]) => {
      return composeFilePath === this.composeFile;
    })![0];
    const containers = await compose.status(this.composeFile);
    for (const { name, isRunning } of containers) {
      if (name.includes(composeFileKey)) {
        return isRunning;
      }
    }
    return undefined;
  };

  async isInstalled() {
    return (await this.isContainerRunning()) === undefined ? false : true;
  }

  async install() {
    await compose.create(this.composeFile);
  }

  async isRunning() {
    return Boolean(await this.isContainerRunning());
  }

  async start() {
    for (const composeFilePath of Object.values(this.composeFiles)) {
      if (composeFilePath !== this.composeFile) {
        await compose.stop(composeFilePath);
      }
    }
    await compose.up(this.composeFile);
  }

  async onStartCompleted() {
    let info = `${this.name} ready:`;
    info += "\n - Wallet: http://localhost:3000/";
    if (this.composeFile === this.composeFiles["dockerized-node"]) {
      info += "\n - Bridge: http://localhost:3000/bridge";
    }
    Logger.info(info);
  }

  async stop() {
    await Promise.all(Object.values(this.composeFiles).map((composeFilePath) => compose.stop(composeFilePath)));
  }

  async clean() {
    await Promise.all(Object.values(this.composeFiles).map((composeFilePath) => compose.down(composeFilePath)));
  }
}

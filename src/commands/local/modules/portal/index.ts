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
import { cloneRepo, isRepoCloned } from "../../../../utils/git";
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

  git = "https://github.com/matter-labs/dapp-portal.git";
  private composeFiles = {
    "dockerized-node": path.join(__dirname, "docker-compose-dockerized-node.yml"),
    "in-memory-node": path.join(__dirname, "docker-compose-in-memory-node.yml"),
  };
  get composeFile() {
    return this.config.modules.find((module) => module === "in-memory-node")
      ? this.composeFiles["in-memory-node"]
      : this.composeFiles["dockerized-node"];
  }

  getStatusOfCurrentContainer = async () => {
    const composeFileKey = Object.entries(this.composeFiles).find(([, composeFilePath]) => {
      return composeFilePath === this.composeFile;
    })![0];
    const containers = await composeStatus(this.composeFile, this.folder);
    for (const { name, status } of containers) {
      if (name.includes(composeFileKey)) {
        return status;
      }
    }
    return undefined;
  };

  async isInstalled() {
    if (!isRepoCloned(this.folder)) return false;
    return (await this.getStatusOfCurrentContainer()) ? true : false;
  }

  async install() {
    await cloneRepo(this.git, this.folder);
    await composeCreate(this.composeFile, this.folder);
  }

  async isRunning() {
    if (await this.isInstalled()) return false;

    const status = await this.getStatusOfCurrentContainer();
    switch (status) {
      case "running":
      case "restarting":
        return true;

      default:
        return false;
    }
  }

  async start() {
    for (const composeFilePath of Object.values(this.composeFiles)) {
      if (composeFilePath !== this.composeFile) {
        await composeStop(composeFilePath, this.folder);
      }
    }
    await composeUp(this.composeFile, this.folder);
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
    if (!(await this.isInstalled())) return;
    await Promise.all(
      Object.values(this.composeFiles).map((composeFilePath) => composeStop(composeFilePath, this.folder))
    );
  }

  async clean() {
    if (!(await this.isInstalled())) return;
    await Promise.all(
      Object.values(this.composeFiles).map((composeFilePath) => composeDown(composeFilePath, this.folder))
    );
  }

  async restart() {
    if (!(await this.isInstalled())) return;
    await composeRestart(this.composeFile, this.folder);
  }
}

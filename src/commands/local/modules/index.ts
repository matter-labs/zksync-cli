/* eslint-disable import/order */
import { getLocalPath } from "../../../utils/files";
import Logger from "../../../utils/logger";

import type { Config } from "../config";

type DefaultModuleFields = {
  name: string;
  description: string;
  key: string;
  tags: Array<"node" | "dapp" | "explorer" | "service">;
};
export abstract class Module {
  config: Config;

  name: DefaultModuleFields["name"];
  description: DefaultModuleFields["description"];
  key: DefaultModuleFields["key"];
  tags: DefaultModuleFields["tags"];

  get folder() {
    return getLocalPath(this.key);
  }

  abstract isInstalled(): Promise<boolean>;
  abstract install(): Promise<void>;
  abstract isRunning(): Promise<boolean>;
  abstract start(): Promise<void>;
  async onStartCompleted(): Promise<void> {} // Optional method
  abstract stop(): Promise<void>;
  abstract clean(): Promise<void>;
  abstract restart(): Promise<void>;

  constructor(data: DefaultModuleFields, config: Config) {
    this.name = data.name;
    this.description = data.description;
    this.key = data.key;
    this.tags = data.tags;
    this.config = config;
  }
}

import BlockExplorer from "./block-explorer";
import DockerizedNode from "./dockerized-node";
import InMemoryNode from "./in-memory-node";
import Portal from "./portal";

const getAllModules = (config?: Config) => {
  const emptyConfig: Config = { modules: [] };
  return [DockerizedNode, InMemoryNode, BlockExplorer, Portal].map((module) => new module(config ?? emptyConfig));
};

export const getModulesMeta = () => {
  return getAllModules().map((module) => ({
    name: module.name,
    description: module.description,
    key: module.key,
    tags: module.tags,
  }));
};

export const getConfigModules = (config: Config) => {
  return getAllModules(config).filter((module) => config.modules.includes(module.key));
};

export const stopOtherNodes = async (config: Config, currentNodeKey: string) => {
  const modules = getAllModules(config);
  for (const module of modules) {
    if (module.tags.includes("node") && module.key !== currentNodeKey && (await module.isRunning())) {
      Logger.info(`Stopping conflicting node "${module.name}"...`);
      await module.stop();
    }
  }
};

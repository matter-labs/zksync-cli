import BlockExplorer from "./block-explorer";
import DockerizedNode from "./dockerized-node";
import InMemoryNode from "./in-memory-node";
import Portal from "./portal";
import Logger from "../../../utils/logger";

import type { Config } from "../config";

const getAllModules = (config?: Config) => {
  const emptyConfig: Config = { modules: [] };
  return [InMemoryNode, DockerizedNode, BlockExplorer, Portal].map((module) => new module(config ?? emptyConfig));
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
    if (
      module.tags.includes("node") &&
      module.key !== currentNodeKey &&
      (await module.isInstalled()) &&
      (await module.isRunning())
    ) {
      Logger.info(`Stopping conflicting node "${module.name}"...`);
      await module.stop();
    }
  }
};

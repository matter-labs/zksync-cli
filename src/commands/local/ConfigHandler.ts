import { readFileSync } from "fs";

import { ModuleCategory } from "./modules/Module.js";
import { getModulePackages } from "./modules/utils/packages.js";
import { fileOrDirExists, getLocalPath, writeFile } from "../../utils/files.js";
import Logger from "../../utils/logger.js";

import type { ModuleNode } from "./modules/Module.js";
import type Module from "./modules/Module.js";

type ConfigJSON = {
  modules: string[];
};

class ConfigHandlerClass {
  configPath = getLocalPath("config.json");

  get configExists() {
    return fileOrDirExists(this.configPath);
  }
  get config(): ConfigJSON {
    const emptyConfig = {
      modules: [],
    };
    try {
      return this.configExists ? JSON.parse(readFileSync(this.configPath, "utf-8")) : emptyConfig;
    } catch (error) {
      Logger.error(`Error while reading config file: ${error}`);
      return emptyConfig;
    }
  }
  set config(data: ConfigJSON) {
    writeFile(this.configPath, JSON.stringify(data, null, 2));
    Logger.debug(`Saved config to ${this.configPath}`);
    Logger.debug(`Config: ${JSON.stringify(data, null, 2)}`);
  }

  async getAllModules() {
    const installedModules = await getModulePackages();
    return installedModules.map((modulePackage) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const module = modulePackage.module as any;
      const newModule: Module = new module(this.config);
      newModule.package = {
        name: modulePackage.name,
        version: modulePackage.version,
        symlinked: modulePackage.symlinked ?? false,
      };
      return newModule;
    });
  }
  async getConfigModules() {
    return (await this.getAllModules()).filter((module) => this.config.modules.includes(module.package.name));
  }

  async getNodeInfo() {
    const modules = await this.getAllModules();
    const node = modules.find((module) => module.category === ModuleCategory.Node);
    if (!node) {
      throw new Error("No node module found");
    }
    return (node as ModuleNode).nodeInfo;
  }
}

const configHandler = new ConfigHandlerClass();

export type ConfigHandler = typeof configHandler;
export default configHandler;

import fs from "fs";
import path from "path";

import { fileOrDirExists, getLocalPath, writeFile } from "../../../utils/files.js";
import Logger from "../../../utils/logger.js";

import type { LogEntry } from "../../../utils/formatters.js";
import type { ConfigHandler } from "../ConfigHandler.js";

export enum ModuleCategory {
  Node = "node",
  Dapp = "dapp",
  Explorer = "explorer",
  Service = "service",
  Other = "other",
}
export type DefaultModuleFields = {
  name: string;
  description: string;
  category: ModuleCategory;
};

export const modulesPath = getLocalPath("modules");

type ModuleConfigDefault = Record<string, unknown>;
abstract class Module<TModuleConfig = ModuleConfigDefault> {
  configHandler: ConfigHandler;

  name: DefaultModuleFields["name"];
  description: DefaultModuleFields["description"];
  category: DefaultModuleFields["category"];

  package = {
    name: "",
    version: "",
    symlinked: false,
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isNodeSupported(_: NodeInfo): boolean | Promise<boolean> {
    return true;
  }
  abstract isInstalled(): Promise<boolean>;
  abstract install(): Promise<void>;

  abstract isRunning(): Promise<boolean>;
  abstract start(): Promise<void>;
  getStartupInfo(): LogEntry[] | Promise<LogEntry[]> {
    return [];
  }

  async getLogs(): Promise<void | string[]> {}

  get version(): string | undefined {
    return;
  }
  async getLatestVersion(): Promise<string | undefined> {
    return;
  }
  async update(): Promise<void> {}

  abstract stop(): Promise<void>;
  abstract clean(): Promise<void>;

  get dataDirPath() {
    return path.join(modulesPath, this.package.name);
  }
  get configPath() {
    return path.join(this.dataDirPath, "config.json");
  }

  get moduleConfig(): TModuleConfig {
    if (!fileOrDirExists(this.configPath)) {
      return {} as TModuleConfig;
    } else {
      try {
        return JSON.parse(fs.readFileSync(this.configPath, { encoding: "utf-8" }));
      } catch (error) {
        Logger.error(`There was an error while reading config file for module "${this.name}":`);
        return {} as TModuleConfig;
      }
    }
  }
  setModuleConfig(config: TModuleConfig) {
    writeFile(this.configPath, JSON.stringify(config, null, 2));
  }
  removeDataDir() {
    if (fileOrDirExists(this.dataDirPath)) {
      fs.rmSync(this.dataDirPath, { recursive: true });
    }
  }

  constructor(data: DefaultModuleFields, configHandler: ConfigHandler) {
    this.name = data.name;
    this.description = data.description;
    this.category = data.category;
    this.configHandler = configHandler;
  }
}
export default Module;

export type NodeInfo = {
  l1?: {
    chainId: number;
    rpcUrl: string;
  };
  l2: {
    chainId: number;
    rpcUrl: string;
  };
};
export abstract class ModuleNode<TModuleConfig = ModuleConfigDefault> extends Module<TModuleConfig> {
  abstract get nodeInfo(): NodeInfo;

  constructor(data: Omit<DefaultModuleFields, "category">, configHandler: ConfigHandler) {
    super({ ...data, category: ModuleCategory.Node }, configHandler);
  }
}

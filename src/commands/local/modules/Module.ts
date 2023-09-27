import type { LogEntry } from "../../../utils/formatters.js";
import type { Config } from "../config.js";

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

abstract class Module {
  config: Config;

  name: DefaultModuleFields["name"];
  description: DefaultModuleFields["description"];
  category: DefaultModuleFields["category"];

  package = {
    name: "",
    version: "",
    symlinked: false,
  };

  abstract isInstalled(): Promise<boolean>;
  abstract install(): Promise<void>;

  abstract isRunning(): Promise<boolean>;
  abstract start(): Promise<void>;
  getStartupInfo(): LogEntry[] | Promise<LogEntry[]> {
    return [];
  }

  get version(): string | undefined {
    return;
  }
  async getLatestVersion(): Promise<string | undefined> {
    return;
  }
  async update(): Promise<void> {}

  abstract stop(): Promise<void>;
  abstract clean(): Promise<void>;

  constructor(data: DefaultModuleFields, config: Config) {
    this.name = data.name;
    this.description = data.description;
    this.category = data.category;
    this.config = config;
  }
}

export default Module;

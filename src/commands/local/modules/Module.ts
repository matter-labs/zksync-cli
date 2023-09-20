import { getLocalPath } from "../../../utils/files";

import type { Config } from "../config";

export type DefaultModuleFields = {
  name: string;
  description: string;
  key: string;
  tags: Array<"node" | "dapp" | "explorer" | "service">;
};
abstract class Module {
  config: Config;

  name: DefaultModuleFields["name"];
  description: DefaultModuleFields["description"];
  key: DefaultModuleFields["key"];
  tags: DefaultModuleFields["tags"];

  get dataDirPath() {
    return getLocalPath("modules", this.key);
  }

  abstract isInstalled(): Promise<boolean>;
  abstract install(): Promise<void>;
  abstract isRunning(): Promise<boolean>;
  abstract start(): Promise<void>;
  async onStartCompleted(): Promise<void> {} // Optional method
  abstract stop(): Promise<void>;
  abstract clean(): Promise<void>;

  constructor(data: DefaultModuleFields, config: Config) {
    this.name = data.name;
    this.description = data.description;
    this.key = data.key;
    this.tags = data.tags;
    this.config = config;
  }
}

export default Module;

import fs from "fs";
import path from "path";

import { fileOrDirExists, getLocalPath } from "../../../utils/files.js";
import Logger from "../../../utils/logger.js";

import type { Config } from "../config.js";

export const modulesPath = getLocalPath("modules");

type Package = {
  module: Module;
  name: string;
  version: string;
  symlinked?: boolean;
};

const requireModule = async (modulePath: string) => {
  if (!fileOrDirExists(modulePath)) {
    throw new Error(`Module at "${modulePath}" is not installed`);
  }
  return (await import(modulePath)) as Module;
};

// when using `npm link` modules are not added to package.json but are symlinked in node_modules
const findLinkedModules = async (): Promise<Package[]> => {
  const packages: Package[] = [];

  const nodeModulesPath = path.join(modulesPath, "node_modules");
  const folders = fs.readdirSync(nodeModulesPath);

  for (const folder of folders) {
    const folderPath = path.join(nodeModulesPath, folder);
    if (fs.lstatSync(folderPath).isSymbolicLink()) {
      const packagePath = path.join(folderPath, "package.json");
      if (fileOrDirExists(packagePath)) {
        try {
          const packageContent = fs.readFileSync(packagePath, "utf-8");
          const { name, version, main }: Package & { main: string } = JSON.parse(packageContent);
          packages.push({
            module: await requireModule(path.join(folderPath, main)),
            name,
            version,
            symlinked: true,
          });
        } catch (error) {
          Logger.error(`There was a error parsing linked module "${folder}"`);
          Logger.error(error);
        }
      }
    }
  }

  return packages;
};

const findInstalledModules = async (): Promise<Package[]> => {
  const packagePath = getLocalPath(modulesPath, "package.json");
  const packageLockPath = getLocalPath(modulesPath, "package-lock.json");
  if (!fileOrDirExists(packagePath) || !fileOrDirExists(packageLockPath)) {
    return [];
  }

  try {
    const packageContent = fs.readFileSync(packagePath, "utf-8");
    const { dependencies }: { dependencies: Record<Package["name"], Package["version"]> } = JSON.parse(packageContent);
    return await Promise.all(
      Object.entries(dependencies).map(async ([name, version]) => ({
        module: await requireModule(name),
        name,
        version,
      }))
    );
  } catch (error) {
    Logger.error("There was a error parsing installed modules");
    Logger.error(error);
  }

  return [];
};

const parseInstalledModules = async (): Promise<Package[]> => {
  const installedModules = await findInstalledModules();
  const linkedModules = await findLinkedModules();

  const modules: Package[] = [...installedModules, ...linkedModules];

  return modules;
};

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
    return getLocalPath(modulesPath, this.key);
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

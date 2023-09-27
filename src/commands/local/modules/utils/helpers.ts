import { getModulePackages } from "./packages.js";

import type { Config } from "../../config.js";
import type Module from "../Module.js";

export const getAllModules = async (config?: Config): Promise<Module[]> => {
  const installedModules = await getModulePackages();
  const emptyConfig: Config = { modules: [] };
  return installedModules.map((modulePackage) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const module = modulePackage.module as any;
    const newModule: Module = new module(config ?? emptyConfig);
    newModule.package = {
      name: modulePackage.name,
      version: modulePackage.version,
      symlinked: modulePackage.symlinked ?? false,
    };
    return newModule;
  });
};

export const getModulesMeta = async () => {
  return (await getAllModules()).map((module) => ({
    name: module.name,
    description: module.description,
    package: module.package,
    category: module.category,
  }));
};

export const getConfigModules = async (config: Config) => {
  return (await getAllModules(config)).filter((module) => config.modules.includes(module.package.name));
};

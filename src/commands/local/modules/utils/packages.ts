import fs from "fs";
import path from "path";

import { fileOrDirExists, getLocalPath } from "../../../../utils/files.js";
import Logger from "../../../../utils/logger.js";

import type Module from "../Module.js";

type Package = {
  module: Module;
  name: string;
  version: string;
  symlinked?: boolean;
};

export const modulesPath = getLocalPath("modules");

const requireModule = async (modulePath: string): Promise<Module> => {
  if (!fileOrDirExists(modulePath)) {
    throw new Error(`Module at "${modulePath}" was not found`);
  }
  const module = await import(modulePath);
  return module.default;
};

// when using `npm link` modules are not added to package.json but are symlinked in node_modules
const findLinkedModules = async (): Promise<Package[]> => {
  const packages: Package[] = [];

  const nodeModulesPath = path.join(modulesPath, "node_modules");
  const folders = fs.readdirSync(nodeModulesPath);

  for (const folder of folders) {
    const modulePath = path.join(nodeModulesPath, folder);
    if (fs.lstatSync(modulePath).isSymbolicLink()) {
      const modulePackagePath = path.join(modulePath, "package.json");
      try {
        const packageContent = fs.readFileSync(modulePackagePath, "utf-8");
        const { name, version, main }: Package & { main: string } = JSON.parse(packageContent);
        packages.push({
          module: await requireModule(path.join(modulePath, main)),
          name,
          version,
          symlinked: true,
        });
      } catch (error) {
        Logger.error(`There was an error parsing linked module "${folder}"`);
        Logger.error(error);
      }
    }
  }
  return packages;
};

const findInstalledModules = async (): Promise<Package[]> => {
  const modulePackagePath = path.join(modulesPath, "package.json");

  if (!fileOrDirExists(modulePackagePath)) {
    return [];
  }

  const packageContent = fs.readFileSync(modulePackagePath, "utf-8");
  const modulesPackage: { dependencies?: Record<Package["name"], Package["version"]> } = JSON.parse(packageContent);
  if (!modulesPackage.dependencies) {
    return [];
  }
  return (
    await Promise.all(
      Object.entries(modulesPackage.dependencies).map(async ([name]) => {
        try {
          const modulePath = path.join(modulesPath, "node_modules", name);
          const modulePackagePath = path.join(modulePath, "package.json");
          const packageContent = fs.readFileSync(modulePackagePath, "utf-8");
          const { version, main }: Package & { main: string } = JSON.parse(packageContent);
          return {
            module: await requireModule(path.join(modulePath, main)),
            name,
            version,
          };
        } catch (error) {
          Logger.error(`There was an error parsing installed module "${name}"`);
          Logger.error(error);
          return null;
        }
      })
    )
  ).filter((e) => !!e) as Package[];
};

export const getModulePackages = async (): Promise<Package[]> => {
  try {
    const installedModules = await findInstalledModules();
    const linkedModules = await findLinkedModules();

    return [...installedModules, ...linkedModules];
  } catch (error) {
    Logger.error("There was an error parsing modules");
    throw error;
  }
};

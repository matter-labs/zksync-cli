import fs from "fs";
import path from "path";

import { modulesPath } from "./packages.js";
import { fileOrDirExists, writeFile } from "../../../../utils/files.js";
import Logger from "../../../../utils/logger.js";

import type Module from "../Module.js";

type ModuleUpdatesInfo = {
  [key: string]: {
    current?: string;
    latest?: string;
    lastUpdateCheck: string;
  };
};
const moduleUpdatesInfoPath = path.join(modulesPath, "updates.json");
const getModuleUpdatesInfo = async (): Promise<ModuleUpdatesInfo> => {
  if (!fileOrDirExists(moduleUpdatesInfoPath)) {
    return {};
  }
  try {
    const content = fs.readFileSync(moduleUpdatesInfoPath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    Logger.error(`There was a error parsing module updates info: ${error}`);
    throw error;
  }
};
const checkModulesForUpdates = async (modules: Module[]): Promise<ModuleUpdatesInfo> => {
  const moduleUpdatesInfo = await getModuleUpdatesInfo();

  let hadChanges = false;
  await Promise.all(
    modules.map(async (module) => {
      if (moduleUpdatesInfo[module.package.name]) {
        const lastUpdateCheck = new Date(moduleUpdatesInfo[module.package.name].lastUpdateCheck);
        const now = new Date();
        const diff = now.getTime() - lastUpdateCheck.getTime();
        const diffInHours = diff / (1000 * 3600);
        // update once in 1h
        if (diffInHours < 1) {
          return;
        }
      }

      const currentVersion = module.version;
      const latestVersion = await module.getLatestVersion();
      if (latestVersion && (latestVersion !== currentVersion || !moduleUpdatesInfo[module.package.name])) {
        moduleUpdatesInfo[module.package.name] = {
          current: currentVersion,
          latest: latestVersion,
          lastUpdateCheck: new Date().toISOString(),
        };
        hadChanges = true;
      }
    })
  );

  if (hadChanges) {
    writeFile(moduleUpdatesInfoPath, JSON.stringify(moduleUpdatesInfo, null, 2));
  }

  return moduleUpdatesInfo;
};
export const getModulesRequiringUpdates = async (modules: Module[]) => {
  const installedModules = await Promise.all(modules.filter((module) => module.isInstalled()));
  const updateInfo = await checkModulesForUpdates(installedModules);

  return installedModules
    .map((module) => {
      const currentVersion = module.version;
      const latestVersion = updateInfo[module.package.name]?.latest;
      return {
        module,
        currentVersion,
        latestVersion,
        requiresUpdate: currentVersion !== latestVersion,
      };
    })
    .filter((e) => e?.requiresUpdate);
};

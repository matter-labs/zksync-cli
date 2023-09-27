import { Option } from "commander";
import { readFileSync, existsSync } from "fs";
import inquirer from "inquirer";

import Program from "./command.js";
import { ModuleCategory } from "./modules/Module.js";
import { getModulesMeta } from "./modules/utils/helpers.js";
import { track } from "../../utils/analytics.js";
import { getLocalPath, writeFile } from "../../utils/files.js";
import { optionNameToParam } from "../../utils/helpers.js";
import Logger from "../../utils/logger.js";

export type Config = {
  modules: string[];
};

const configDirectory = getLocalPath("config.json");
export const configExists = (): boolean => {
  return existsSync(configDirectory);
};
export const getConfig = (): Config => {
  if (!configExists()) {
    throw new Error("Config file does not exist. Run `zksync-cli local config` to create one.");
  }
  return JSON.parse(readFileSync(configDirectory, "utf-8"));
};

type LocalConfigOptions = {
  node?: string;
  modules?: string[];
};

const moduleOption = new Option("--m, --modules <module...>", "Modules to use");

export const handler = async (options: LocalConfigOptions = {}) => {
  try {
    Logger.debug(`Initial local config options: ${JSON.stringify(options, null, 2)}`);

    const modules = await getModulesMeta();
    if (!modules.length) {
      Logger.error("No installed modules were found");
      Logger.error("Run `zksync-cli local install [module-name]` to install modules.");
      return;
    }
    const nodes = modules.filter((module) => module.category === ModuleCategory.Node);
    const additionalModules = modules.filter((module) => !module.category.includes("node"));

    const answers: LocalConfigOptions = await inquirer.prompt(
      [
        {
          message: "Node type to use",
          name: "node",
          type: "list",
          when: () => nodes.length > 0,
          choices: nodes.map((node) => ({
            name: `${node.name} - ${node.description}`,
            short: node.name,
            value: node.package.name,
          })),
          required: true,
        },
        {
          message: moduleOption.description,
          name: optionNameToParam(moduleOption.long!),
          type: "checkbox",
          when: () => additionalModules.length > 0,
          choices: additionalModules.map((module) => ({
            name: `${module.name} - ${module.description}`,
            short: module.name,
            value: module.package.name,
          })),
        },
      ],
      options
    );

    options = {
      [optionNameToParam(moduleOption.long!)]: [],
      ...options,
      ...answers,
    };

    Logger.debug(`Final local config options: ${JSON.stringify(options, null, 2)}`);

    Logger.info("Saving configuration to local config file...");

    const selectedNode = modules.find((module) => module.package.name === options.node)!;
    const selectedAdditionalModules = options.modules!.map((module) => modules.find((m) => m.package.name === module)!);

    const config: Config = {
      modules: [selectedNode.package.name, ...selectedAdditionalModules.map((module) => module.package.name)],
    };
    writeFile(configDirectory, JSON.stringify(config, null, 2));
    Logger.debug(`Saved config to ${configDirectory}`);

    Logger.info(`Configured with:
  Node Type: ${selectedNode.name}
  Modules: ${
    selectedAdditionalModules.length ? selectedAdditionalModules.map((module) => module.name).join(", ") : "None"
  }`);
  } catch (error) {
    Logger.error("There was an error while configuring the testing environment:");
    Logger.error(error);
    track("error", { error });
  }
};

Program.command("config").description("Configure your testing environment").addOption(moduleOption).action(handler);

import { Option } from "commander";
import { readFileSync, existsSync } from "fs";
import inquirer from "inquirer";

import Program from "./command.js";
import { getModulesMeta } from "./modules/index.js";
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

const modules = getModulesMeta();
const nodes = modules.filter((module) => module.tags.includes("node"));
const additionalModules = modules.filter((module) => !module.tags.includes("node"));

const nodeOption = new Option("--n, --node <node_type>", "Node type to use").choices(nodes.map((node) => node.key));
const moduleOption = new Option("--m, --modules <module...>", "Additional modules to use").choices(
  additionalModules.map((module) => module.key)
);

export const handler = async (options: LocalConfigOptions = {}) => {
  try {
    Logger.debug(`Initial local config options: ${JSON.stringify(options, null, 2)}`);

    const answers: LocalConfigOptions = await inquirer.prompt(
      [
        {
          message: nodeOption.description,
          name: optionNameToParam(nodeOption.long!),
          type: "list",
          choices: nodes.map((node) => ({
            name: `${node.name} - ${node.description}`,
            short: node.name,
            value: node.key,
          })),
          required: true,
        },
        {
          message: moduleOption.description,
          name: optionNameToParam(moduleOption.long!),
          type: "checkbox",
          choices: additionalModules.map((module) => ({
            name: `${module.name} - ${module.description}`,
            short: module.name,
            value: module.key,
          })),
        },
      ],
      options
    );

    options = {
      ...options,
      ...answers,
    };

    Logger.debug(`Final local config options: ${JSON.stringify(options, null, 2)}`);

    Logger.info("Saving configuration to local config file...");

    const selectedNode = modules.find((module) => module.key === options.node)!;
    const selectedAdditionalModules = options.modules!.map((module) => modules.find((m) => m.key === module)!);

    const config: Config = {
      modules: [selectedNode.key, ...selectedAdditionalModules.map((module) => module.key)],
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

Program.command("config")
  .description("Configure your testing environment")
  .addOption(nodeOption)
  .addOption(moduleOption)
  .action(handler);

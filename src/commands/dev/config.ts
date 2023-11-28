import chalk from "chalk";
import inquirer from "inquirer";

import Program from "./command.js";
import configHandler from "./ConfigHandler.js";
import { ModuleCategory } from "./modules/Module.js";
import Logger from "../../utils/logger.js";

import type Module from "./modules/Module.js";
import type { ModuleNode } from "./modules/Module.js";

type LocalConfigOptions = {
  node?: string;
  modules?: string[];
};

const formatModuleName = (module: Module) => {
  let name = `${module.name} - ${module.description}`;
  if (process.env.NODE_ENV === "development") {
    name += chalk.gray(` - ${module.package.name}`);
  }
  if (module.package.symlinked) {
    name += chalk.gray(" (installed via --link)");
  }
  return name;
};

export const setupConfig = async (options: LocalConfigOptions = {}) => {
  const modules = await configHandler.getAllModules();
  if (!modules.length) {
    Logger.error("No installed modules were found");
    Logger.error("Run `npx zksync-cli dev install [module-name...]` to install modules.");
    return;
  }

  const nodes = modules.filter((module) => module.category === ModuleCategory.Node);

  const nodeAnswers: LocalConfigOptions = await inquirer.prompt(
    [
      {
        message: "Node type to use",
        name: "node",
        type: "list",
        when: () => nodes.length > 0,
        choices: nodes.map((node) => ({
          name: formatModuleName(node),
          short: node.name,
          value: node.package.name,
        })),
        required: true,
      },
    ],
    options
  );

  options = {
    ...options,
    ...nodeAnswers,
  };

  const selectedNode = modules.find((module) => module.package.name === options.node)! as ModuleNode;
  const nodeInfo = selectedNode.nodeInfo;

  const potentialModules = modules.filter((module) => module.category !== ModuleCategory.Node);
  const modulesWithSupportInfo = await Promise.all(
    potentialModules.map(async (module) => {
      try {
        return {
          instance: module,
          unsupported: (await module.isNodeSupported(nodeInfo)) ? false : "Module doesn't support selected node",
        };
      } catch (error) {
        return {
          instance: module,
          unsupported: "Failed to check node support status",
        };
      }
    })
  );
  const sortedModules = modulesWithSupportInfo.sort((a, b) => {
    // Move unsupported modules to the bottom.
    if (Boolean(a.unsupported) !== Boolean(b.unsupported)) {
      return a.unsupported ? 1 : -1;
    }
    // If categories are equal, compare by name.
    if (a.instance.category === b.instance.category) {
      return a.instance.name.localeCompare(b.instance.name);
    }
    // Compare by category.
    return a.instance.category.localeCompare(b.instance.category);
  });

  const modulesAnswers: LocalConfigOptions = await inquirer.prompt(
    [
      {
        message: "Additional modules to use",
        name: "modules",
        type: "checkbox",
        when: () => sortedModules.length > 0,
        choices: sortedModules.map((module) => ({
          name: formatModuleName(module.instance),
          short: module.instance.name,
          value: module.instance.package.name,
          disabled: module.unsupported,
        })),
      },
    ],
    options
  );

  options = {
    modules: [],
    ...options,
    ...modulesAnswers,
  };

  Logger.debug(`Final dev config options: ${JSON.stringify(options, null, 2)}`);

  Logger.debug("Saving configuration to dev config file...");

  const selectedAdditionalModules = options.modules!.map((module) => modules.find((m) => m.package.name === module)!);

  configHandler.config = {
    modules: [selectedNode.package.name, ...selectedAdditionalModules.map((module) => module.package.name)],
  };
};

export const handler = async (options: LocalConfigOptions = {}) => {
  try {
    Logger.debug(`Initial dev config options: ${JSON.stringify(options, null, 2)}`);

    await setupConfig(options);

    Logger.info("\nConfiguration saved successfully!", { noFormat: true });
    Logger.info(`Start configured environment with \`${chalk.magentaBright("npx zksync-cli dev start")}\``);
  } catch (error) {
    Logger.error("There was an error while configuring the testing environment:");
    Logger.error(error);
  }
};

Program.command("config").description("Select modules to run in local development environment").action(handler);

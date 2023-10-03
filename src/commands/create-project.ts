import { Option } from "commander";
import fs from "fs-extra";
import { prompt } from "inquirer";
import path from "path";

import { zeekOption } from "../common/options";
import { program } from "../setup";
import { track } from "../utils/analytics";
import { optionNameToParam, executeCommand } from "../utils/helpers";
import Logger from "../utils/logger";
import zeek from "../utils/zeek";

import type { DefaultOptions } from "../common/options";

const templates = [
  {
    name: "Hardhat + Solidity",
    framework: "hardhat_solidity",
    project: "hello_world",
    dir: path.join(__dirname, "../templates/hh-sol-hw"),
  },
  {
    name: "Hardhat + Solidity",
    framework: "hardhat_solidity",
    project: "fungible_token",
    dir: path.join(__dirname, "../templates/hh-sol-ft"),
  },
  {
    name: "Hardhat + Solidity",
    framework: "hardhat_solidity",
    project: "non_fungible_token",
    dir: path.join(__dirname, "../templates/hh-sol-nft"),
  },
  {
    name: "Hardhat + Vyper",
    framework: "hardhat_vyper",
    project: "hello_world",
    dir: path.join(__dirname, "../templates/hh-vyp-hw"),
  },
  {
    name: "Hardhat + Vyper",
    framework: "hardhat_vyper",
    project: "fungible_token",
    dir: path.join(__dirname, "../templates/hh-vyp-ft"),
  },
  {
    name: "Hardhat + Vyper",
    framework: "hardhat_vyper",
    project: "non_fungible_token",
    dir: path.join(__dirname, "../templates/hh-vyp-nft"),
  },
];

const frameworkOption = new Option("--f, --framework <name>", "Framework to use").choices(
  [...new Set(templates.map((template) => template.framework))]
);

const projectOption = new Option("--p, --project <name>", "Project template to use")
  .choices([...new Set(templates.map((template) => template.project))])
  .default("hello_world");

type CreateOptions = DefaultOptions & {
  folderName?: string;
  framework: string;
  project: string;
};

export const handler = async (folderName: string, options: CreateOptions) => {
  try {
    options = {
      ...options,
      folderName,
    };
    Logger.debug(`Initial create-project options: ${JSON.stringify(options, null, 2)}`);

    // If the project option is not provided, set it to the default value
    if (!options.project) {
      options.project = "hello_world";
    }

    // First, ask the user for the framework
    const frameworkAnswers: CreateOptions = await prompt(
      [
        {
          message: frameworkOption.description,
          name: optionNameToParam(frameworkOption.long!),
          type: "list",
          choices: [...new Set(templates.map((template) => template.framework))],
          required: true,
        },
      ],
      options
    );

    // Now that we have the framework answer, ask for the project
    const projectAnswers: CreateOptions = await prompt(
      [
        {
          message: projectOption.description,
          name: optionNameToParam(projectOption.long!),
          type: "list",
          choices: templates.filter((t) => t.framework === frameworkAnswers.framework).map((t) => t.project),
          required: true,
        },
      ],
      options
    );

    // Combine the answers
    options = {
      ...options,
      ...frameworkAnswers,
      ...projectAnswers,
    };

    Logger.debug(`Final create-project options: ${JSON.stringify(options, null, 2)}`);

    const template = templates.find((e) => e.framework === options.framework && e.project === options.project)!;

    Logger.info(`\nCreating new project from "${template.name}" template at "${path.join(options.folderName!, "/")}"`);
    fs.copySync(template.dir, options.folderName!);

    Logger.info("\nInstalling dependencies with yarn...");
    executeCommand(`cd ${options.folderName} && yarn`);

    Logger.info(`\nAll ready 🎉🎉 

Run cd ${options.folderName} to enter your project folder.

Contracts are stored in the /contracts folder.
Deployment scripts go in the /deploy folder.

- "yarn hardhat compile" to compile your contracts.
- "yarn hardhat deploy-zksync" to deploy your contract (this command accepts a --script option).

Read the ${path.join(options.folderName!, "README.md")} file to learn more.
`);

    track("create", { framework: options.framework, project: options.project, zeek: options.zeek });

    if (options.zeek) {
      await zeek();
    }
  } catch (error) {
    Logger.error("There was an error while creating new project:");
    Logger.error(error);
    track("error", { error });
  }
};

program
  .command("create-project")
  .argument("<folder_name>", "Folder name to create project in")
  .description("Creates project from template in the specified folder")
  .addOption(frameworkOption)
  .addOption(projectOption)
  .addOption(zeekOption)
  .action(handler);

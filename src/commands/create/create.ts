import { Option } from "commander";
import inquirer from "inquirer";
import path from "path";

import Program from "./command.js";
import { zeekOption } from "../../common/options.js";
import { track } from "../../utils/analytics.js";
import { optionNameToParam, executeCommand } from "../../utils/helpers.js";
import Logger from "../../utils/logger.js";
import zeek from "../../utils/zeek.js";

import type { DefaultOptions } from "../../common/options.js";

const templates = [
  {
    name: "Hardhat + Solidity",
    value: "hardhat_solidity",
    git: "https://github.com/matter-labs/zksync-hardhat-template",
  },
  {
    name: "Hardhat + Vyper",
    value: "hardhat_vyper",
    git: "https://github.com/matter-labs/zksync-hardhat-vyper-template",
  },
];

const templateOption = new Option("--t, --template <name>", "Project template to use").choices(
  templates.map((template) => template.value)
);

type CreateOptions = DefaultOptions & {
  folderName?: string;
  template: string;
};

export const handler = async (folderName: string, options: CreateOptions) => {
  try {
    options = {
      ...options,
      folderName,
    };
    Logger.debug(`Initial create project options: ${JSON.stringify(options, null, 2)}`);

    const answers: CreateOptions = await inquirer.prompt(
      [
        {
          message: templateOption.description,
          name: optionNameToParam(templateOption.long!),
          type: "list",
          choices: templates,
          required: true,
        },
      ],
      options
    );

    options = {
      ...options,
      ...answers,
    };

    Logger.debug(`Final create project options: ${JSON.stringify(options, null, 2)}`);

    const template = templates.find((e) => e.value === options.template)!;

    Logger.info(`\nCreating new project from "${template.name}" template at "${path.join(options.folderName!, "/")}"`);
    await executeCommand(`git clone ${template.git} ${options.folderName}`);
    await executeCommand(`cd ${options.folderName} && rm -rf -r .git`); // removes .git folder so new repo can be initialized

    Logger.info("\nInstalling dependencies with yarn...");
    await executeCommand(`cd ${options.folderName} && yarn`);

    Logger.info(`\nAll ready 🎉🎉 

Run cd ${options.folderName} to enter your project folder.

Contracts are stored in the /contracts folder.
Deployment scripts go in the /deploy folder.

- "yarn hardhat compile" to compile your contracts.
- "yarn hardhat deploy-zksync" to deploy your contract (this command accepts a --script option).

Read the ${path.join(options.folderName!, "README.md")} file to learn more.
`);

    track("create", { template: options.template, zeek: options.zeek });

    if (options.zeek) {
      zeek();
    }
  } catch (error) {
    Logger.error("There was an error while creating new project:");
    Logger.error(error);
    track("error", { error });
  }
};

Program.command("project")
  .description("Initiate a project using a template in the chosen folder")
  .argument("<folder_name>", "Folder name to create project in")
  .addOption(templateOption)
  .addOption(zeekOption)
  .action(handler);

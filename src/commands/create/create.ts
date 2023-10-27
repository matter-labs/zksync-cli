import chalk from "chalk";
import { Option } from "commander";
import fs from "fs";
import inquirer from "inquirer";
import path from "path";

import Program from "./command.js";
import { zeekOption } from "../../common/options.js";
import { fileOrDirExists } from "../../utils/files.js";
import { cloneRepo } from "../../utils/git.js";
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

    const folderLocation = path.join(process.cwd(), options.folderName!);
    if (fileOrDirExists(folderLocation)) {
      throw new Error(`Folder at ${folderLocation} already exists. Try a different project name or remove the folder.`);
    }

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

    Logger.info(`\nCreating new project from "${template.name}" template at "${folderLocation}"`);
    await cloneRepo(template.git, folderLocation);
    try {
      fs.rmdirSync(path.join(folderLocation, ".git"), { recursive: true });
    } catch {
      Logger.warn("Failed to remove .git folder. Make sure to remove it manually before pushing to a new repo.");
    }
    try {
      const githubFolderLocation = path.join(folderLocation, ".github");
      if (fileOrDirExists(githubFolderLocation)) {
        fs.rmdirSync(githubFolderLocation, { recursive: true });
      }
    } catch {
      Logger.warn("Failed to remove .github folder. Make sure to remove it manually before pushing to a new repo.");
    }

    const isYarnInstalled = await executeCommand("yarn --version", { silent: true })
      .then(() => true)
      .catch(() => false);

    if (isYarnInstalled) {
      Logger.info("\nInstalling dependencies with yarn...");
      await executeCommand("yarn", { cwd: folderLocation });
    } else {
      Logger.warn("\nYarn is not installed. Install by running: `npm install -g yarn`");
      Logger.warn(
        `\nAfter installing Yarn, make sure to install dependencies by running: \`cd ${options.folderName} && yarn\``
      );
    }

    Logger.info(`\n${chalk.green("🎉 All set up! 🎉")}
    
${chalk.magentaBright("Navigate to your project:")} cd ${options.folderName}

${chalk.magentaBright("Directory Overview:")}
- Contracts: ${path.join(folderName, "/contracts")}
- Deployment Scripts: ${path.join(folderName, "/deploy")}

${chalk.magentaBright("Commands:")}
- Compile your contracts: \`yarn hardhat compile\`
- Deploy your contract: \`yarn hardhat deploy-zksync\` 
  - Note: You can use the \`--script\` option with this command.

${chalk.magentaBright("Further Reading:")}
Check out the README file for more details: ${path.join(folderLocation, "README.md")}
`);

    if (options.zeek) {
      zeek();
    }
  } catch (error) {
    Logger.error("There was an error while creating new project:");
    Logger.error(error);
  }
};

Program.command("project")
  .description("Initiate a project using a template in the chosen folder")
  .argument("<folder_name>", "Folder name to create project in")
  .addOption(templateOption)
  .addOption(zeekOption)
  .action(handler);

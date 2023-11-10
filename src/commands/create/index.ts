import chalk from "chalk";
import { Option } from "commander";
import inquirer from "inquirer";
import path from "path";

import useContractTemplates, { templates as contractTemplates } from "./groups/contracts.js";
import useFrontendTemplates, { templates as frontendTemplates } from "./groups/frontend.js";
import useScriptingTemplates, { templates as scriptingTemplates } from "./groups/scripting.js";
import { zeekOption } from "../../common/options.js";
import Program from "../../program.js";
import { fileOrDirExists } from "../../utils/files.js";
import Logger from "../../utils/logger.js";
import zeek from "../../utils/zeek.js";

import type { DefaultOptions } from "../../common/options.js";

export type GenericTemplate = {
  name: string;
  value: string;
  git: string;
  path?: string;
};

const templateOption = new Option("--t, --template <name>", "Project template to use").choices(
  [...contractTemplates, ...frontendTemplates, ...scriptingTemplates].map((template) => template.value)
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

    if (!options.folderName) {
      const transformer = (input: string) => {
        return input.trim().replace(/\s+/g, "-");
      };
      const { folderName }: { folderName: string } = await inquirer.prompt([
        {
          name: "folderName",
          message: "Enter a folder name for your project:",
          required: true,
          default: "my-zksync-project",
          validate: (input) => {
            const formattedInput = input.trim().replace(/\s+/g, "-");
            const isValid = /^[a-zA-Z0-9-_]+$/.test(formattedInput);
            return isValid || "Folder name can only contain letters, numbers, hyphens, and underscores.";
          },
          transformer,
        },
      ]);
      options.folderName = transformer(folderName);
    }
    const folderLocation = path.join(process.cwd(), options.folderName!);
    if (fileOrDirExists(folderLocation)) {
      throw new Error(`Folder at ${folderLocation} already exists. Try a different project name or remove the folder.`);
    }

    type ProjectType = "frontend" | "contracts" | "scripting";
    const { projectType }: { projectType: ProjectType } = await inquirer.prompt([
      {
        message: "What type of project do you want to create?",
        name: "projectType",
        type: "list",
        choices: [
          {
            name: `Contracts ${chalk.gray("- quick contract deployment and testing")}`,
            short: "Contracts",
            value: "contracts",
          },
          {
            name: `Frontend ${chalk.gray("- rapid UI development and integration")}`,
            short: "Frontend",
            value: "frontend",
          },
          {
            name: `Scripting ${chalk.gray("- automated interactions and advanced zkSync operations")}`,
            short: "Scripting",
            value: "scripting",
          },
        ],
        required: true,
      },
    ]);

    const templates: { [key in ProjectType]: (folder: string, folderRelativePath: string) => Promise<void> } = {
      contracts: useContractTemplates,
      frontend: useFrontendTemplates,
      scripting: useScriptingTemplates,
    };

    await templates[projectType](folderLocation, folderName);

    if (options.zeek) {
      zeek();
    }
  } catch (error) {
    Logger.error("There was an error while creating new project:");
    Logger.error(error);
  }
};

Program.command("create")
  .description("Scaffold new project for zkSync")
  .argument("[folder_name]", "Folder name to create project in")
  .addOption(templateOption)
  .addOption(zeekOption)
  .action(handler);

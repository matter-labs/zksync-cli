import chalk from "chalk";
import inquirer from "inquirer";

import Logger from "../../../utils/logger.js";
import { packageManagers } from "../../../utils/packageManager.js";
import { isPrivateKey } from "../../../utils/validators.js";
import { askForTemplate, setupTemplate, askForPackageManager, successfulMessage } from "../utils.js";

import type { GenericTemplate } from "../index.js";

type Template = GenericTemplate & {
  framework: "Hardhat";
  language: "Solidity" | "Vyper";
};

export const templates: Template[] = [
  {
    name: "Hardhat + Solidity",
    value: "hardhat_solidity",
    framework: "Hardhat",
    language: "Solidity",
    path: "templates/hardhat/solidity",
    git: "https://github.com/matter-labs/zksync-contract-templates/",
  },
  {
    name: "Hardhat + Vyper",
    value: "hardhat_vyper",
    framework: "Hardhat",
    language: "Vyper",
    path: "templates/hardhat/vyper",
    git: "https://github.com/matter-labs/zksync-contract-templates/",
  },
];

export default async (folderLocation: string, folderRelativePath: string, templateKey?: string) => {
  let env: Record<string, string> = {};
  const template = templateKey ? templates.find((e) => e.value === templateKey)! : await askForTemplate(templates);
  if (templateKey) {
    Logger.info(`Using ${chalk.magentaBright(template.name)} template`);
  }
  const { privateKey }: { privateKey: string } = await inquirer.prompt([
    {
      message: "Private key of the wallet responsible for deploying contracts",
      name: "privateKey",
      suffix: chalk.gray(" (optional)"),
      type: "input",
      validate: (input: string) => {
        if (!input) return true; // since it's optional
        return isPrivateKey(input);
      },
      transformer: (input: string) => {
        return input.replace(/./g, "*");
      },
    },
  ]);
  env = {
    ...env,
    WALLET_PRIVATE_KEY: privateKey,
  };
  const packageManager = await askForPackageManager();
  await setupTemplate(template, folderLocation, env, packageManager);

  successfulMessage.start(folderRelativePath);
  Logger.info(`${chalk.magentaBright("Directory Overview:")}
  - Contracts: /contracts
  - Deployment Scripts: /deploy
  
${chalk.magentaBright("Commands:")}
  - Compile your contracts: ${chalk.blueBright(packageManagers[packageManager].run("compile"))}
  - Deploy your contract: ${chalk.blueBright(packageManagers[packageManager].run("deploy"))} 
    - Tip: You can use the ${chalk.blueBright("--network")} option to specify the network to deploy to.`);
  successfulMessage.end(folderRelativePath);
};

import chalk from "chalk";
import inquirer from "inquirer";

import Logger from "../../../utils/logger.js";
import { packageManagers } from "../../../utils/packageManager.js";
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
    git: "https://github.com/matter-labs/zksync-hardhat-template",
  },
  {
    name: "Hardhat + Vyper",
    value: "hardhat_vyper",
    framework: "Hardhat",
    language: "Vyper",
    git: "https://github.com/matter-labs/zksync-hardhat-vyper-template",
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
      required: true,
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

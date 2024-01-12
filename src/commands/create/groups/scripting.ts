import chalk from "chalk";

import Logger from "../../../utils/logger.js";
import { packageManagers } from "../../../utils/packageManager.js";
import { askForTemplate, setupTemplate, askForPackageManager, successfulMessage } from "../utils.js";

import type { GenericTemplate } from "../index.js";

type Template = GenericTemplate & {
  framework: "Node.js";
  ethereumFramework: "Ethers v5" | "Ethers v6" | "viem";
};

export const templates: Template[] = [
  {
    name: "Viem - Node.js",
    value: "node_viem",
    framework: "Node.js",
    ethereumFramework: "viem",
    path: "templates/nodejs/viem",
    git: "https://github.com/matter-labs/zksync-scripting-templates",
  },
  {
    name: "Ethers v6 - Node.js",
    value: "node_ethers6",
    framework: "Node.js",
    ethereumFramework: "Ethers v6",
    path: "templates/nodejs/ethers",
    git: "https://github.com/matter-labs/zksync-scripting-templates",
  },
  {
    name: "Ethers v5 - Node.js",
    value: "node_ethers5",
    framework: "Node.js",
    ethereumFramework: "Ethers v5",
    path: "templates/nodejs/ethers5",
    git: "https://github.com/matter-labs/zksync-scripting-templates",
  },
];

export default async (folderLocation: string, folderRelativePath: string, templateKey?: string) => {
  const template = templateKey ? templates.find((e) => e.value === templateKey)! : await askForTemplate(templates);
  if (templateKey) {
    Logger.info(`Using ${chalk.magentaBright(template.name)} template`);
  }
  const packageManager = await askForPackageManager();
  await setupTemplate(template, folderLocation, {}, packageManager);

  successfulMessage.start(folderRelativePath);
  Logger.info(`${chalk.magentaBright("Directory Overview:")}
  - Write your code here: /src/main.ts
  - Basic usage examples: /src/examples/
  - Utilities: /src/utils/
    - Tip: Change default chain in /src/utils/chains.ts
  
${chalk.magentaBright("Commands:")}
  - Run your code: ${chalk.blueBright(packageManagers[packageManager].run("start"))}`);
  successfulMessage.end(folderRelativePath);
};

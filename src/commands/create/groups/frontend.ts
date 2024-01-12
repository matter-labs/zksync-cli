import chalk from "chalk";
import inquirer from "inquirer";

import Logger from "../../../utils/logger.js";
import { packageManagers } from "../../../utils/packageManager.js";
import { askForTemplate, setupTemplate, getUniqueValues, askForPackageManager, successfulMessage } from "../utils.js";

import type { GenericTemplate } from "../index.js";

type Template = GenericTemplate & {
  framework: "Vue - Nuxt 3" | "Vue - Vite" | "React - Next.js" | "React - Vite";
  ethereumFramework: "Ethers v5" | "Ethers v6" | "viem";
  requiresWalletConnectProjectId?: boolean;
};

export const templates: Template[] = [
  /* Vue Nuxt 3 */
  {
    name: "wagmi",
    value: "vue_nuxt3_wagmi",
    framework: "Vue - Nuxt 3",
    ethereumFramework: "viem",
    path: "templates/vue/nuxt3-wagmi",
    git: "https://github.com/matter-labs/zksync-frontend-templates",
  },
  {
    name: "wagmi + Web3Modal",
    value: "vue_nuxt3_wagmi_web3modal",
    framework: "Vue - Nuxt 3",
    ethereumFramework: "viem",
    requiresWalletConnectProjectId: true,
    path: "templates/vue/nuxt3-wagmi-web3modal",
    git: "https://github.com/matter-labs/zksync-frontend-templates",
  },
  {
    name: "Ethers v6",
    value: "vue_nuxt3_ethers6",
    framework: "Vue - Nuxt 3",
    ethereumFramework: "Ethers v6",
    path: "templates/vue/nuxt3-ethers",
    git: "https://github.com/matter-labs/zksync-frontend-templates",
  },
  {
    name: "Ethers v5",
    value: "vue_nuxt3_ethers5",
    framework: "Vue - Nuxt 3",
    ethereumFramework: "Ethers v5",
    path: "templates/vue/nuxt3-ethers5",
    git: "https://github.com/matter-labs/zksync-frontend-templates",
  },

  /* Vue Vite */
  {
    name: "wagmi",
    value: "vue_vite_wagmi",
    framework: "Vue - Vite",
    ethereumFramework: "viem",
    path: "templates/vue/vite-wagmi",
    git: "https://github.com/matter-labs/zksync-frontend-templates",
  },
  {
    name: "wagmi + Web3Modal",
    value: "vue_vite_wagmi_web3modal",
    framework: "Vue - Vite",
    ethereumFramework: "viem",
    requiresWalletConnectProjectId: true,
    path: "templates/vue/vite-wagmi-web3modal",
    git: "https://github.com/matter-labs/zksync-frontend-templates",
  },
  {
    name: "Ethers v6",
    value: "vue_vite_ethers6",
    framework: "Vue - Vite",
    ethereumFramework: "Ethers v6",
    path: "templates/vue/vite-ethers",
    git: "https://github.com/matter-labs/zksync-frontend-templates",
  },
  {
    name: "Ethers v5",
    value: "vue_vite_ethers5",
    framework: "Vue - Vite",
    ethereumFramework: "Ethers v5",
    path: "templates/vue/vite-ethers5",
    git: "https://github.com/matter-labs/zksync-frontend-templates",
  },

  /* React Next.js */
  {
    name: "wagmi",
    value: "react_next_wagmi",
    framework: "React - Next.js",
    ethereumFramework: "viem",
    path: "templates/react/next-wagmi",
    git: "https://github.com/matter-labs/zksync-frontend-templates",
  },
  {
    name: "wagmi + Web3Modal",
    value: "react_next_wagmi_web3modal",
    framework: "React - Next.js",
    ethereumFramework: "viem",
    requiresWalletConnectProjectId: true,
    path: "templates/react/next-wagmi-web3modal",
    git: "https://github.com/matter-labs/zksync-frontend-templates",
  },
  {
    name: "wagmi + RainbowKit",
    value: "react_next_wagmi_rainbowkit",
    framework: "React - Next.js",
    ethereumFramework: "viem",
    requiresWalletConnectProjectId: true,
    path: "templates/react/next-wagmi-rainbowkit",
    git: "https://github.com/matter-labs/zksync-frontend-templates",
  },
  {
    name: "Ethers v6",
    value: "react_next_ethers6",
    framework: "React - Next.js",
    ethereumFramework: "Ethers v6",
    path: "templates/react/next-ethers",
    git: "https://github.com/matter-labs/zksync-frontend-templates",
  },
  {
    name: "Ethers v5",
    value: "react_next_ethers5",
    framework: "React - Next.js",
    ethereumFramework: "Ethers v5",
    path: "templates/react/next-ethers5",
    git: "https://github.com/matter-labs/zksync-frontend-templates",
  },

  /* React Vite */
  {
    name: "wagmi",
    value: "react_vite_wagmi",
    framework: "React - Vite",
    ethereumFramework: "viem",
    path: "templates/react/vite-wagmi",
    git: "https://github.com/matter-labs/zksync-frontend-templates",
  },
  {
    name: "wagmi + Web3Modal",
    value: "react_vite_wagmi_web3modal",
    framework: "React - Vite",
    ethereumFramework: "viem",
    requiresWalletConnectProjectId: true,
    path: "templates/react/vite-wagmi-web3modal",
    git: "https://github.com/matter-labs/zksync-frontend-templates",
  },
  {
    name: "Ethers v6",
    value: "react_vite_ethers6",
    framework: "React - Vite",
    ethereumFramework: "Ethers v6",
    path: "templates/react/vite-ethers",
    git: "https://github.com/matter-labs/zksync-frontend-templates",
  },
  {
    name: "Ethers v5",
    value: "react_vite_ethers5",
    framework: "React - Vite",
    ethereumFramework: "Ethers v5",
    path: "templates/react/vite-ethers5",
    git: "https://github.com/matter-labs/zksync-frontend-templates",
  },
];

export default async (folderLocation: string, folderRelativePath: string, templateKey?: string) => {
  let env: Record<string, string> = {};
  let template: Template;
  if (!templateKey) {
    const { framework }: { framework: Template["framework"] } = await inquirer.prompt([
      {
        message: "Frontend framework",
        name: "framework",
        type: "list",
        choices: getUniqueValues(templates.map((template) => template.framework)),
        required: true,
      },
    ]);
    const { ethereumFramework }: { ethereumFramework: Template["ethereumFramework"] } = await inquirer.prompt([
      {
        message: "Ethereum framework",
        name: "ethereumFramework",
        type: "list",
        choices: getUniqueValues(
          templates.filter((template) => template.framework === framework).map((template) => template.ethereumFramework)
        ),
        required: true,
      },
    ]);
    template = await askForTemplate(
      templates
        .filter((template) => template.framework === framework)
        .filter((template) => template.ethereumFramework === ethereumFramework)
    );
  } else {
    template = templates.find((e) => e.value === templateKey)!;
    Logger.info(`Using ${chalk.magentaBright(`${template.name} - ${template.framework}`)} template`);
  }
  if (template.requiresWalletConnectProjectId) {
    const { walletConnectProjectId }: { walletConnectProjectId: string } = await inquirer.prompt([
      {
        message: "WalletConnect Project ID",
        name: "walletConnectProjectId",
        suffix: chalk.gray(" Find it at https://cloud.walletconnect.com/app"),
        type: "input",
        required: true,
      },
    ]);
    env = {
      ...env,
      WALLET_CONNECT_PROJECT_ID: walletConnectProjectId,
    };
  }
  const packageManager = await askForPackageManager();
  await setupTemplate(template, folderLocation, env, packageManager);

  successfulMessage.start(folderRelativePath);
  Logger.info(`${chalk.magentaBright("Commands:")}
  - Start project with: ${chalk.blueBright(packageManagers[packageManager].run("dev"))}`);
  successfulMessage.end(folderRelativePath);
};

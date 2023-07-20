import chalk from "chalk";

// @ts-ignore
import * as pkg from "../package.json";

export default async function () {
  console.log(chalk.greenBright(`zksync-cli version ${pkg.version}`));
  console.log(chalk.bold("\nUsage:"));
  console.log("zksync-cli <command> [...args]\n");

  console.log(chalk.bold(`Commands:\n`));
  console.log(chalk.greenBright(`create <project_name>`));
  console.log(
    `Creates a new Hardhat project in the provided folder. If no folder is specified, it will create the project in the current folder, provided it's empty.\n`
  );
  console.log(chalk.greenBright(`deposit`));
  console.log(
    `Deposits funds from L1 to zkSync Era. It will prompt for the network (localnet, testnet, mainnet), recipient wallet, amount in ETH (e.g., 0.1), and the private key of the wallet sending funds.\n`
  );
  console.log(chalk.greenBright(`withdraw`));
  console.log(
    `Withdraws funds from zkSync Era to L1. It will prompt for the network (localnet, testnet, mainnet), recipient wallet, amount in ETH (e.g., 0.1), and the private key of the wallet sending funds.\n`
  );
  console.log(chalk.greenBright(`confirm-withdrawal`));
  console.log(
    `Confirms the withdrawal of funds from zkSync to Layer 1. It will prompt for the network (localnet, testnet, mainnet), the transaction address of the withdrawal, and the private key of the wallet initiating the confirmation.\n`
  );
  console.log(chalk.greenBright(`localnet`));
  console.log(
    `Manages a local zkSync 2.0 and Ethereum L1 testnet. Run zksync-cli localnet test for a list of supported operations.`
  );

  // Exit the process
  process.exit(0);
}

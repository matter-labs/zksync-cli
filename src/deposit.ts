import { Wallet, Provider, utils } from "zksync-web3";
import { PriorityOpResponse } from "zksync-web3/build/src/types";
import * as ethers from "ethers";
import chalk from "chalk";
import inquirer, { Answers, QuestionCollection } from "inquirer";
import { track } from "./analytics";

// Used for `zksync-cli deposit --help`
export const help = () => {
  console.log(chalk.bold("Usage:"));
  console.log("zksync-cli deposit --l1-rpc-url=<URL> --l2-rpc-url=<URL>\n");
  console.log(chalk.bold(`Description:`));
  console.log(
    `Deposits funds from L1 to L2. The command will ask for the network, the recipient's address, the amount in ETH, and the sender's private key.\n`
  );
  console.log(chalk.bold(`Options:`));
  console.log(chalk.greenBright(`--l1-rpc-url=<URL>`));
  console.log(`The URL of the L1 RPC provider.\n`);
  console.log(chalk.greenBright(`--l2-rpc-url=<URL>`));
  console.log(`The URL of the L2 RPC provider.\n`);
}

export default async function (zeek?: boolean, l1RpcUrl?: string, l2RpcUrl?: string) {

  console.log(chalk.magentaBright("Deposit funds from L1 to zkSync"));

  const questions: QuestionCollection = [
    {
      message: "Network:",
      name: "network",
      type: "list",
      choices: ["testnet", "mainnet", "localnet"],
      default: "testnet",
    },

    {
      message: "Address to deposit funds to:",
      name: "to",
      type: "input",
    },

    {
      message: "Amount in ETH:",
      name: "amount",
      type: "input",
    },
    {
      message: "Private key of the sender:",
      name: "key",
      type: "password",
    },
  ];

  const results: Answers = await inquirer.prompt(questions);

  console.log(
    chalk.magentaBright(
      `Depositing ${results.amount}ETH to ${results.to} on ${results.network}`
    )
  );

  let ethProviderUrl;
  let zksyncProviderUrl;
  let etherScanUrl;
  let zkSyncExplorerUrl;

  switch (results.network) {
    case "mainnet":
      ethProviderUrl = "mainnet";
      zksyncProviderUrl = "https://mainnet.era.zksync.io";
      etherScanUrl = "https://etherscan.io/tx/";
      zkSyncExplorerUrl = "https://explorer.zksync.io/address/";
      break;
    case "testnet":
      ethProviderUrl = "goerli";
      zksyncProviderUrl = "https://testnet.era.zksync.dev";
      etherScanUrl = "https://goerli.etherscan.io/tx/";
      zkSyncExplorerUrl = "https://goerli.explorer.zksync.io/address/";
      break;
    case "localnet":
      ethProviderUrl =
        l1RpcUrl == undefined ? "http://localhost:8545" : l1RpcUrl;
      zksyncProviderUrl =
        l2RpcUrl == undefined ? "http://localhost:3050" : l2RpcUrl;
      etherScanUrl = "L1 transaction: ";
      zkSyncExplorerUrl = "L2 address:";
      break;
    default:
      throw `Unsupported network ${results.network}`;
  }

  try {
    // Init the L1/L2 providers
    let L1Provider;
    // dynamically change provider class for local or testnet/mainnet
    results.network == "localnet"
      ? (L1Provider = new ethers.providers.JsonRpcProvider(ethProviderUrl))
      : (L1Provider = ethers.getDefaultProvider(ethProviderUrl));

    const zkSyncProvider = new Provider(zksyncProviderUrl);
    // Initialize the wallet.
    const wallet = new Wallet(results.key, zkSyncProvider, L1Provider);

    // Deposit funds to L2
    const depositHandle: PriorityOpResponse = await wallet.deposit({
      to: results.to,
      token: utils.ETH_ADDRESS,
      amount: ethers.utils.parseEther(results.amount),
    });

    console.log(chalk.magentaBright(`Transaction submitted 💸💸💸`));
    console.log(chalk.magentaBright(`${etherScanUrl}${depositHandle.hash}`));
    console.log(
      chalk.magentaBright(
        `Your funds will be available in zkSync in a couple of minutes.`
      )
    );
    console.log(
      chalk.magentaBright(
        `To check the latest transactions of this wallet on zkSync, visit: ${zkSyncExplorerUrl}${results.to}`
      )
    );
    await track("deposit", { zeek, network: results.network });
  } catch (error) {
    console.error(`Error depositing funds 🤕`);
    console.log(error);
    await track("error", { error });
  }

  // ends
}

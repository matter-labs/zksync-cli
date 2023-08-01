import { Wallet, Provider, utils } from "zksync-web3";
import * as ethers from "ethers";
import chalk from "chalk";
import inquirer, { Answers, QuestionCollection } from "inquirer";
import { track } from "./analytics";

import { checkBalance } from "./utils";

// Used for `zksync-cli withdraw --help`
export const help = () => {
  console.log(chalk.bold("Usage:"));
  console.log("zksync-cli withdraw --l1-rpc-url=<URL> --l2-rpc-url=<URL>\n");
  console.log(chalk.bold(`Description:`));
  console.log(
    `Withdraws funds from L2 to L1. The command will ask for the network, the recipient's address, the amount in ETH, and the sender's private key.\n`
  );
  console.log(chalk.bold(`Options (ONLY for localnet):`));
  console.log(chalk.greenBright(`--l1-rpc-url=<URL>`));
  console.log(`The URL of the L1 RPC provider.\n`);
  console.log(chalk.greenBright(`--l2-rpc-url=<URL>`));
  console.log(`The URL of the L2 RPC provider.\n`);
};

export default async function (
  zeek?: boolean,
  l1RpcUrl?: string,
  l2RpcUrl?: string
) {
  console.log(chalk.magentaBright("Withdraw funds from zkSync to L1"));

  const questions: QuestionCollection = [
    {
      message: "Network:",
      name: "network",
      type: "list",
      choices: ["testnet", "mainnet", "localnet"],
      default: "testnet",
    },
    {
      message: "Address to withdraw funds to:",
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
      `Withdrawing ${results.amount}ETH to ${results.to} on ${results.network}`
    )
  );

  let ethProviderUrl;
  let zksyncProviderUrl;
  let zkSyncExplorerUrl;

  switch (results.network) {
    case "mainnet":
      ethProviderUrl = "mainnet";
      zksyncProviderUrl = "https://mainnet.era.zksync.io";
      zkSyncExplorerUrl = "https://explorer.zksync.io/";
      break;
    case "testnet":
      ethProviderUrl = "goerli";
      zksyncProviderUrl = "https://testnet.era.zksync.dev";
      zkSyncExplorerUrl = "https://goerli.explorer.zksync.io/";
      break;
    case "localnet":
      ethProviderUrl =
        l1RpcUrl == undefined ? l1RpcUrl : "http://localhost:8545";
      zksyncProviderUrl =
        l2RpcUrl == undefined ? l2RpcUrl : "http://localhost:3050";
      zkSyncExplorerUrl = "L2: ";
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

    await checkBalance(wallet.address, results.amount, zkSyncProvider);

    // Withdraw funds to L1
    const withdrawHandle = await wallet.withdraw({
      to: results.to,
      token: utils.ETH_ADDRESS,
      amount: ethers.utils.parseEther(results.amount),
    });

    console.log(chalk.magentaBright(`Transaction submitted 💸💸💸`));
    console.log(
      chalk.magentaBright(`${zkSyncExplorerUrl}tx/${withdrawHandle.hash}`)
    );
    console.log(
      chalk.magentaBright(
        `Your funds will be available in L1 in a couple of minutes.`
      )
    );
    if (results.network != "localnet") {
      console.log(
        chalk.magentaBright(
          `To check the latest transactions of this wallet on zkSync, visit: ${zkSyncExplorerUrl}address/${results.to}`
        )
      );
    }

    await track("withdraw", { zeek, network: results.network });
  } catch (error) {
    await track("error", { error });
  }

  // ends
}

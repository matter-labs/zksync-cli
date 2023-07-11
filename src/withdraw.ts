import { Wallet, Provider, utils } from "zksync-web3";
import * as ethers from "ethers";
import chalk from "chalk";
import inquirer, { Answers, QuestionCollection } from "inquirer";
import { track } from "./analytics";

export default async function (
  zeek?: boolean,
  l1RpcUrl?: string,
  l2RpcUrl?: string
) {
  console.log(chalk.magentaBright("Withdraw funds from zkSync to Goerli"));

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
        l1RpcUrl == undefined ? "http://localhost:8545" : l1RpcUrl;
      zksyncProviderUrl =
        l2RpcUrl == undefined ? "http://localhost:3050" : l2RpcUrl;
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
    console.log(
      chalk.magentaBright(
        `To check the latest transactions of this wallet on zkSync, visit: ${zkSyncExplorerUrl}address/${results.to}`
      )
    );

    await track("withdraw", { zeek, network: results.network });
  } catch (error) {
    await track("error", { error });
  }

  // ends
}

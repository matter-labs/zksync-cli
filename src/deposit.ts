import { Wallet, Provider, utils } from "zksync-web3";
import { PriorityOpResponse } from "zksync-web3/build/src/types";
import * as ethers from "ethers";
import chalk from "chalk";
import inquirer, { Answers, QuestionCollection } from "inquirer";

export default async function () {
  console.log(chalk.magentaBright("Deposit funds from Goerli to zkSync"));

  const questions: QuestionCollection = [
    {
      message: "Network:",
      name: "network",
      type: "list",
      choices: ["testnet", "mainnet", "localnet"],
      default: "testnet"
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
    chalk.magentaBright(`Depositing ${results.amount}ETH to ${results.to} on ${results.network}`)
  );
  var ethProviderUrl;
  var zksyncProviderUrl;
  var etherScanUrl;
  var zkSyncExplorerUrl;

  switch (results.network) {
    case "mainnet":
      ethProviderUrl = "mainnet"
      zksyncProviderUrl = "https://mainnet.era.zksync.io"
      etherScanUrl = "https://etherscan.io/tx/"
      zkSyncExplorerUrl = "https://explorer.zksync.io/address/"
      break;
    case "testnet":
      ethProviderUrl = "goerli"
      zksyncProviderUrl = "https://testnet.era.zksync.dev"
      etherScanUrl = "https://goerli.etherscan.io/tx/"
      zkSyncExplorerUrl = "https://goerli.explorer.zksync.io/address/"
      break;
    case "localnet":
      ethProviderUrl = "http://127.0.0.1:8545"
      zksyncProviderUrl = "http://127.0.0.1:3050"
      etherScanUrl = "L1 transaction: "
      zkSyncExplorerUrl = "L2 address:"
      break;
    default:
      throw "Unsupported network ${results.network}";
  }

  // Initialize the wallet.
  const L1Provider = ethers.getDefaultProvider(ethProviderUrl);

  const zkSyncProvider = new Provider(zksyncProviderUrl);
  const wallet = new Wallet(results.key, zkSyncProvider, L1Provider);

  // Deposit funds to L2
  const depositHandle: PriorityOpResponse = await wallet.deposit({
    to: results.to,
    token: utils.ETH_ADDRESS,
    amount: ethers.utils.parseEther(results.amount),
  });

  console.log(chalk.magentaBright(`Transaction submitted 💸💸💸`));
  console.log(
    chalk.magentaBright(`${etherScanUrl}${depositHandle.hash}`)
  );
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

  // ends
  process.exit(0);
}

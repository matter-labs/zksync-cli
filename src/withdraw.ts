import { Wallet, Provider, utils } from 'zksync-web3';
import * as ethers from 'ethers';
import chalk from 'chalk';
import inquirer, { Answers, QuestionCollection } from 'inquirer';
import { track } from './analytics';

// Used for `zksync-cli withdraw --help`
export const help = () => {
  console.log(chalk.bold("Usage:"));
  console.log("zksync-cli withdraw --l1-rpc-url=<URL> --l2-rpc-url=<URL>\n");
  console.log(chalk.bold(`Description:`));
  console.log(
    `Withdraws funds from L2 to L1. The command will ask for the network, the recipient's address, the amount in ETH, and the sender's private key.\n`
  );
  console.log(chalk.bold(`Options:`));
  console.log(chalk.greenBright(`--l1-rpc-url=<URL>`));
  console.log(`The URL of the L1 RPC provider.\n`);
  console.log(chalk.greenBright(`--l2-rpc-url=<URL>`));
  console.log(`The URL of the L2 RPC provider.\n`);
}

export default async function (zeek?: boolean, l1RpcUrl?: string, l2RpcUrl?: string) {

  track("withdraw", {zeek, network: "goerli"})

  console.log(chalk.magentaBright('Withdraw funds from zkSync to Goerli'));

  const questions: QuestionCollection = [
    {
      message: "Network:",
      name: "network",
      type: "list",
      choices: ["testnet", "mainnet", "localnet"],
      default: "testnet"
    },
    {
      message: 'Address to withdraw funds to:',
      name: 'to',
      type: 'input',
    },
    {
      message: 'Amount in ETH:',
      name: 'amount',
      type: 'input',
    },
    {
      message: 'Private key of the sender:',
      name: 'key',
      type: 'password',
    },
  ];

  const results: Answers = await inquirer.prompt(questions);

  console.log(
    chalk.magentaBright(`Withdrawing ${results.amount}ETH to ${results.to} on ${results.network}`)
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
      ethProviderUrl = "goerli"
      zksyncProviderUrl = "https://testnet.era.zksync.dev";
      zkSyncExplorerUrl = "https://goerli.explorer.zksync.io/";
      break;
    case "localnet":
      ethProviderUrl = l1RpcUrl == undefined ? "http://127.0.0.1:8545" : l1RpcUrl;
      zksyncProviderUrl = l2RpcUrl == undefined ? "http://127.0.0.1:3050" : l2RpcUrl;
      zkSyncExplorerUrl = "L2: ";
      break;
    default:
      throw "Unsupported network ${results.network}";
  }

  // Initialize the wallet.
  const L1Provider = ethers.getDefaultProvider(ethProviderUrl);
  const zkSyncProvider = new Provider(zksyncProviderUrl);
  const wallet = new Wallet(results.key, zkSyncProvider, L1Provider);

  // Withdraw funds to L1
  const withdrawHandle = await wallet.withdraw({
    to: results.to,
    token: utils.ETH_ADDRESS,
    amount: ethers.utils.parseEther(results.amount),
  });

  console.log(chalk.magentaBright(`Transaction submitted 💸💸💸`));
  console.log(
    chalk.magentaBright(
      `${zkSyncExplorerUrl}tx/${withdrawHandle.hash}`
    )
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

  // ends
}

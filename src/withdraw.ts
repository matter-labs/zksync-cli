import { Wallet, Provider, utils } from 'zksync-web3';
import * as ethers from 'ethers';
import chalk from 'chalk';
import inquirer, { Answers, QuestionCollection } from 'inquirer';

export default async function () {
  console.log(chalk.magentaBright('Withdraw funds from zkSync to Goerli'));

  const questions: QuestionCollection = [
    {
      message: "Network:",
      name: "network",
      type: "list",
      choices: ["goerli", "mainnet", "localnet"],
      default: "goerli"
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

  var ethProviderUrl;
  var zksyncProviderUrl;
  var zkSyncExplorerUrl;

  switch (results.network) {
    case "mainnet":
      ethProviderUrl = "mainnet"
      zksyncProviderUrl = "zksync2.zksync.dev"
      zkSyncExplorerUrl = "https://explorer.zksync.io/"
      break;
    case "goerli":
      ethProviderUrl = "goerli"
      zksyncProviderUrl = "https://zksync2-testnet.zksync.dev"
      zkSyncExplorerUrl = "https://goerli.explorer.zksync.io/"
      break;
    case "localnet":
      ethProviderUrl = "http://127.0.0.1:8545"
      zksyncProviderUrl = "http://127.0.0.1:3050"
      zkSyncExplorerUrl = "L2: "
      break;
    default:
      throw "Unsupported network ${results.network}";
  }

  // // Initialize the wallet.
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
  process.exit(0);
}

import { Wallet, Provider } from 'zksync-web3';
import * as ethers from 'ethers';
import chalk from 'chalk';
import inquirer, { Answers, QuestionCollection } from 'inquirer';
import { track } from './analytics';

export default async function (zeek?: boolean, l1RpcUrl?: string, l2RpcUrl?: string) {

  track("confirm-withdrawal", {zeek, network: "goerli"});

  console.log(chalk.magentaBright('Confirm withdrawal funds from zkSync to Layer 1'));

  const questions: QuestionCollection = [
    {
      message: "Network:",
      name: "network",
      type: "list",
      choices: ["testnet", "mainnet", "localnet"],
      default: "testnet"
    },
    {
      message: 'zkSync Transaction Address:',
      name: 'transactionAddress',
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
    chalk.magentaBright(`Confirming withdrawal of ${results.transactionAddress} from zkSync to L1 on ${results.network}`)
  );

  let ethProviderUrl;
  let zksyncProviderUrl;

  switch (results.network) {
    case "mainnet":
      ethProviderUrl = "mainnet";
      zksyncProviderUrl = "https://mainnet.era.zksync.io";
      break;
    case "testnet":
      ethProviderUrl = "goerli";
      zksyncProviderUrl = "https://testnet.era.zksync.dev";
      break;
    case "localnet":
      ethProviderUrl = l1RpcUrl == undefined ? "http://127.0.0.1:8545" : l1RpcUrl;
      zksyncProviderUrl = l2RpcUrl == undefined ? "http://127.0.0.1:3050" : l2RpcUrl;
      break;
    default:
      throw "Unsupported network ${results.network}";
  }

  // Initialize the wallet.
  const L1Provider = ethers.getDefaultProvider(ethProviderUrl);
  const zkSyncProvider = new Provider(zksyncProviderUrl);
  const wallet = new Wallet(results.key, zkSyncProvider, L1Provider);

  // Get transaction details.
  const l2Details = await zkSyncProvider.getTransactionDetails(results.transactionAddress);
  if (l2Details.ethExecuteTxHash == undefined || l2Details.ethExecuteTxHash == "") {
    console.log(
      chalk.magentaBright(
        `Transaction ${results.transactionAddress} is still being processed, please try again when the ethExecuteTxHash has been computed`
      )
    );
    console.log(chalk.magentaBright(`L2 Transaction Details: ${l2Details}`));
    return;
  }

  try {
    await wallet.finalizeWithdrawal(results.transactionAddress);
    console.log(chalk.magentaBright(`Withdrawal confirmed 💸💸💸`));
  } catch (error) {
    console.log(chalk.magentaBright(`Confirmation of withdrawal unsuccessful`));
  }

  // ends
}

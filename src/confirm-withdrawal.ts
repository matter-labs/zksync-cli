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
    chalk.magentaBright(`Confirming withdrawal of ${results.transactionAddress} from zkSync to L1`)
  );

  // Initialize the wallet.
  let L1Provider = l1RpcUrl == undefined ? ethers.getDefaultProvider("goerli") : new Provider(l1RpcUrl);
  let zkSyncProvider = new Provider(l2RpcUrl == undefined ? "https://zksync2-testnet.zksync.dev" : l2RpcUrl);
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

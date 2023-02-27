import { Wallet, Provider, utils } from "zksync-web3";
import { PriorityOpResponse } from "zksync-web3/build/src/types";
import * as ethers from "ethers";
import chalk from "chalk";
import inquirer, { Answers, QuestionCollection } from "inquirer";
import { track } from "./analytics";

export default async function (zeek?: boolean) {

  track("deposit", {zeek, network: "goerli"});

  console.log(chalk.magentaBright("Deposit funds from Goerli to zkSync"));

  const questions: QuestionCollection = [
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
    chalk.magentaBright(`Depositing ${results.amount}ETH to ${results.to}`)
  );

  // Initialize the wallet.
  const L1Provider = ethers.getDefaultProvider("goerli");

  const zkSyncProvider = new Provider("https://zksync2-testnet.zksync.dev");
  const wallet = new Wallet(results.key, zkSyncProvider, L1Provider);

  // Deposit funds to L2
  const depositHandle: PriorityOpResponse = await wallet.deposit({
    to: results.to,
    token: utils.ETH_ADDRESS,
    amount: ethers.utils.parseEther(results.amount),
  });

  console.log(chalk.magentaBright(`Transaction submitted 💸💸💸`));
  console.log(
    chalk.magentaBright(`https://goerli.etherscan.io/tx/${depositHandle.hash}`)
  );
  console.log(
    chalk.magentaBright(
      `Your funds will be available in zkSync in a couple of minutes.`
    )
  );
  console.log(
    chalk.magentaBright(
      `To check the latest transactions of this wallet on zkSync, visit: https://goerli.explorer.zksync.io/address/${results.to}`
    )
  );

  // ends
}

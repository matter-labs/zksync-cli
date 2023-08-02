import { Wallet, Provider } from "zksync-web3";
import * as ethers from "ethers";
import chalk from "chalk";
import inquirer, { Answers, QuestionCollection } from "inquirer";
import { track } from "./analytics";

// Used for `zksync-cli confirm-withdraw --help`
export const help = () => {
  console.log(chalk.bold("Usage:"));
  console.log(
    "zksync-cli confirm-withdraw --l1-rpc-url=<URL> --l2-rpc-url=<URL>\n"
  );
  console.log(chalk.bold(`Description:`));
  console.log(
    `Confirms the withdrawal of funds from zkSync to L1. The command will ask for the network, the zkSync transaction address, and the sender's private key.\n`
  );
  console.log(chalk.bold(`Options:`));
  console.log(chalk.greenBright(`--l1-rpc-url=<URL>`));
  console.log(`The URL of the L1 RPC provider.\n`);
  console.log(chalk.greenBright(`--l2-rpc-url=<URL>`));
  console.log(`The URL of the L2 RPC provider.\n`);
};

export default async function (
  zeek?: boolean,
  l1RpcUrl?: string | undefined,
  l2RpcUrl?: string | undefined
) {
  console.log(
    chalk.magentaBright("Confirm withdrawal funds from zkSync to Layer 1")
  );

  const questions: QuestionCollection = [
    {
      message: "Network:",
      name: "network",
      type: "list",
      choices: ["testnet", "mainnet", "localnet"],
      default: "testnet",
    },
    {
      message: "zkSync transaction hash:",
      name: "transactionHash",
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
      `Confirming withdrawal of ${results.transactionHash} from zkSync to L1 on ${results.network}`
    )
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
      ethProviderUrl = !l1RpcUrl ? "http://localhost:8545" : l1RpcUrl;
      zksyncProviderUrl = !l2RpcUrl ? "http://localhost:3050" : l2RpcUrl;
      break;
    default:
      throw `Unsupported network ${results.network}`;
  }

  // Init the L1/L2 providers
  let L1Provider;
  // dynamically change provider class for local or testnet/mainnet
  results.network == "localnet"
    ? (L1Provider = new ethers.providers.JsonRpcProvider(ethProviderUrl))
    : (L1Provider = ethers.getDefaultProvider(ethProviderUrl));

  const zkSyncProvider = new Provider(zksyncProviderUrl);
  // Initialize the wallet.
  const wallet = new Wallet(results.key, zkSyncProvider, L1Provider);

  // Get transaction details.
  const l2Details = await zkSyncProvider.getTransactionDetails(
    results.transactionHash
  );
  if (
    l2Details.ethExecuteTxHash == undefined ||
    l2Details.ethExecuteTxHash == ""
  ) {
    console.log(
      chalk.magentaBright(
        `Transaction ${results.transactionHash} is still being processed, please try again when the ethExecuteTxHash has been computed`
      )
    );
    console.log(chalk.magentaBright(`L2 Transaction Details: ${l2Details}`));
    return;
  }

  try {
    await wallet.finalizeWithdrawal(results.transactionHash);
    console.log(chalk.magentaBright(`Withdrawal confirmed 💸💸💸`));
    await track("confirm-withdraw", { zeek, network: results.network });
  } catch (error) {
    console.log(chalk.magentaBright(`Confirmation of withdrawal unsuccessful`));
    await track("error", { error });
  }

  // ends
}

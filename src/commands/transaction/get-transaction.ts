import inquirer from "inquirer";

import Program from "./command.js";
import {
  amountOptionCreate,
  chainOption,
  l1RpcUrlOption,
  l2RpcUrlOption,
  privateKeyOption,
  recipientOptionCreate,
  zeekOption,
} from "../../common/options.js";
import { l2Chains } from "../../data/chains.js";
import { ETH_TOKEN } from "../../utils/constants.js";
import { bigNumberToDecimal, decimalToBigNumber } from "../../utils/formatters.js";
import {
  getAddressFromPrivateKey,
  getL1Provider,
  getL2Provider,
  getL2Wallet,
  optionNameToParam,
} from "../../utils/helpers.js";
import { Provider } from "zksync-web3";
import Logger from "../../utils/logger.js";
import { isTransactionHash } from "../../utils/validators.js";
import zeek from "../../utils/zeek.js";
import { Option } from "commander";

const transactionHashOption = new Option("--tx, --transaction <TX_HASH>", "get transaction by hash");

type GetTransactionOptions = {
  chain?: string;
  txHash?: string;
}

export const handler = async (options: GetTransactionOptions) => {
  try {
    const answers: GetTransactionOptions = await inquirer.prompt(
      [
        {
          message: chainOption.description,
          name: optionNameToParam(chainOption.long!),
          type: "list",
          choices: l2Chains.filter((e) => e.l1Chain).map((e) => ({ name: e.name, value: e.network })),
          required: true,
        },
        {
          message: transactionHashOption.description,
          name: optionNameToParam(transactionHashOption.long!),
          type: "input",
          required: true,
          validate: (input: string) => isTransactionHash(input),
        },
      ],
      options
    );

    options = {
      ...options,
      ...answers,
    };

    const fromChain = l2Chains.find((e) => e.network === options.chain);
    console.log(fromChain!.rpcUrl)
    const l2Provider = new Provider();

    console.log(await l2Provider.getTransactionDetails(String(options.txHash)));


    /*const fromChainLabel = fromChain && !options.l2RpcUrl ? fromChain.name : options.l2RpcUrl ?? "Unknown chain";
    const toChain = l2Chains.find((e) => e.network === options.chain)?.l1Chain;
    const toChainLabel = toChain && !options.l1RpcUrl ? toChain.name : options.l1RpcUrl ?? "Unknown chain";

    Logger.info("\nWithdraw:");
    Logger.info(` From: ${getAddressFromPrivateKey(answers.privateKey)} (${fromChainLabel})`);
    Logger.info(` To: ${options.recipient} (${toChainLabel})`);
    Logger.info(` Amount: ${bigNumberToDecimal(decimalToBigNumber(options.amount))} ETH`);

    Logger.info("\nSending withdraw transaction...");

    const l1Provider = getL1Provider(options.l1RpcUrl ?? toChain!.rpcUrl);
    const l2Provider = getL2Provider(options.l2RpcUrl ?? fromChain!.rpcUrl);
    const senderWallet = getL2Wallet(options.privateKey, l2Provider, l1Provider);

    const withdrawHandle = await senderWallet.withdraw({
      to: options.recipient,
      token: ETH_TOKEN.l1Address,
      amount: decimalToBigNumber(options.amount),
    });
    Logger.info("\nWithdraw sent:");
    Logger.info(` Transaction hash: ${withdrawHandle.hash}`);
    if (fromChain?.explorerUrl) {
      Logger.info(` Transaction link: ${fromChain.explorerUrl}/tx/${withdrawHandle.hash}`);
    }

    const senderBalance = await l2Provider.getBalance(senderWallet.address);
    Logger.info(`\nSender L2 balance after transaction: ${bigNumberToDecimal(senderBalance)} ETH`);

    if (options.zeek) {
      zeek();
    }*/
  } catch (error) {
    Logger.error("There was an error while withdrawing funds:");
    Logger.error(error);
  }
};

Program.command("get-transaction")
  .description("Get transaction by hash")
  .addOption(chainOption)
  .addOption(transactionHashOption)
  .action(handler);

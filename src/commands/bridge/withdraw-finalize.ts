import { Option } from "commander";
import inquirer from "inquirer";

import Program from "./command.js";
import { chainOption, l1RpcUrlOption, l2RpcUrlOption, privateKeyOption, zeekOption } from "../../common/options.js";
import { l2Chains } from "../../data/chains.js";
import { bigNumberToDecimal } from "../../utils/formatters.js";
import {
  getAddressFromPrivateKey,
  getL1Provider,
  getL2Provider,
  getL2Wallet,
  optionNameToParam,
} from "../../utils/helpers.js";
import Logger from "../../utils/logger.js";
import { isPrivateKey, isTransactionHash } from "../../utils/validators.js";
import zeek from "../../utils/zeek.js";

import type { DefaultTransactionOptions } from "../../common/options.js";

const transactionHashOption = new Option("--hash <transaction_hash>", "L2 withdrawal transaction hash to finalize");

type WithdrawFinalizeOptions = DefaultTransactionOptions & {
  hash: string;
};

export const handler = async (options: WithdrawFinalizeOptions) => {
  try {
    Logger.debug(
      `Initial withdraw-finalize options: ${JSON.stringify(
        { ...options, ...(options.privateKey ? { privateKey: "<hidden>" } : {}) },
        null,
        2
      )}`
    );

    const answers: WithdrawFinalizeOptions = await inquirer.prompt(
      [
        {
          message: chainOption.description,
          name: optionNameToParam(chainOption.long!),
          type: "list",
          choices: l2Chains.filter((e) => e.l1Chain).map((e) => ({ name: e.name, value: e.network })),
          required: true,
          when(answers: WithdrawFinalizeOptions) {
            if (answers.l1RpcUrl && answers.l2RpcUrl) {
              return false;
            }
            return true;
          },
        },
        {
          message: transactionHashOption.description,
          name: optionNameToParam(transactionHashOption.long!),
          type: "input",
          required: true,
          validate: (input: string) => isTransactionHash(input),
        },
        {
          message: privateKeyOption.description,
          name: optionNameToParam(privateKeyOption.long!),
          type: "password",
          required: true,
          validate: (input: string) => isPrivateKey(input),
        },
      ],
      options
    );

    options = {
      ...options,
      ...answers,
    };

    Logger.debug(`Final withdraw-finalize options: ${JSON.stringify({ ...options, privateKey: "<hidden>" }, null, 2)}`);

    const fromChain = l2Chains.find((e) => e.network === options.chain);
    const fromChainLabel = fromChain && !options.l2RpcUrl ? fromChain.name : options.l2RpcUrl ?? "Unknown chain";
    const toChain = l2Chains.find((e) => e.network === options.chain)?.l1Chain;
    const toChainLabel = toChain && !options.l1RpcUrl ? toChain.name : options.l1RpcUrl ?? "Unknown chain";

    Logger.info("\nWithdraw finalize:");
    Logger.info(` From chain: ${fromChainLabel}`);
    Logger.info(` To chain: ${toChainLabel}`);
    Logger.info(` Withdrawal transaction (L2): ${options.hash}`);
    Logger.info(` Finalizer address (L1): ${getAddressFromPrivateKey(answers.privateKey)}`);

    const l1Provider = getL1Provider(options.l1RpcUrl ?? toChain!.rpcUrl);
    const l2Provider = getL2Provider(options.l2RpcUrl ?? fromChain!.rpcUrl);
    const senderWallet = getL2Wallet(options.privateKey, l2Provider, l1Provider);

    Logger.info("\nChecking status of the transaction...");
    const l2Details = await l2Provider.getTransactionDetails(options.hash);
    if (!l2Details) {
      Logger.error("Transaction with specified hash wasn't found");
      return;
    }
    if (!l2Details.ethExecuteTxHash) {
      Logger.error(
        `\nTransaction is still being processed on ${fromChainLabel}, please try again when the ethExecuteTxHash has been computed`
      );
      Logger.info(`L2 Transaction Details: ${JSON.stringify(l2Details, null, 2)}`);
      return;
    }
    Logger.info("Transaction is ready to be finalized");

    Logger.info("\nSending finalization transaction...");
    const finalizationHandle = await senderWallet.finalizeWithdrawal(options.hash);
    Logger.info("\nWithdrawal finalized:");
    Logger.info(` Finalization transaction hash: ${finalizationHandle.hash}`);
    if (toChain?.explorerUrl) {
      Logger.info(` Transaction link: ${toChain.explorerUrl}/tx/${finalizationHandle.hash}`);
    }

    Logger.info("\nWaiting for finalization transaction to be mined...");
    const receipt = await finalizationHandle.wait();
    Logger.info(` Finalization transaction was mined in block ${receipt.blockNumber}`);

    const senderBalance = await l1Provider.getBalance(senderWallet.address);
    Logger.info(`\nSender L1 balance after transaction: ${bigNumberToDecimal(senderBalance)} ETH`);

    if (options.zeek) {
      zeek();
    }
  } catch (error) {
    Logger.error("There was an error while finalizing withdrawal:");
    Logger.error(error);
  }
};

Program.command("withdraw-finalize")
  .description("Finalize withdrawal of funds")
  .addOption(transactionHashOption)
  .addOption(chainOption)
  .addOption(l1RpcUrlOption)
  .addOption(l2RpcUrlOption)
  .addOption(privateKeyOption)
  .addOption(zeekOption)
  .action(handler);

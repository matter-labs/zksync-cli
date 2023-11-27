import inquirer from "inquirer";
import ora from "ora";

import Program from "./command.js";
import {
  chainOption,
  zeekOption,
  privateKeyOption,
  recipientOptionCreate,
  amountOptionCreate,
  l2RpcUrlOption,
} from "../../common/options.js";
import { l2Chains } from "../../data/chains.js";
import { bigNumberToDecimal, decimalToBigNumber } from "../../utils/formatters.js";
import { getL2Provider, getL2Wallet, optionNameToParam } from "../../utils/helpers.js";
import Logger from "../../utils/logger.js";
import { isDecimalAmount, isAddress, isPrivateKey } from "../../utils/validators.js";
import zeek from "../../utils/zeek.js";

import type { DefaultTransferOptions } from "../../common/options.js";

const amountOption = amountOptionCreate("transfer");
const recipientOption = recipientOptionCreate("L2");

type TransferOptions = DefaultTransferOptions;

export const handler = async (options: TransferOptions) => {
  try {
    const answers: TransferOptions = await inquirer.prompt(
      [
        {
          message: chainOption.description,
          name: optionNameToParam(chainOption.long!),
          type: "list",
          choices: l2Chains.map((e) => ({ name: e.name, value: e.network })),
          required: true,
          when(answers: TransferOptions) {
            if (answers.l2RpcUrl) {
              return false;
            }
            return true;
          },
        },
        {
          message: amountOption.description,
          name: optionNameToParam(amountOption.long!),
          type: "input",
          required: true,
          validate: (input: string) => isDecimalAmount(input),
        },
        {
          message: privateKeyOption.description,
          name: optionNameToParam(privateKeyOption.long!),
          type: "password",
          required: true,
          validate: (input: string) => isPrivateKey(input),
        },
        {
          message: recipientOption.description,
          name: optionNameToParam(recipientOption.long!),
          type: "input",
          required: true,
          validate: (input: string) => isAddress(input),
        },
      ],
      options
    );

    options = {
      ...options,
      ...answers,
    };

    const selectedChain = l2Chains.find((e) => e.network === options.chain);
    const l2Provider = getL2Provider(options.l2RpcUrl ?? selectedChain!.rpcUrl);
    const senderWallet = getL2Wallet(options.privateKey, l2Provider);

    const transferHandle = await senderWallet.transfer({
      to: options.recipient,
      amount: decimalToBigNumber(options.amount),
    });
    const spinner = ora("Sending transfer...").start();
    try {
      const transferReceipt = await transferHandle.wait();
      spinner.stop();
      Logger.info("\nTransfer sent:");
      Logger.info(` Transaction hash: ${transferReceipt.transactionHash}`);
      if (selectedChain?.explorerUrl) {
        Logger.info(` Transaction link: ${selectedChain.explorerUrl}/tx/${transferReceipt.transactionHash}`);
      }

      const senderBalance = await l2Provider.getBalance(senderWallet.address);
      Logger.info(`\nSender L2 balance after transaction: ${bigNumberToDecimal(senderBalance)} ETH`);
    } catch (error) {
      spinner.fail("Transfer failed");
      throw error;
    }

    if (options.zeek) {
      zeek();
    }
  } catch (error) {
    Logger.error("There was an error while doing transfer");
    Logger.error(error);
  }
};

Program.command("transfer")
  .description("Transfer ETH on L2 to another account")
  .addOption(amountOption)
  .addOption(chainOption)
  .addOption(recipientOption)
  .addOption(l2RpcUrlOption)
  .addOption(privateKeyOption)
  .addOption(zeekOption)
  .action(handler);

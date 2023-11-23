import inquirer from "inquirer";

import Program from "./command.js";
import { l2Chains } from "../../data/chains.js";
import { chainOption, 
  zeekOption, 
  privateKeyOption,
  recipientOptionCreate, 
  amountOptionCreate} from "../../common/options.js";
import { bigNumberToDecimal, decimalToBigNumber } from "../../utils/formatters.js";
import {
  getAddressFromPrivateKey,
  getL2Provider,
  getL2Wallet,
  optionNameToParam,
} from "../../utils/helpers.js";
import Logger from "../../utils/logger.js";
import { isDecimalAmount, isAddress, isPrivateKey } from "../../utils/validators.js";
import zeek from "../../utils/zeek.js";
import type { DefaultTransferOptions } from "../../common/options.js";

const amountOption = amountOptionCreate("deposit");
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
          choices: l2Chains.filter((e) => e.l1Chain).map((e) => ({ name: e.name, value: e.network })),
          required: true,
          when(answers: TransferOptions) {
            if (answers.l1RpcUrl && answers.l2RpcUrl) {
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
          default: (answers: TransferOptions) => {
            return getAddressFromPrivateKey(answers.privateKey);
          },
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
    const provider = getL2Provider(options.l2RpcUrl ?? selectedChain!.rpcUrl);
    const senderWallet = getL2Wallet(options.privateKey, provider);

    const actualSenderBalance = await provider.getBalance(senderWallet.address);
    const actualReceiverBalance = await provider.getBalance(options.recipient);
    Logger.info(`\nSender L2 balance before transaction: ${bigNumberToDecimal(actualSenderBalance)} ETH`);
    Logger.info(`Receiver L2 balance before transaction: ${bigNumberToDecimal(actualReceiverBalance)} ETH`);
    
    const transferHandle = await senderWallet.transfer({
      to: options.recipient,
      amount: decimalToBigNumber(options.amount),
    });
    const txFinished = await transferHandle.wait();

    Logger.info(`\nTransaction hash: ${txFinished.transactionHash}`);

    const newSenderBalance = await provider.getBalance(senderWallet.address);
    const newReceiverBalance = await provider.getBalance(options.recipient);
    Logger.info(`\nSender L2 balance after transaction: ${bigNumberToDecimal(newSenderBalance)} ETH`);
    Logger.info(`Receiver L2 balance after transaction: ${bigNumberToDecimal(newReceiverBalance)} ETH`);

    if (options.zeek) {
      zeek();
    }
  } catch (error) {
    Logger.error("There was an error while doing transfer");
    Logger.error(error);
  }
};

Program.command("transfer")
  .description("Transfer ETH from a L2 account to another one")
  .addOption(amountOption)
  .addOption(chainOption)
  .addOption(recipientOption)
  .addOption(privateKeyOption)
  .addOption(zeekOption)
  .action(handler);

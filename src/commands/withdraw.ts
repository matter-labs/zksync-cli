import { prompt } from "inquirer";

import {
  amountOptionCreate,
  chainOption,
  l1RpcUrlOption,
  l2RpcUrlOption,
  privateKeyOption,
  recipientOptionCreate,
  zeekOption,
} from "../common/options";
import { l2Chains } from "../data/chains";
import { program } from "../setup";
import { track } from "../utils/analytics";
import { ETH_TOKEN } from "../utils/constants";
import { bigNumberToDecimal, decimalToBigNumber } from "../utils/formatters";
import {
  getAddressFromPrivateKey,
  getL1Provider,
  getL2Provider,
  getL2Wallet,
  optionNameToParam,
} from "../utils/helpers";
import Logger from "../utils/logger";
import { isDecimalAmount, isAddress, isPrivateKey } from "../utils/validators";
import zeek from "../utils/zeek";

import type { DefaultTransferOptions } from "../common/options";

const amountOption = amountOptionCreate("withdraw");
const recipientOption = recipientOptionCreate("L1");

type WithdrawOptions = DefaultTransferOptions;

program
  .command("withdraw")
  .description("Withdraw ETH from L2 to L1")
  .addOption(amountOption)
  .addOption(chainOption)
  .addOption(recipientOption)
  .addOption(l1RpcUrlOption)
  .addOption(l2RpcUrlOption)
  .addOption(privateKeyOption)
  .addOption(zeekOption)
  .action(async (options: WithdrawOptions) => {
    try {
      Logger.debug(
        `Initial withdraw options: ${JSON.stringify(
          { ...options, ...(options.privateKey ? { privateKey: "<hidden>" } : {}) },
          null,
          2
        )}`
      );

      const answers: WithdrawOptions = await prompt(
        [
          {
            message: chainOption.description,
            name: optionNameToParam(chainOption.long!),
            type: "list",
            choices: l2Chains.filter((e) => e.l1Chain).map((e) => ({ name: e.name, value: e.network })),
            required: true,
            when(answers: WithdrawOptions) {
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
            default: (answers: WithdrawOptions) => {
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

      Logger.debug(`Final withdraw options: ${JSON.stringify({ ...options, privateKey: "<hidden>" }, null, 2)}`);

      const fromChain = l2Chains.find((e) => e.network === options.chain);
      const fromChainLabel = fromChain && !options.l2RpcUrl ? fromChain.name : options.l2RpcUrl ?? "Unknown chain";
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

      track("withdraw", { network: toChain?.network ?? "Unknown chain", zeek: options.zeek });

      const senderBalance = await l2Provider.getBalance(senderWallet.address);
      Logger.info(`\nSender L2 balance after transaction: ${bigNumberToDecimal(senderBalance)} ETH`);

      if (options.zeek) {
        zeek();
      }
    } catch (error) {
      Logger.error("There was an error while withdrawing funds:");
      Logger.error(error);
      track("error", { error });
    }
  });

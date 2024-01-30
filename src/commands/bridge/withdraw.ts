import inquirer from "inquirer";
import ora from "ora";

import Program from "./command.js";
import {
  amountOptionCreate,
  chainWithL1Option,
  l1RpcUrlOption,
  l2RpcUrlOption,
  privateKeyOption,
  recipientOptionCreate,
  tokenOption,
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
import Logger from "../../utils/logger.js";
import { getBalance, getTokenInfo } from "../../utils/token.js";
import { isDecimalAmount, isAddress, isPrivateKey } from "../../utils/validators.js";
import zeek from "../../utils/zeek.js";
import { getChains } from "../config/chains.js";

import type { DefaultTransferOptions } from "../../common/options.js";

const amountOption = amountOptionCreate("withdraw");
const recipientOption = recipientOptionCreate("L1");

type WithdrawOptions = DefaultTransferOptions;

export const handler = async (options: WithdrawOptions) => {
  try {
    Logger.debug(
      `Initial withdraw options: ${JSON.stringify(
        { ...options, ...(options.privateKey ? { privateKey: "<hidden>" } : {}) },
        null,
        2
      )}`
    );

    const chains = [...l2Chains, ...getChains()];
    const answers: WithdrawOptions = await inquirer.prompt(
      [
        {
          message: chainWithL1Option.description,
          name: optionNameToParam(chainWithL1Option.long!),
          type: "list",
          choices: chains.filter((e) => e.l1Chain).map((e) => ({ name: e.name, value: e.network })),
          required: true,
          when(answers: WithdrawOptions) {
            if (answers.l1Rpc && answers.rpc) {
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

    const fromChain = chains.find((e) => e.network === options.chain);
    const fromChainLabel = fromChain && !options.rpc ? fromChain.name : options.rpc ?? "Unknown chain";
    const toChain = chains.find((e) => e.network === options.chain)?.l1Chain;
    const toChainLabel = toChain && !options.l1Rpc ? toChain.name : options.l1Rpc ?? "Unknown chain";

    const l1Provider = getL1Provider(options.l1Rpc ?? toChain!.rpcUrl);
    const l2Provider = getL2Provider(options.rpc ?? fromChain!.rpcUrl);
    const senderWallet = getL2Wallet(options.privateKey, l2Provider, l1Provider);
    const token = options.token ? await getTokenInfo(options.token!, l2Provider, l1Provider) : ETH_TOKEN;
    if (!token.l1Address) {
      throw new Error(`Token ${token.symbol} doesn't exist on ${toChainLabel} therefore it cannot be withdrawn`);
    }
    if (!token.address) {
      throw new Error(`Token ${token.symbol} does not exist on ${fromChain?.name}`);
    }

    Logger.info("\nWithdraw:");
    Logger.info(` From: ${getAddressFromPrivateKey(answers.privateKey)} (${fromChainLabel})`);
    Logger.info(` To: ${options.recipient} (${toChainLabel})`);
    Logger.info(
      ` Amount: ${bigNumberToDecimal(decimalToBigNumber(options.amount, token.decimals), token.decimals)} ${
        token.symbol
      } ${token.name ? `(${token.name})` : ""}`
    );

    const spinner = ora("Sending withdrawal...").start();
    try {
      const withdrawHandle = await senderWallet.withdraw({
        to: options.recipient,
        token: token.address === ETH_TOKEN.address ? token.l1Address : token.address!,
        amount: decimalToBigNumber(options.amount),
      });
      await withdrawHandle.wait();
      spinner.stop();
      Logger.info("\nWithdraw sent:");
      Logger.info(` Transaction hash: ${withdrawHandle.hash}`);
      if (fromChain?.explorerUrl) {
        Logger.info(` Transaction link: ${fromChain.explorerUrl}/tx/${withdrawHandle.hash}`);
      }

      const senderBalance = await getBalance(token.address, senderWallet.address, l2Provider);
      Logger.info(
        `\nSender L2 balance after transaction: ${bigNumberToDecimal(senderBalance, token.decimals)} ${token.symbol} ${
          token.name ? `(${token.name})` : ""
        }`
      );
    } catch (error) {
      spinner.fail("Withdrawal failed");
      throw error;
    }

    if (options.zeek) {
      zeek();
    }
  } catch (error) {
    Logger.error("There was an error while withdrawing funds:");
    Logger.error(error);
  }
};

Program.command("withdraw")
  .description("Transfer token from L2 to L1")
  .addOption(amountOption)
  .addOption(tokenOption)
  .addOption(chainWithL1Option)
  .addOption(recipientOption)
  .addOption(l1RpcUrlOption)
  .addOption(l2RpcUrlOption)
  .addOption(privateKeyOption)
  .addOption(zeekOption)
  .action(handler);

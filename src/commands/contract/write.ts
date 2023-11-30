import chalk from "chalk";
import { Option } from "commander";
import { ethers } from "ethers";
import inquirer from "inquirer";
import ora from "ora";

import Program from "./command.js";
import {
  abiOption,
  argumentsOption,
  contractOption,
  dataOption,
  methodOption,
  showTransactionInfoOption,
} from "./common/options.js";
import { encodeData, encodeParam, getFragmentFromSignature, getInputsFromSignature } from "./utils/formatters.js";
import { checkIfMethodExists, getContractInfoWithLoader, readAbiFromFile, askAbiMethod } from "./utils/helpers.js";
import { chainOption, l2RpcUrlOption, privateKeyOption } from "../../common/options.js";
import { l2Chains } from "../../data/chains.js";
import { getL2Provider, getL2Wallet, logFullCommandFromOptions, optionNameToParam } from "../../utils/helpers.js";
import Logger from "../../utils/logger.js";
import { isAddress, isPrivateKey } from "../../utils/validators.js";

import type { ContractInfo } from "./utils/helpers.js";
import type { DefaultTransactionOptions } from "../../common/options.js";
import type { TransactionRequest } from "@ethersproject/abstract-provider";
import type { Command } from "commander";
import type { DistinctQuestion } from "inquirer";

const valueOption = new Option("--value <EtherAmount>", "Ether value to send with transaction (eg. 0.1)");

type WriteOptions = DefaultTransactionOptions & {
  contract?: string;
  method?: string;
  arguments?: string[];
  value?: string;
  data?: string;
  abi?: string;
  showTxInfo?: boolean;
};

// ----------------
// prompts
// ----------------

const askMethod = async (contractInfo: ContractInfo, options: WriteOptions) => {
  const methodByAbi = await askAbiMethod(contractInfo, "write");
  if (methodByAbi !== "manual") {
    const fullMethodName = methodByAbi.format(ethers.utils.FormatTypes.full);
    options.method = fullMethodName.substring("function ".length).replace(/\).+$/, ")"); // remove "function " prefix and return type
    return;
  }

  const answers: Pick<WriteOptions, "method"> = await inquirer.prompt(
    [
      {
        message: "Enter method to call",
        name: optionNameToParam(methodOption.long!),
        type: "input",
        validate: (input: string) => {
          try {
            getFragmentFromSignature(input); // throws if invalid
            return true;
          } catch {
            return `Invalid method signature. Example: ${chalk.blueBright("balanceOf(address)")}`;
          }
        },
      },
    ],
    options
  );

  options.method = answers.method;
};

const askArguments = async (method: string, options: WriteOptions) => {
  if (options.arguments) {
    return;
  }
  const inputs = getInputsFromSignature(method);
  if (!inputs.length) {
    options.arguments = [];
    return;
  }
  Logger.info(chalk.green("?") + chalk.bold(" Provide method arguments:"));
  const prompts: DistinctQuestion[] = [];

  inputs.forEach((input, index) => {
    let name = chalk.gray(`[${index + 1}/${inputs.length}]`);
    if (input.name) {
      name += ` ${input.name}`;
      name += chalk.gray(` (${input.type})`);
    } else {
      name += ` ${input.type}`;
    }

    prompts.push({
      message: name,
      name: index.toString(),
      type: "input",
      validate: (value: string) => {
        try {
          encodeParam(input, value); // throws if invalid
          return true;
        } catch (error) {
          return `${chalk.redBright(
            "Failed to encode provided argument: " + (error instanceof Error ? error.message : error)
          )}`;
        }
      },
    });
  });

  const answers = await inquirer.prompt(prompts);
  options.arguments = Object.values(answers);
};

// ----------------
// request handler
// ----------------

export const handler = async (options: WriteOptions, context: Command) => {
  try {
    const answers: Pick<WriteOptions, "chain" | "contract"> = await inquirer.prompt(
      [
        {
          message: chainOption.description,
          name: optionNameToParam(chainOption.long!),
          type: "list",
          choices: l2Chains.map((e) => ({ name: e.name, value: e.network })),
          required: true,
          when: (answers: WriteOptions) => !answers.l2RpcUrl,
        },
        {
          message: contractOption.description,
          name: optionNameToParam(contractOption.long!),
          type: "input",
          required: true,
          validate: (input: string) => isAddress(input),
        },
      ],
      options
    );

    options.chain = answers.chain;
    options.contract = answers.contract;

    const selectedChain = options.l2RpcUrl ? undefined : l2Chains.find((e) => e.network === options.chain);
    const provider = getL2Provider(options.l2RpcUrl || selectedChain!.rpcUrl);

    const contractInfo = await getContractInfoWithLoader(selectedChain, provider, options.contract!);
    if (contractInfo.implementation) {
      Logger.info(
        `${chalk.green("✔")} ${chalk.bold("Contract implementation address")} ${chalk.cyan(
          contractInfo.implementation.address
        )}`
      );
    }

    if (!options.data) {
      if (options.abi) {
        contractInfo.abi = readAbiFromFile(options.abi);
        Logger.info(chalk.gray("Using provided ABI file"));
      }
      await askMethod(contractInfo, options);
    }
    if (options.method) {
      checkIfMethodExists(contractInfo, options.method);
    }

    if (!options.data) {
      await askArguments(options.method!, options);
    }

    const { privateKey }: { privateKey: string } = await inquirer.prompt(
      [
        {
          message: "Private key of the wallet to send transaction from",
          name: "privateKey",
          type: "input",
          required: true,
          validate: (input: string) => {
            return isPrivateKey(input);
          },
          transformer: (input: string) => {
            return input.replace(/./g, "*");
          },
        },
      ],
      options
    );
    const senderWallet = getL2Wallet(options.privateKey || privateKey, provider);

    const transaction: TransactionRequest = {
      from: senderWallet.address,
      to: contractInfo.address,
      data: options.data || encodeData(options.method!, options.arguments!),
      value: options.value ? ethers.utils.parseEther(options.value) : undefined,
    };

    Logger.info("");
    if (options.showTxInfo) {
      Logger.info(chalk.gray("Transaction request: " + JSON.stringify(transaction, null, 2)));
    }
    const spinner = ora("Calling contract method...").start();
    try {
      const response = await senderWallet.sendTransaction(transaction);
      spinner.succeed(`Transaction submitted. Transaction hash: ${chalk.cyanBright(response.hash)}`);
      if (options.showTxInfo) {
        Logger.info(chalk.gray("Transaction response: " + JSON.stringify(response, null, 2)));
      }

      const receiptSpinner = ora("Waiting for transaction to be processed...").start();
      try {
        const receipt = await response.wait();
        if (receipt.status) {
          receiptSpinner.succeed(
            "Transaction processed successfully." +
              (!options.l2RpcUrl && selectedChain?.explorerUrl
                ? ` Transaction link: ${selectedChain.explorerUrl}/tx/${receipt.transactionHash}`
                : "")
          );
        } else {
          receiptSpinner.fail("Transaction failed");
        }
        if (options.showTxInfo) {
          Logger.info(chalk.gray("Transaction receipt: " + JSON.stringify(receipt, null, 2)));
        }
      } catch (error) {
        receiptSpinner.fail("Transaction failed");
        throw error;
      }

      logFullCommandFromOptions(options, context, { emptyLine: true });
    } catch (error) {
      spinner.stop();
      throw error;
    }
  } catch (error) {
    Logger.error("There was an error while performing method call");
    Logger.error(error);
  }
};

Program.command("write")
  .addOption(chainOption)
  .addOption(l2RpcUrlOption)
  .addOption(contractOption)
  .addOption(methodOption)
  .addOption(argumentsOption)
  .addOption(valueOption)
  .addOption(dataOption)
  .addOption(privateKeyOption)
  .addOption(abiOption)
  .addOption(showTransactionInfoOption)
  .description("Write contract method")
  .action(handler);

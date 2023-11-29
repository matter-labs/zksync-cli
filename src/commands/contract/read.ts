import chalk from "chalk";
import { Option } from "commander";
import { ethers } from "ethers";
import inquirer from "inquirer";
import ora from "ora";

import Program from "./command.js";
import {
  decodeData,
  encodeData,
  encodeParam,
  getFragmentFromSignature,
  getInputValues,
  getInputsFromSignature,
} from "./utils/formatters.js";
import { checkIfMethodExists, getContractInfoWithLoader, getMethodsFromAbi, readAbiFromFile } from "./utils/helpers.js";
import { chainOption, l2RpcUrlOption } from "../../common/options.js";
import { l2Chains } from "../../data/chains.js";
import { getL2Provider, logFullCommandFromOptions, optionNameToParam } from "../../utils/helpers.js";
import Logger from "../../utils/logger.js";
import { isAddress } from "../../utils/validators.js";

import type { ContractInfo } from "./utils/helpers.js";
import type { DefaultTransactionOptions } from "../../common/options.js";
import type { TransactionRequest } from "@ethersproject/abstract-provider";
import type { Command } from "commander";
import type { AsyncDynamicQuestionProperty, DistinctChoice, DistinctQuestion } from "inquirer";

const contractOption = new Option("--contract <ADDRESS>", "Contract address");
const methodOption = new Option("--method <someContractMethod(arguments)>", "Contract method to call");
const argumentsOption = new Option("--args, --arguments <arguments...>", "Arguments");
const dataOption = new Option("--d, --data <someData(arguments)>", "Transaction data");
const outputsOption = new Option("--output, --outputTypes <output types...>", "Output types");
const fromOption = new Option("--from <ADDRESS>", "Read on behalf of specific address");
const abiOption = new Option("--abi <path/to/abi>", "Contract ABI file location");
const decodeSkipOption = new Option("--decode-skip", "Skip decoding response");
const showTransactionInfoOption = new Option("--show-tx-info", "Show transaction request info (eg. encoded data)");

type CallOptions = DefaultTransactionOptions & {
  contract?: string;
  method?: string;
  arguments?: string[];
  data?: string;
  outputTypes: string[];
  from?: string;
  abi?: string;
  decodeSkip?: boolean;
  showTxInfo?: boolean;
};

// ----------------
// prompts
// ----------------

const askAbiMethod = async (
  contractInfo: ContractInfo,
  type: "read" | "write"
): Promise<ethers.utils.FunctionFragment | "manual"> => {
  if (!contractInfo.abi && !contractInfo.implementation?.abi) {
    return "manual";
  }

  const formatSeparator = (text: string): DistinctChoice => {
    const totalLength = 50; // Total length of the line including the text

    if (!text) {
      return {
        type: "separator",
        line: "─".repeat(totalLength + 1),
      };
    }

    const textLength = text.length;
    const dashLength = (totalLength - textLength) / 2;
    const dashes = "─".repeat(dashLength);
    return {
      type: "separator",
      line: `${dashes} ${text} ${dashes}`,
    };
  };
  const formatFragment = (fragment: ethers.utils.FunctionFragment): DistinctChoice => {
    const name = fragment.format(ethers.utils.FormatTypes.full);
    return {
      name: name.substring("function ".length), // remove "function " prefix
      value: fragment,
    };
  };

  const choices: AsyncDynamicQuestionProperty<DistinctChoice[]> = [];
  const separators = {
    noReadMethods: { type: "separator", line: chalk.white("No read methods found") } as DistinctChoice,
    noWriteMethods: { type: "separator", line: chalk.white("No write methods found") } as DistinctChoice,
    contractNotVerified: { type: "separator", line: chalk.white("Contract is not verified") } as DistinctChoice,
  };
  choices.push(formatSeparator("Provided contract"));
  if (contractInfo.abi) {
    const methods = getMethodsFromAbi(contractInfo.abi, type);
    if (methods.length) {
      choices.push(...methods.map(formatFragment));
    } else {
      choices.push(type === "read" ? separators.noReadMethods : separators.noWriteMethods);
    }
  } else {
    choices.push(separators.contractNotVerified);
  }
  if (contractInfo?.implementation) {
    if (contractInfo.implementation.abi) {
      choices.push(formatSeparator("Resolved implementation"));
      const implementationMethods = getMethodsFromAbi(contractInfo.implementation.abi, type);
      if (implementationMethods.length) {
        choices.push(...implementationMethods.map(formatFragment));
      } else {
        choices.push(type === "read" ? separators.noReadMethods : separators.noWriteMethods);
      }
    } else {
      choices.push(separators.contractNotVerified);
    }
  }

  choices.push(formatSeparator(""));
  choices.push({
    name: "Type method manually",
    value: "manual",
  });

  const { method }: { method: ethers.utils.FunctionFragment | "manual" } = await inquirer.prompt([
    {
      message: methodOption.description,
      name: "method",
      type: "list",
      choices,
      required: true,
      pageSize: 10,
      loop: false,
    },
  ]);

  return method;
};

const askMethod = async (contractInfo: ContractInfo, options: CallOptions) => {
  const methodByAbi = await askAbiMethod(contractInfo, "read");
  if (methodByAbi !== "manual") {
    const fullMethodName = methodByAbi.format(ethers.utils.FormatTypes.full);
    options.method = fullMethodName.substring("function ".length).replace(/\).+$/, ")"); // remove "function " prefix and return type
    if (methodByAbi.outputs) {
      options.outputTypes = methodByAbi.outputs.map((output) => output.type);
    }
    return;
  }

  const answers: Pick<CallOptions, "method"> = await inquirer.prompt(
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

const askArguments = async (method: string, options: CallOptions) => {
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

const askOutputTypes = async (rawCallResponse: string, options: CallOptions) => {
  if (!options.outputTypes) {
    Logger.info(chalk.gray("Provide output types to decode the response (optional)"));
  }
  const answers: Pick<CallOptions, "outputTypes"> = await inquirer.prompt(
    [
      {
        message: outputsOption.description,
        name: optionNameToParam(outputsOption.long!),
        type: "input",
        validate: (input: string) => {
          try {
            decodeData(getInputValues(input), rawCallResponse); // throws if invalid
            return true;
          } catch (error) {
            return `${chalk.redBright(
              "Failed to decode response with provided types: " + (error instanceof Error ? error.message : error)
            )}\nInput example: ${chalk.blueBright("string,uint256")}`;
          }
        },
      },
    ],
    options
  );

  options.outputTypes = options.outputTypes || getInputValues(answers.outputTypes as unknown as string);

  if (!options.outputTypes.length) return;

  const decodedOutput = decodeData(options.outputTypes, rawCallResponse);
  Logger.info(`${chalk.green("✔")} Decoded method response: ${chalk.cyanBright(decodedOutput)}`);
};

// ----------------
// request handler
// ----------------

export const handler = async (options: CallOptions, context: Command) => {
  try {
    const answers: Pick<CallOptions, "chain" | "contract"> = await inquirer.prompt(
      [
        {
          message: chainOption.description,
          name: optionNameToParam(chainOption.long!),
          type: "list",
          choices: l2Chains.map((e) => ({ name: e.name, value: e.network })),
          required: true,
          when: (answers: CallOptions) => !answers.l2RpcUrl,
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
      await checkIfMethodExists(contractInfo, options.method);
    }

    if (!options.data) {
      await askArguments(options.method!, options);
    }

    const transaction: TransactionRequest = {
      to: contractInfo.address,
      data: options.data || encodeData(options.method!, options.arguments!),
      from: options.from,
      nonce: options.from ? await provider.getTransactionCount(options.from) : undefined,
    };

    Logger.info("");
    if (options.showTxInfo) {
      Logger.info(chalk.gray("Transaction request: " + JSON.stringify(transaction, null, 2)));
    }
    const spinner = ora("Calling contract method...").start();
    try {
      const response = await provider.call(transaction);
      const isEmptyResponse = response === "0x";
      spinner[isEmptyResponse ? "warn" : "succeed"](`Method response (raw): ${chalk.cyanBright(response)}`);

      if (!isEmptyResponse && !options.decodeSkip) {
        await askOutputTypes(response, options);
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

Program.command("read")
  .addOption(chainOption)
  .addOption(l2RpcUrlOption)
  .addOption(contractOption)
  .addOption(methodOption)
  .addOption(argumentsOption)
  .addOption(dataOption)
  .addOption(outputsOption)
  .addOption(fromOption)
  .addOption(abiOption)
  .addOption(decodeSkipOption)
  .addOption(showTransactionInfoOption)
  .description("Call contract method and decode response")
  .action(handler);

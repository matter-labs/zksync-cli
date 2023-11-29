import chalk from "chalk";
import { Option } from "commander";
import { ethers } from "ethers";
import inquirer from "inquirer";
import ora from "ora";

import Program from "./command.js";
import { getProxyImplementation } from "./utils/helpers.js";
import { chainOption, l2RpcUrlOption } from "../../common/options.js";
import { l2Chains } from "../../data/chains.js";
import { getL2Provider, logFullCommandFromOptions, optionNameToParam } from "../../utils/helpers.js";
import Logger from "../../utils/logger.js";
import { isAddress } from "../../utils/validators.js";

import type { DefaultTransactionOptions } from "../../common/options.js";
import type { TransactionRequest } from "@ethersproject/abstract-provider";
import type { Command } from "commander";
import type { DistinctQuestion } from "inquirer";
import type { Provider } from "zksync-web3";

const contractOption = new Option("--contract <ADDRESS>", "Contract address");
const methodOption = new Option("--method <someContractMethod(arguments)>", "Contract method to call");
const argumentsOption = new Option("--args, --arguments <arguments...>", "Arguments");
const outputsOption = new Option("--output, --outputTypes <output types...>", "Output types");
const dataOption = new Option("--d, --data <someData(arguments)>", "Transaction data");
const decodeSkipOption = new Option("--decode-skip", "Skip decoding response");
const showTransactionInfoOption = new Option("--show-tx-info", "Show transaction request info (eg. encoded data)");

type CallOptions = DefaultTransactionOptions & {
  contract?: string;
  method?: string;
  arguments?: string[];
  data?: string;
  outputTypes: string[];
  decodeSkip?: boolean;
  showTxInfo?: boolean;
};

// -----------------
// helper functions
// -----------------

function getInterfaceFromSignature(method: string) {
  return new ethers.utils.Interface(["function " + String(method)]);
}

function getFragmentFromSignature(method: string) {
  const functionInterface = getInterfaceFromSignature(method);
  return functionInterface.fragments[0];
}

function getInputsFromSignature(method: string) {
  return getFragmentFromSignature(method).inputs;
}

function encodeData(func: string, args: unknown[]): string {
  const functionInterface = getInterfaceFromSignature(func);
  return functionInterface.encodeFunctionData(func, args);
}

function encodeParam(param: ethers.utils.ParamType, arg: unknown) {
  return ethers.utils.defaultAbiCoder.encode([param], [arg]);
}
function decodeData(types: string[], bytecode: string) {
  return ethers.utils.defaultAbiCoder.decode(types, bytecode);
}

function getInputValues(inputsString: string): string[] {
  return inputsString
    .split(",")
    .map((element) => element.trim())
    .filter((element) => !!element);
}

function getMethodId(method: string) {
  const methodSignature = getFragmentFromSignature(method).format(ethers.utils.FormatTypes.sighash);
  return ethers.utils.id(methodSignature).substring(2, 10); // remove 0x and take first 4 bytes
}

async function getContractBytecode(provider: Provider, contractAddress: string) {
  const spinner = ora("Fetching contract information...").start();
  try {
    const contractBytecode = await provider.getCode(contractAddress);
    if (contractBytecode === "0x") {
      throw new Error("Provided address is not a contract");
    }
    return contractBytecode;
  } finally {
    spinner.stop();
  }
}

async function findImplementationOfProxy(provider: Provider, contractAddress: string) {
  const spinner = ora("Searching for contract implementation...").start();
  try {
    const implementationAddress = await getProxyImplementation(contractAddress, provider);
    if (implementationAddress) {
      const bytecode = await provider.getCode(implementationAddress);
      spinner.succeed(`${chalk.bold("Contract implementation address")} ${chalk.cyan(implementationAddress)}`);
      return {
        address: implementationAddress,
        bytecode,
      };
    } else {
      spinner.stop();
    }
  } catch (error) {
    spinner.fail("Failed to find contract implementation");
  }
  return null;
}

async function checkIfMethodExists(
  provider: Provider,
  contractAddress: string,
  contractBytecode: string,
  method: string
) {
  const methodId = getMethodId(method);
  if (!contractBytecode.includes(methodId)) {
    const implementation = await findImplementationOfProxy(provider, contractAddress);
    if (!implementation) {
      Logger.warn("Provided method is not part of the contract and will only work if provided contract is a proxy");
    } else if (!implementation.bytecode.includes(methodId)) {
      Logger.warn("Provided method is not part of the provided contract nor its implementation");
    }
  }
}

// ----------------
// ask questions
// ----------------

async function askMethodSignature(options: CallOptions) {
  const answers: Pick<CallOptions, "method"> = await inquirer.prompt(
    [
      {
        message: methodOption.description,
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

  options.method = options.method || answers.method;
}
async function askArguments(method: string, options: CallOptions) {
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
}

async function askOutputTypes(rawCallResponse: string, options: CallOptions) {
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
}

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

    const selectedChain = l2Chains.find((e) => e.network === options.chain);
    const provider = getL2Provider(options.l2RpcUrl ?? selectedChain!.rpcUrl);

    const contractBytecode = await getContractBytecode(provider, options.contract!);

    await askMethodSignature(options);
    if (options.method) {
      await checkIfMethodExists(provider, options.contract!, contractBytecode, options.method);
    }

    await askArguments(options.method!, options);

    const transaction: TransactionRequest = {
      to: options.contract,
      data: options.data || encodeData(options.method!, options.arguments!),
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
  .addOption(decodeSkipOption)
  .addOption(showTransactionInfoOption)
  .description("Call contract method and decode response")
  .action(handler);

import chalk from "chalk";
import { Option } from "commander";
import { ethers } from "ethers";
import fs from "fs";
import inquirer from "inquirer";
import ora from "ora";

import Program from "./command.js";
import { getProxyImplementation } from "./utils/helpers.js";
import { chainOption, l2RpcUrlOption } from "../../common/options.js";
import { l2Chains } from "../../data/chains.js";
import { fileOrDirExists } from "../../utils/files.js";
import { getL2Provider, logFullCommandFromOptions, optionNameToParam } from "../../utils/helpers.js";
import Logger from "../../utils/logger.js";
import { isAddress } from "../../utils/validators.js";

import type { DefaultTransactionOptions } from "../../common/options.js";
import type { L2Chain } from "../../data/chains.js";
import type { TransactionRequest } from "@ethersproject/abstract-provider";
import type { Command } from "commander";
import type { AsyncDynamicQuestionProperty, DistinctChoice, DistinctQuestion } from "inquirer";
import type { Provider } from "zksync-web3";

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

type ABI = Record<string, unknown>[];
type ContractInfo = {
  address: string;
  bytecode: string;
  abi: ABI | undefined;
  implementation?: ContractInfo;
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

function getMethodsFromAbi(abi: ABI, type: "read" | "write"): ethers.utils.FunctionFragment[] {
  if (type === "read") {
    const readMethods = abi.filter(
      (fragment) =>
        fragment.type === "function" && (fragment.stateMutability === "view" || fragment.stateMutability === "pure")
    );
    const contractInterface = new ethers.utils.Interface(readMethods);
    return contractInterface.fragments as ethers.utils.FunctionFragment[];
  } else {
    const writeMethods = abi.filter(
      (fragment) =>
        fragment.type === "function" &&
        (fragment.stateMutability === "nonpayable" || fragment.stateMutability === "payable")
    );
    const contractInterface = new ethers.utils.Interface(writeMethods);
    return contractInterface.fragments as ethers.utils.FunctionFragment[];
  }
}

async function checkIfMethodExists(contractInfo: ContractInfo, method: string) {
  const methodId = getMethodId(method);
  if (!contractInfo.bytecode.includes(methodId)) {
    if (!contractInfo.implementation) {
      Logger.warn("Provided method is not part of the contract and will only work if provided contract is a proxy");
    } else if (!contractInfo.implementation.bytecode.includes(methodId)) {
      Logger.warn("Provided method is not part of the provided contract nor its implementation");
    }
  }
}

async function getContractABI(chain: L2Chain, contractAddress: string) {
  if (!chain.verificationApiUrl) return;
  const response = await fetch(`${chain.verificationApiUrl}/contract_verification/info/${contractAddress}`);
  const decoded: { artifacts: { abi: Record<string, unknown>[] } } = await response.json();
  return decoded.artifacts.abi;
}

function readAbiFromFile(abiFilePath: string): ABI {
  if (!fileOrDirExists(abiFilePath)) {
    throw new Error(`ABI not found at specified location: ${abiFilePath}`);
  }
  const contents = fs.readFileSync(abiFilePath, "utf-8");
  try {
    const data = JSON.parse(contents);
    if (Array.isArray(data)) {
      return data;
    } else if (data?.abi) {
      return data.abi;
    }
    throw new Error("ABI wasn't found in the provided file");
  } catch (error) {
    throw new Error(`Failed to parse ABI file: ${error instanceof Error ? error.message : error}`);
  }
}

async function getContractInformation(
  chain: L2Chain | undefined,
  provider: Provider,
  contractAddress: string,
  options?: { fetchImplementation?: boolean }
): Promise<ContractInfo> {
  const [bytecode, abi] = await Promise.all([
    provider.getCode(contractAddress),
    chain ? getContractABI(chain, contractAddress).catch(() => undefined) : undefined,
  ]);
  const contractInfo: ContractInfo = {
    address: contractAddress,
    bytecode,
    abi,
  };

  if (options?.fetchImplementation) {
    const implementationAddress = await getProxyImplementation(contractAddress, provider).catch(() => undefined);
    if (implementationAddress) {
      const implementation = await getContractInformation(chain, provider, implementationAddress);
      contractInfo.implementation = implementation;
    }
  }

  return contractInfo;
}

async function getContractInfoWithLoader(
  chain: L2Chain | undefined,
  provider: Provider,
  contractAddress: string
): Promise<ContractInfo> {
  const spinner = ora("Fetching contract information...").start();
  try {
    const contractInfo = await getContractInformation(chain, provider, contractAddress, { fetchImplementation: true });
    if (contractInfo.bytecode === "0x") {
      throw new Error("Provided address is not a contract");
    }
    return contractInfo;
  } finally {
    spinner.stop();
  }
}

// ----------------
// prompts
// ----------------

async function askAbiMethod(
  contractInfo: ContractInfo,
  type: "read" | "write"
): Promise<ethers.utils.FunctionFragment | "manual"> {
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
  const formatFragment = (fragment: ethers.utils.FunctionFragment): DistinctChoice => ({
    name: fragment.format(ethers.utils.FormatTypes.minimal),
    value: fragment,
  });

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
}

async function askMethod(contractInfo: ContractInfo, options: CallOptions) {
  const methodByAbi = await askAbiMethod(contractInfo, "read");
  if (methodByAbi !== "manual") {
    options.method = methodByAbi.format(ethers.utils.FormatTypes.sighash);
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

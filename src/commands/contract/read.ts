import chalk from "chalk";
import { Option } from "commander";
import { ethers } from "ethers";
import inquirer from "inquirer";
import ora from "ora";

import Program from "./command.js";
import { chainOption, l2RpcUrlOption } from "../../common/options.js";
import { l2Chains } from "../../data/chains.js";
import { getL2Provider, optionNameToParam } from "../../utils/helpers.js";
import Logger from "../../utils/logger.js";
import { isAddress } from "../../utils/validators.js";

import type { DefaultTransactionOptions } from "../../common/options.js";
import type { TransactionRequest } from "@ethersproject/abstract-provider";
import type { Provider } from "zksync-web3";

const contractOption = new Option("--contract <ADDRESS>", "Contract address");
const methodOption = new Option("--method <someContractMethod(arguments)>", "Contract method to call");
const argumentsOption = new Option("--args, --arguments <arguments...>", "Arguments");
const outputsOption = new Option("--output, --outputTypes <output types...>", "Output types");
const dataOption = new Option("--d, --data <someData(arguments)>", "Transaction data");

type CallOptions = DefaultTransactionOptions & {
  contract?: string;
  method?: string;
  arguments?: string[];
  data?: string;
  outputTypes: string[];
};

// -----------------
// helper functions
// -----------------

function getInterfaceFromSignature(functionSignature: string) {
  return new ethers.utils.Interface(["function " + String(functionSignature)]);
}

function getFragmentFromSignature(functionSignature: string) {
  const functionInterface = getInterfaceFromSignature(functionSignature);
  return functionInterface.fragments[0];
}

function getInputsFromSignature(methodSignature: string) {
  return getFragmentFromSignature(methodSignature).inputs;
}

function encodeData(func: string, args: unknown[]): string {
  const functionInterface = getInterfaceFromSignature(func);
  return functionInterface.encodeFunctionData(func, args);
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

function getFunctionId(functionSignature: string) {
  return ethers.utils.id(functionSignature).substring(2, 10); // remove 0x and take first 4 bytes
}

async function getContractBytecode(provider: Provider, contractAddress: string) {
  const contractSpinner = ora("Fetching contract information...").start();
  let contractBytecode: string;
  try {
    contractBytecode = await provider.getCode(contractAddress);
    if (contractBytecode === "0x") {
      throw new Error("Provided address is not a contract");
    }
  } finally {
    contractSpinner.stop();
  }

  return contractBytecode;
}

// ----------------
// ask questions
// ----------------

async function askOutputTypes(rawCallResponse: string, options: CallOptions) {
  Logger.info(chalk.gray("Provide output types to decode the response (optional)"));
  const answers: CallOptions = await inquirer.prompt(
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
              "Failed to parse response with provided types: " + (error instanceof Error ? error.message : error)
            )}\nInput example: ${chalk.blueBright("string,uint256")}`;
          }
        },
      },
    ],
    options
  );

  options = {
    ...options,
    outputTypes: options.outputTypes || getInputValues(answers.outputTypes as unknown as string),
  };

  if (!options.outputTypes.length) return;

  const decodedOutput = decodeData(options.outputTypes, rawCallResponse);
  Logger.info(`${chalk.greenBright("✔")} Decoded method response: ${chalk.cyanBright(decodedOutput)}`);
}

// ----------------
// request handler
// ----------------

export const handler = async (options: CallOptions) => {
  try {
    const answers1 = await inquirer.prompt(
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

    options = {
      ...options,
      chain: answers1.chain,
      contract: answers1.contract,
    };

    const selectedChain = l2Chains.find((e) => e.network === options.chain);
    const provider = getL2Provider(options.l2RpcUrl ?? selectedChain!.rpcUrl);

    const contractBytecode = await getContractBytecode(provider, options.contract!);

    const answers2: CallOptions = await inquirer.prompt(
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
          when: () => !options.data,
        },
      ],
      options
    );

    options = {
      ...options,
      method: options.method || answers2.method,
    };

    if (options.method && !contractBytecode.includes(getFunctionId(options.method))) {
      Logger.warn(
        "Provided method signature is not part of the contract and will only work if provided contract is a proxy"
      );
    }

    const answers3: CallOptions = await inquirer.prompt(
      [
        {
          message: argumentsOption.description,
          name: optionNameToParam(argumentsOption.long!),
          type: "input",
          when: () => !options.data && !!getInputsFromSignature(options.method!).length,
        },
      ],
      options
    );

    options = {
      ...options,
      arguments: options.arguments || (answers3.arguments ? (answers3.arguments as unknown as string).split(" ") : []),
    };

    const transaction: TransactionRequest = {
      to: options.contract,
      data: options.data || encodeData(options.method!, options.arguments!),
      chainId: selectedChain?.id,
    };

    Logger.debug("Transaction request: " + JSON.stringify(transaction, null, 2));

    Logger.info("");
    const spinner = ora("Calling contract method...").start();
    try {
      const response = await provider.call(transaction);
      const isEmptyResponse = response === "0x";
      spinner[isEmptyResponse ? "warn" : "succeed"](`Method response (raw): ${chalk.cyanBright(response)}`);
      if (isEmptyResponse) return;
      await askOutputTypes(response, options);
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
  .description("Call contract method and decode response")
  .action(handler);

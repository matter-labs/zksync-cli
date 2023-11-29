import { ethers } from "ethers";
import fs from "fs";
import ora from "ora";

import { getMethodId } from "./formatters.js";
import { getProxyImplementation } from "./proxy.js";
import { fileOrDirExists } from "../../../utils/files.js";
import Logger from "../../../utils/logger.js";

import type { L2Chain } from "../../../data/chains.js";
import type { Provider } from "zksync-web3";

export type ABI = Record<string, unknown>[];
export type ContractInfo = {
  address: string;
  bytecode: string;
  abi: ABI | undefined;
  implementation?: ContractInfo;
};

export const getMethodsFromAbi = (abi: ABI, type: "read" | "write"): ethers.utils.FunctionFragment[] => {
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
};

export const checkIfMethodExists = (contractInfo: ContractInfo, method: string) => {
  const methodId = getMethodId(method);
  if (!contractInfo.bytecode.includes(methodId)) {
    if (!contractInfo.implementation) {
      Logger.warn("Provided method is not part of the contract and will only work if provided contract is a proxy");
    } else if (!contractInfo.implementation.bytecode.includes(methodId)) {
      Logger.warn("Provided method is not part of the provided contract nor its implementation");
    }
  }
};

export const getContractABI = async (chain: L2Chain, contractAddress: string) => {
  if (!chain.verificationApiUrl) return;
  const response = await fetch(`${chain.verificationApiUrl}/contract_verification/info/${contractAddress}`);
  const decoded: { artifacts: { abi: Record<string, unknown>[] } } = await response.json();
  return decoded.artifacts.abi;
};

export const readAbiFromFile = (abiFilePath: string): ABI => {
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
};

export const getContractInformation = async (
  chain: L2Chain | undefined,
  provider: Provider,
  contractAddress: string,
  options?: { fetchImplementation?: boolean }
): Promise<ContractInfo> => {
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
};

export const getContractInfoWithLoader = async (
  chain: L2Chain | undefined,
  provider: Provider,
  contractAddress: string
): Promise<ContractInfo> => {
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
};

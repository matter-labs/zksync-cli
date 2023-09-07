import { execSync } from "child_process";
import { ethers } from "ethers";
import { computeAddress } from "ethers/lib/utils";
import { Wallet, Provider } from "zksync-web3";

export const optionNameToParam = (input: string): string => {
  // "--l1-rpc-url" => "l1RpcUrl"
  const parts = input.replace(/^--/, "").split("-");

  for (let i = 1; i < parts.length; i++) {
    parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
  }

  return parts.join("");
};

export const getAddressFromPrivateKey = (privateKey: string): string => {
  return computeAddress(privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`);
};

export const getL1Provider = (l1RpcUrl: string) => {
  return new ethers.providers.JsonRpcProvider(l1RpcUrl);
};
export const getL2Provider = (l2RpcUrl: string) => {
  return new Provider(l2RpcUrl);
};

export const getL2Wallet = (privateKey: string, l2Provider: Provider, l1Provider?: ethers.providers.Provider) => {
  return new Wallet(privateKey, l2Provider, l1Provider);
};

export const executeCommand = (command: string) => {
  execSync(`${command}`, { stdio: "inherit" });
};

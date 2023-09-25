import { BigNumber, Wallet } from "ethers";
import { getAddress } from "ethers/lib/utils.js";

import { ETH_TOKEN } from "./constants.js";
import { decimalToBigNumber } from "./formatters.js";

export const isDecimalAmount = (amount: string, decimals = ETH_TOKEN.decimals) => {
  try {
    if (BigNumber.isBigNumber(decimalToBigNumber(amount, decimals))) {
      return true;
    }
  } catch {
    // ignore since we return error message below
  }
  return "Incorrect amount";
};

export const isAddress = (address: string) => {
  try {
    return Boolean(getAddress(address));
  } catch (e) {
    return "Incorrect address";
  }
};

export const isTransactionHash = (s: string) => {
  const valid = /^0x([A-Fa-f0-9]{64})$/.test(s);
  if (!valid) {
    return "Incorrect transaction hash";
  }
  return true;
};

export const isPrivateKey = (hash: string) => {
  try {
    if (new Wallet(hash).address) {
      return true;
    }
  } catch {
    // ignore since we return error message below
  }
  return "Incorrect private key";
};

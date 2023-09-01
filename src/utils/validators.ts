import { BigNumber, Wallet } from "ethers";
import { parseUnits, getAddress } from "ethers/lib/utils";

export const isDecimalAmount = (amount: string, decimals = 18) => {
  try {
    if (BigNumber.isBigNumber(parseUnits(amount, decimals))) {
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

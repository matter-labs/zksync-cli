import { formatUnits, parseUnits } from "ethers/lib/utils";

import { ETH_TOKEN } from "../utils/constants";

import type { BigNumberish } from "ethers/lib/ethers";

export function decimalToBigNumber(amount: string, decimals = ETH_TOKEN.decimals) {
  return parseUnits(amount, decimals);
}

export function bigNumberToDecimal(amount: BigNumberish, decimals = ETH_TOKEN.decimals): string {
  const result = formatUnits(amount.toString(), decimals).toString();
  if (result.endsWith(".0")) {
    return result.slice(0, -2);
  }
  return result;
}

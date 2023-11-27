import chalk from "chalk";
import { formatUnits, parseUnits } from "ethers/lib/utils.js";

import { hasColor } from "./helpers.js";
import { ETH_TOKEN } from "../utils/constants.js";

import type { BigNumberish } from "ethers/lib/ethers.js";

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

export type LogEntry =
  | string
  | {
      text: string;
      list?: LogEntry[];
    };

const formatLogEntry = (entry: LogEntry, indentation = "", defaultColor = chalk.blueBright): string => {
  function formatString(text: string): string {
    if (!text.trimStart().startsWith("-")) {
      text = `- ${text}`;
    }
    return `${indentation}${hasColor(text) ? text : defaultColor(text)}`;
  }

  if (typeof entry === "string") {
    return formatString(entry);
  } else {
    const { text, list } = entry;
    const formattedText = formatString(text);
    if (list && list.length > 0) {
      const subEntries = list.map((item) => formatLogEntry(item, indentation + " ", defaultColor)).join("\n");
      return `${formattedText}\n${subEntries}`;
    } else {
      return formattedText;
    }
  }
};

export const formatLogs = (logs: LogEntry[], indentation = "", defaultColor = chalk.blueBright): string => {
  return logs.map((entry) => formatLogEntry(entry, indentation, defaultColor)).join("\n");
};

export const remove0x = (data: string): string => {
  if (data.slice(0,2) === "0x"){
    return data.slice(2);
  }
  return data;
};

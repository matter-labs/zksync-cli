import { Option } from "commander";

export const contractOption = new Option("--contract <ADDRESS>", "Contract address");
export const methodOption = new Option("--method <someContractMethod(arguments)>", "Contract method to interact with");
export const argumentsOption = new Option("--args, --arguments <arguments...>", "Arguments");
export const dataOption = new Option("--d, --data <Encoded transaction data>", "Transaction data (eg. 0x1234)");
export const abiOption = new Option("--abi <path/to/abi>", "Contract artifact or ABI file location");
export const showTransactionInfoOption = new Option(
  "--show-tx-info",
  "Show transaction request info (eg. encoded data)"
);

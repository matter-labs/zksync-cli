import { Option } from "commander";

import { l2Chains } from "../data/chains.js";

export const chainOption = new Option("--chain <chain>", "Chain to use").choices(
  l2Chains.map((chain) => chain.network)
);
export const chainWithL1Option = new Option("--chain <chain>", "Chain to use").choices(
  l2Chains.filter((e) => e.l1Chain).map((chain) => chain.network)
);
export const l1RpcUrlOption = new Option("--l1-rpc, --l1-rpc-url <URL>", "Override L1 RPC URL");
export const l2RpcUrlOption = new Option("--rpc, --l2-rpc, --l2-rpc-url <URL>", "Override L2 RPC URL");
export const accountOption = new Option("--address, --address <ADDRESS>", "Account address");
export const privateKeyOption = new Option("--pk, --private-key <URL>", "Private key of the sender");
export const amountOptionCreate = (action: string) =>
  new Option("--amount <amount>", `Amount of ETH to ${action} (e.g. 0.1)`);
export const recipientOptionCreate = (recipientLocation: string) =>
  new Option("--to, --recipient <address>", `Recipient address on ${recipientLocation} (0x address)`);
export const zeekOption = new Option(
  "--zeek",
  "zeek, the dev cat, will search for an inspirational quote and provide to you at the end of any command"
).hideHelp();

export type DefaultOptions = {
  zeek?: boolean;
};
export type DefaultTransactionOptions = DefaultOptions & {
  chain?: string;
  l1RpcUrl?: string;
  l2RpcUrl?: string;
  privateKey: string;
};
export type DefaultTransferOptions = DefaultTransactionOptions & {
  amount: string;
  recipient: string;
};

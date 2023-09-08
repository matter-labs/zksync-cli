import { Option } from "commander";

import { l2Chains } from "../data/chains";

export const chainOption = new Option("--c, --chain <chain>", "Chain to use").choices(
  l2Chains.filter((e) => e.l1Chain).map((chain) => chain.network)
);
export const l1RpcUrlOption = new Option("--l1-rpc, --l1-rpc-url <URL>", "Override L1 RPC URL");
export const l2RpcUrlOption = new Option("--l2-rpc, --l2-rpc-url <URL>", "Override L2 RPC URL");
export const privateKeyOption = new Option("--pk, --private-key <URL>", "Private key of the sender");
export const amountOptionCreate = (action: string) =>
  new Option("--a, --amount <amount>", `Amount of ETH to ${action} (eg. 0.1)`);
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
  l1RpcUrl: string;
  l2RpcUrl: string;
  privateKey: string;
};
export type DefaultTransferOptions = DefaultTransactionOptions & {
  amount: string;
  recipient: string;
};

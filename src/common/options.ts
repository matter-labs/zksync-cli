import { Option } from "commander";

export const l1RpcUrlOption = new Option("--l1-rpc, --l1-rpc-url <URL>", "Override L1 RPC URL");
export const l2RpcUrlOption = new Option("--l2-rpc, --l2-rpc-url <URL>", "Override L2 RPC URL");
export const privateKeyOption = new Option("-pk, --private-key <URL>", "Private key of the sender");
export const zeekOption = new Option(
  "--zeek",
  "zeek, the dev cat, will search for an inspirational quote and provide to you at the end of any command"
).hideHelp();

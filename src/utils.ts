import { utils } from "ethers";

import { track } from "./analytics";

import type { ethers } from "ethers";
import type { Provider } from "zksync-web3";

export const checkBalance = async function (
  address: string,
  amount: string,
  provider: Provider | ethers.providers.BaseProvider
) {
  const balance = await provider.getBalance(address);
  if (utils.parseEther(amount).gte(balance)) {
    console.error("Error: Not enough balance 🤕");
    await track("error", { error: "Not enough balance" });
    process.exit(-1);
  }
};

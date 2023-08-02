import { ethers, utils } from "ethers";
import { Provider } from "zksync-web3";
import { track } from "./analytics";

export const checkBalance = async function (
  address: string,
  amount: string,
  provider: Provider | ethers.providers.BaseProvider
) {
  const balance = await provider.getBalance(address);
  if (utils.parseEther(amount).gte(balance)) {
    console.error(`Error: Not enough balance 🤕`);
    await track("error", { error: `Not enough balance` });
    process.exit(-1);
  }
};

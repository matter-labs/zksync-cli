import { ethers, utils } from "ethers";
import { track } from "./analytics";

export const checkBalance = async function (
  address: string,
  amount: string,
  provider: ethers.providers.BaseProvider
) {
  const balance = await provider.getBalance(address);
  if (utils.parseEther(amount).gte(balance)) {
    console.error(`Error: Not enough balance 🤕`);
    await track("error", { error: `Not enough balance` });
    process.exit(-1);
  }
};

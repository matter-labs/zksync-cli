import { getAddress } from "ethers/lib/utils.js";
import { L2_ETH_TOKEN_ADDRESS } from "zksync-web3/build/src/utils.js";

export const ETH_TOKEN = {
  symbol: "ETH",
  name: "Ether",
  decimals: 18,
  address: getAddress(L2_ETH_TOKEN_ADDRESS),
  l1Address: "0x0000000000000000000000000000000000000000",
};

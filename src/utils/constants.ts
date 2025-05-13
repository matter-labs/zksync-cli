import { utils } from "zksync-ethers";
import { getAddress } from "ethers";

export const ETH_TOKEN = {
  symbol: "ETH",
  name: "Ether",
  decimals: 18,
  address: getAddress(utils.L2_BASE_TOKEN_ADDRESS),
  l1Address: "0x0000000000000000000000000000000000000000",
};

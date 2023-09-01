import { goerli, mainnet, sepolia, zkSync, zkSyncTestnet } from "@wagmi/core/chains";

import type { Chain } from "@wagmi/core/chains";

export const l1Chains = [mainnet, goerli, sepolia];

type L2Chain = Chain & { l1Chain?: Chain };
export const l2Chains: L2Chain[] = [
  { ...zkSync, l1Chain: mainnet },
  { ...zkSyncTestnet, l1Chain: goerli },
];

type Chain = {
  id: number;
  name: string;
  network: string;
  rpcUrl: string;
  explorerUrl?: string;
};

const mainnet: Chain = {
  id: 1,
  name: "Ethereum Mainnet",
  network: "mainnet",
  rpcUrl: "https://cloudflare-eth.com",
  explorerUrl: "https://etherscan.io",
};
const goerli: Chain = {
  id: 5,
  name: "Ethereum Goerli",
  network: "goerli",
  rpcUrl: "https://rpc.ankr.com/eth_goerli",
  explorerUrl: "https://goerli.etherscan.io",
};

export type L2Chain = Chain & { l1Chain?: Chain; verificationApiUrl?: string };
export const l2Chains: L2Chain[] = [
  {
    id: 280,
    name: "zkSync Era Testnet",
    network: "era-testnet",
    rpcUrl: "https://testnet.era.zksync.dev",
    explorerUrl: "https://goerli.explorer.zksync.io",
    verificationApiUrl: "https://zksync2-testnet-explorer.zksync.dev",
    l1Chain: goerli,
  },
  {
    id: 324,
    name: "zkSync Era Mainnet",
    network: "era-mainnet",
    rpcUrl: "https://mainnet.era.zksync.io",
    explorerUrl: "https://explorer.zksync.io",
    verificationApiUrl: "https://zksync2-mainnet-explorer.zksync.io",
    l1Chain: mainnet,
  },
  {
    id: 260,
    name: "Local In-memory node",
    network: "local-in-memory",
    rpcUrl: "http://127.0.0.1:8011",
  },
  {
    id: 270,
    name: "Local Dockerized node",
    network: "local-dockerized",
    rpcUrl: "http://127.0.0.1:3050",
    l1Chain: {
      id: 9,
      name: "L1 Local",
      network: "l1-local",
      rpcUrl: "http://127.0.0.1:8545",
    },
  },
];

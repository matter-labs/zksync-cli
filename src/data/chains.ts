export type Chain = {
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
const sepolia: Chain = {
  id: 11155111,
  name: "Ethereum Sepolia Testnet",
  network: "sepolia",
  rpcUrl: "https://rpc.ankr.com/eth_sepolia",
  explorerUrl: "https://sepolia.etherscan.io",
};

export type L2Chain = Chain & { l1Chain?: Chain; blockExplorerApiUrl?: string; verificationApiUrl?: string };
export const l2Chains: L2Chain[] = [
  {
    id: 300,
    name: "ZKsync Sepolia Testnet",
    network: "zksync-sepolia",
    rpcUrl: "https://sepolia.era.zksync.dev",
    explorerUrl: "https://sepolia.explorer.zksync.io",
    verificationApiUrl: "https://explorer.sepolia.era.zksync.dev",
    l1Chain: sepolia,
  },
  {
    id: 324,
    name: "ZKsync Mainnet",
    network: "zksync-mainnet",
    rpcUrl: "https://mainnet.era.zksync.io",
    explorerUrl: "https://explorer.zksync.io",
    verificationApiUrl: "https://zksync2-mainnet-explorer.zksync.io",
    l1Chain: mainnet,
  },
  {
    id: 2741,
    name: "Abstract Mainnet",
    network: "abstract",
    rpcUrl: "https://api.mainnet.abs.xyz",
    explorerUrl: "https://abscan.org",
    verificationApiUrl: "https://api.abscan.org/api",
    l1Chain: mainnet,
  },

  {
    id: 11124,
    name: "Abstract Testnet",
    network: "abstract-testnet",
    rpcUrl: "https://api.testnet.abs.xyz",
    explorerUrl: "https://sepolia.abscan.org",
    verificationApiUrl: "https://api-sepolia.abscan.org/api",
    l1Chain: sepolia,
  },

  // — Sophon —
  {
    id: 50104,
    name: "Sophon Mainnet",
    network: "sophon",
    rpcUrl: "https://rpc.sophon.xyz",
    explorerUrl: "https://explorer.sophon.xyz",
    verificationApiUrl: "https://verification-explorer.sophon.xyz/contract_verification",
    l1Chain: mainnet,
  },

  {
    id: 531050104,
    name: "Sophon Testnet",
    network: "sophon-testnet",
    rpcUrl: "https://rpc.testnet.sophon.xyz",
    explorerUrl: "https://explorer.testnet.sophon.xyz",
    verificationApiUrl: "https://api-explorer-verify.testnet.sophon.xyz/contract_verification",
    l1Chain: sepolia,
  },

  // — Cronos zkEVM —
  {
    id: 388,
    name: "Cronos zkEVM Mainnet",
    network: "cronos-zkevm-mainnet",
    rpcUrl: "https://mainnet.zkevm.cronos.org",
    explorerUrl: "https://explorer.zkevm.cronos.org",
    l1Chain: mainnet,
  },

  {
    id: 240,
    name: "Cronos zkEVM Sepolia Testnet",
    network: "cronos-zkevm-testnet",
    rpcUrl: "https://testnet.zkevm.cronos.org",
    explorerUrl: "https://explorer.zkevm.cronos.org/testnet",
    l1Chain: sepolia,
  },

  // — Lens Chain —
  {
    id: 232,
    name: "Lens Chain Mainnet",
    network: "lens-mainnet",
    rpcUrl: "https://rpc.lens.xyz",
    explorerUrl: "https://explorer.lens.xyz",
    verificationApiUrl: "https://verify.lens.xyz/contract_verification",
    l1Chain: mainnet,
  },

  {
    id: 37111,
    name: "Lens Chain Testnet",
    network: "lens-testnet",
    rpcUrl: "https://rpc.testnet.lens.xyz",
    explorerUrl: "https://explorer.testnet.lens.xyz",
    verificationApiUrl: "https://api-explorer-verify.staging.lens.zksync.dev/contract_verification",
    l1Chain: sepolia,
  },

  // — OpenZK —
  {
    id: 1345,
    name: "OpenZK Mainnet",
    network: "openzk-mainnet",
    rpcUrl: "https://rpc.openzk.net",
    explorerUrl: "https://openzk.calderaexplorer.xyz/",
    verificationApiUrl: "https://openzk.calderaexplorer.xyz/api",
    l1Chain: mainnet,
  },

  {
    id: 4681,
    name: "OpenZK Testnet",
    network: "openzk-testnet",
    rpcUrl: "https://openzk-testnet.rpc.caldera.xyz/http",
    verificationApiUrl: "https://openzk-testnet.explorer.caldera.xyz/api",
    explorerUrl: "https://openzk-testnet.explorer.caldera.xyz/",
    l1Chain: sepolia,
  },

  // — Wonder Chain Testnet —
  {
    id: 96371,
    name: "Wonder Chain Testnet",
    network: "wonderchain-testnet",
    rpcUrl: "https://rpc.testnet.wonderchain.org",
    explorerUrl: "https://explorer.testnet.wonderchain.org",
    verificationApiUrl: "https://rpc-explorer-verify.testnet.wonderchain.org/contract_verification",
    l1Chain: sepolia,
  },

  // — zkCandy —
  {
    id: 320,
    name: "ZKcandy Mainnet",
    network: "zkcandy-mainnet",
    rpcUrl: "https://rpc.zkcandy.io",
    explorerUrl: "https://explorer.zkcandy.io",
    verificationApiUrl: "https://contracts.zkcandy.io",
    l1Chain: mainnet,
  },
  {
    id: 302,
    name: "ZKcandy Sepolia Testnet",
    network: "zkcandy-testnet",
    rpcUrl: "https://sepolia.rpc.zkcandy.io",
    explorerUrl: "https://sepolia.explorer.zkcandy.io",
    verificationApiUrl: "https://sepolia.contracts.zkcandy.io",
    l1Chain: sepolia,
  },

  // — Local Dev —
  {
    id: 260,
    name: "Anvil-ZKsync",
    network: "in-memory-node",
    rpcUrl: "http://127.0.0.1:8011",
    l1Chain: {
      id: 9,
      name: "Anvil",
      network: "l1-local",
      rpcUrl: "http://127.0.0.1:8012",
    },
  },
  {
    id: 270,
    name: "Dockerized local node",
    network: "dockerized-node",
    rpcUrl: "http://127.0.0.1:3050",
    l1Chain: {
      id: 9,
      name: "L1 Local Docker",
      network: "l1-local",
      rpcUrl: "http://127.0.0.1:8545",
    },
  },
];

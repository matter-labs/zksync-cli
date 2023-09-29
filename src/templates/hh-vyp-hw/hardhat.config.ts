import "@nomiclabs/hardhat-vyper";
import { HardhatUserConfig } from "hardhat/config";

import "@matterlabs/hardhat-zksync-vyper";
import "@matterlabs/hardhat-zksync-deploy";

import "@matterlabs/hardhat-zksync-verify-vyper";

// dynamically changes endpoints for local tests
export const zkSyncTestnet =
  process.env.NODE_ENV == "test"
    ? {
        url: "http://127.0.0.1:8011",
        ethNetwork: "http://127.0.0.1:8545",
        zksync: true,
      }
    : {
        url: "https://zksync2-testnet.zksync.dev",
        ethNetwork: "goerli",
        zksync: true,
      };

const config: HardhatUserConfig = {
  zkvyper: {
    version: "latest",
    settings: {},
  },
  defaultNetwork: "zkSyncTestnet",
  networks: {
    hardhat: {
      zksync: false,
    },
    zkSyncTestnet,
  },
  // Currently, only Vyper 0.3.3 or 0.3.9 are supported.
  vyper: {
    version: "0.3.3",
  },
  solidity: {
    version: "0.8.17",
  },
};

export default config;

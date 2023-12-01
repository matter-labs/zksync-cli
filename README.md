<div align="center">

# ‣ zkSync CLI 

![zkSync CLI](./zksync-cli-banner.png)

This CLI tool simplifies the process of developing applications and interacting with zkSync.

[Documentation](https://era.zksync.io/docs/tools/zksync-cli) | [Report a bug](https://github.com/matter-labs/zksync-cli/issues/new) | [Request a feature](https://github.com/matter-labs/zksync-cli/issues/new)

[pr-welcome]: https://img.shields.io/static/v1?color=indigo&label=PRs&style=flat&message=welcome

</div>

## 🛠 Prerequisites

- [Node.js v18 or higher](https://nodejs.org/en)
- [Git](https://git-scm.com/downloads)
- [Docker](https://www.docker.com/get-started/) (for `zksync-cli dev` commands)
- [Yarn](https://v3.yarnpkg.com/getting-started/install) (for `zksync-cli create` commands)

## 📥 Usage

You can run commands without installation: `npx zksync-cli`. For example: `npx zksync-cli dev start`.

## 💻 Commands

### Local development commands
`npx zksync-cli dev` - Manage local zkSync development environment. It allows to easily start zkSync stack locally, for example: local Ethereum and zkSync nodes, Block Explorer, Wallet and Bridge.

- `npx zksync-cli dev start` - start local development environment (will ask to configure if starting for the first time)
- `npx zksync-cli dev clean` - clean data for configured modules
- `npx zksync-cli dev config` - select modules to run in local development environment

Run `npx zksync-cli dev` to see the full list of commands.

### Create Project commands
- `npx zksync-cli create`: Create a project using updated templates.
  - **Frontend**: Rapid UI development with templates for Vue, React, Next.js, Nuxt, Vite, etc. Options include viem, ethers, web3modal, rainbowkit. [More Info](https://github.com/matter-labs/zksync-frontend-templates#readme)
  - **Contracts**: Quick contract deployment and testing with tools like Hardhat on Solidity or Vyper. [Contract templates](https://github.com/matter-labs/zksync-contract-templates#readme)
  - **Scripting**: Automated interactions and advanced zkSync operations using Node.js, with examples of wallet or contract interactions using viem or ethers. [Scripting Templates](https://github.com/matter-labs/zksync-scripting-templates#readme)

### Contract interaction commands
- `npx zksync-cli contract read`: run read-only contract methods
- `npx zksync-cli contract write`: send transactions to the contract

See full documentation and advanced examples [here](./docs/contract-interaction.md).

### Wallet commands
- `npx zksync-cli wallet transfer`: send ETH on L2 to another account
- `npx zksync-cli wallet balance`: displays ETH balance of the specified address

### Bridge commands
- `npx zksync-cli bridge deposit`: deposits funds from Ethereum (L1) to zkSync (L2)
- `npx zksync-cli bridge withdraw`: withdraws funds from zkSync (L2) to Ethereum (L1)
- `npx zksync-cli bridge withdraw-finalize`: finalizes withdrawal of funds from zkSync (L2) to Ethereum (L1)

### Other commands
- `npx zksync-cli help`: Provides information about all supported commands
- `npx zksync-cli <command> --help`: Provides detailed information about how to use a specific command. Replace \<command\> with the name of the command you want help with (e.g., `create`, `dev config`, `bridge withdraw-finalize`)
- `npx zksync-cli --version`: Returns the current version


### 🔗 Supported bridge chains

By default zkSync CLI bridge commands support Era Testnet and Era Mainnet. You can also use other networks by overwriting L1 and L2 RPC URLs. For example: `npx zksync-cli deposit --l2-rpc=http://... --l1-rpc=http://...`

If you're using [local setup (dockerized testing node)](https://github.com/matter-labs/local-setup) with default L1 and L2 RPC URLs, you can select `Local Dockerized node` option in the CLI or provide option `--chain local-dockerized`.

## 👩‍💻 Developing new features

### Run in development mode

1. Install all dependencies with `npm i`.
2. To use CLI in development mode run `npm run dev -- [command] [options]` (e.g. `npm run dev -- bridge deposit --chain=zksync-goerli`).

### Building for production

1. Install all dependencies with `npm i`.
2. This project was build with Typescript. Run `npm run build` to compile the code into `/bin`.
3. You can run your local build with `node ./bin`

### Testing

At the moment, we don't have any tests, but we are working on it.
In the meantime, you can test the code manually by running the code in [development mode](#run-in-development-mode).

## 🌍 Official Links

- [Website](https://zksync.io/)
- [GitHub](https://github.com/matter-labs)
- [Twitter](https://twitter.com/zksync)
- [Twitter for Devs](https://twitter.com/zkSyncDevs)
- [Discord](https://join.zksync.dev/)

## 📜 License

This project is licensed under [MIT](./LICENSE-MIT).

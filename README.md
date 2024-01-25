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
- `npx zksync-cli contract encode`: get calldata from the contract method

See full documentation and advanced examples [here](./docs/contract-interaction.md).

### Wallet commands
- `npx zksync-cli wallet transfer`: send funds on L2 to another account
- `npx zksync-cli wallet balance`: displays token balance of the specified address

### Bridge commands
- `npx zksync-cli bridge deposit`: deposits funds from Ethereum (L1) to zkSync (L2)
- `npx zksync-cli bridge withdraw`: withdraws funds from zkSync (L2) to Ethereum (L1)
- `npx zksync-cli bridge withdraw-finalize`: finalizes withdrawal of funds from zkSync (L2) to Ethereum (L1)

### Other commands
- `npx zksync-cli config chains`: Add or edit custom chains
- `npx zksync-cli help`: Provides information about all supported commands
- `npx zksync-cli <command> --help`: Provides detailed information about how to use a specific command. Replace \<command\> with the name of the command you want help with (e.g., `create`, `dev config`, `bridge withdraw-finalize`)
- `npx zksync-cli --version`: Returns the current version


### 🔗 Supported chains

By default zkSync CLI bridge commands support zkSync Sepolia Testnet, zkSync Goerli Testnet and zkSync Mainnet. You can also use other networks by using one the options below:
- Adding custom chain using `npx zksync-cli config chains` command.
- Overwriting L1 and L2 RPC URLs. For example: `npx zksync-cli deposit --rpc=http://... --l1-rpc=http://...`

If you're using [local setup (dockerized testing node)](https://github.com/matter-labs/local-setup) with default L1 and L2 RPC URLs, you can select `Local Dockerized node` option in the CLI or provide option `--chain local-dockerized`.

## 👩‍💻 Developing new features

### Run in development mode

1. Install all dependencies with `npm i`.
2. To use CLI in development mode run `npm run dev -- [command] [options]` (e.g. `npm run dev -- bridge deposit --chain=zksync-sepolia`).

### Building for production

1. Install all dependencies with `npm i`.
2. This project was build with Typescript. Run `npm run build` to compile the code into `/bin`.
3. You can run your local build with `node ./bin`

### Testing

At the moment, we are working on CLI tests.
In the meantime, you can test the code manually by running the code in [development mode](#run-in-development-mode).

### CLI tests

To run CLI tests for zksync-cli do the following:
1. Go to [cli-tests](`./src/tests/cli-tests`) folder
2. Run `npm i` and install zksync-cli `npm i zksync-cli`
3. Make sure you have [Docker](https://docs.docker.com/engine/install/) on your system.
4. Make sure you have `.env` file with your wallet private key in `src\tests\cli-tests\src\` dir. Key is `E2E_TESTNET_PK`. It may looks like `E2E_TESTNET_PK=012345...abcdef`
5. Run `npm test`

## 🌍 Official Links

- [Website](https://zksync.io/)
- [GitHub](https://github.com/matter-labs)
- [Twitter](https://twitter.com/zksync)
- [Twitter for Devs](https://twitter.com/zkSyncDevs)
- [Discord](https://join.zksync.dev/)
- [Youtube](https://www.youtube.com/@zkSync-era)

## 📜 License

This project is licensed under [MIT](./LICENSE-MIT).

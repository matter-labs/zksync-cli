<div align="center">

# ‣ zkSync Era CLI 

![zksync cli](./zksync-cli-banner.png)

This CLI tool simplifies the process of developing applications and interacting with zkSync Era.

[Documentation](https://era.zksync.io/docs/tools/zksync-cli) | [Report a bug](https://github.com/matter-labs/zksync-cli/issues/new) | [Request a feature](https://github.com/matter-labs/zksync-cli/issues/new)

[pr-welcome]: https://img.shields.io/static/v1?color=indigo&label=PRs&style=flat&message=welcome

</div>

## 🛠 Prerequisites

- [Node.js v18.x](https://nodejs.org/en)
- [Docker](https://www.docker.com/get-started/) (for `zksync-cli local` commands)

## 📥 Installation

You can install this program globally with `npm i -g zksync-cli` or run the commands directly via NPX with `npx zksync-cli@latest {COMMAND}`.

## 💻 Commands

- `zksync-cli deposit`: deposits funds from Ethereum (L1) to zkSync (L2)

- `zksync-cli withdraw`: withdraws funds from zkSync (L2) to Ethereum (L1)

- `zksync-cli withdraw-finalize`: finalizes withdrawal of funds from zkSync (L2) to Ethereum (L1)

- `zksync-cli create-project {FOLDER_NAME}`: creates project from template in the specified folder

- `zksync-cli help`: Provides information about all supported commands

- `zksync-cli help <command>`: Provides detailed information about how to use a specific command. Replace <command> with the name of the command you want help with (e.g., create-project, deposit, withdraw, withdraw-finalize)

- `zksync-cli --version`: Returns the current version

- `zksync-cli local` - All-in-one tool for local zkSync development. It supports a set of sub-subcommands:
  - `zksync-cli local start` - start local setup (will ask to configure if starting for the first time)
  - `zksync-cli local stop` - stop currently running modules
  - `zksync-cli local restart` - restart config modules
  - `zksync-cli local clean` - clean data for all modules
  - `zksync-cli local config` - setup new config for local setup (select modules)

### 🔗 Supported chains

By default zkSync CLI supports Era Testnet and Era Mainnet. You can also use other networks by overwriting L1 and L2 RPC URLs. For example: `zksync-cli deposit --l2-rpc=http://... --l1-rpc=http://...`

If you're using [local setup (dockerized testing node)](https://github.com/matter-labs/local-setup) with default L1 and L2 RPC URLs, you can select `Local Dockerized node` option in the CLI or provide option `--chain local-dockerized`.

### ⚙️ Options (flags)
- `--zeek`: zeek, the dev cat, will search for an inspirational quote and provide to you at the end of any command.

## 👩‍💻 Developing new features

### Run in development mode

1. Install all dependencies with `npm i`.
2. To use CLI in development mode run `npm run dev -- [command] [options]` (eg. `npm run dev -- deposit --chain=era-testnet`).

### Building for production

1. Install all dependencies with `npm i`.
2. This project was build with Typescript. Run `npm run build` to compile the code into `/bin`.
3. You can run your local build with `node ./bin`

### Testing

1. Make sure you have all dependencies installed with `npm i`.
2. Run `npm run test` to run all tests.

### 📊 Tracking

zkSync-cli tracks its usage for the single purpose of providing data so it can be improved. Data is fully anonymized. If you want to disable the tracking, set the environment variable `NO_TRACKING` to `true`.

## 🌍 Official Links

- [Website](https://zksync.io/)
- [GitHub](https://github.com/matter-labs)
- [Twitter](https://twitter.com/zksync)
- [Discord](https://join.zksync.dev/)

## 📜 License

This project is licensed under [MIT](./LICENSE-MIT).
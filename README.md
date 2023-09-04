<div align="center">

# ‣ zkSync Era CLI 

![zksync cli](./zksync-cli-banner.png)

This CLI tool simplifies the process of developing applications and interacting with zkSync Era.

[Documentation](https://era.zksync.io/docs/tools/zksync-cli) | [Report a bug](https://github.com/matter-labs/zksync-cli/issues/new) | [Request a feature](https://github.com/matter-labs/zksync-cli/issues/new)

[pr-welcome]: https://img.shields.io/static/v1?color=indigo&label=PRs&style=flat&message=welcome

</div>

## 🛠 Prerequisites

- Node.js v18.x
- NPM / Yarn

## 📥 Installation

You can install this program globally with `npm i -g zksync-cli` or run the commands directly via NPX with `npx zksync-cli@latest {COMMAND}`.

## 💻 Commands

- `zksync-cli help`: Provides detailed information about each command. 

- `zksync-cli create {PROJECT_NAME}`: creates a new project in the given project name. If not provided, creates the project in the current folder, although this requires the folder to be empty.

- `zksync-cli deposit`: deposits funds from L1 to L2 (local, testnet or mainnet). It will ask to enter: network, recipient wallet, amount in ETH (eg 0.1) and the private key of the wallet you're sending the funds from.

- `zksync-cli withdraw`: withdraws funds from zkSync 2.0 to L1 (Goerli testnet). It will ask to enter: network, recipient wallet, amount in ETH (eg 0.1) and the private key of the wallet you're sending the funds from.

- `zksync-cli confirm-withdraw`: confirms withdrawal of funds from zkSync 2.0 to L1 (Goerli testnet). It will ask to enter: network, withdrawal transaction address and the private key of the wallet you sent the funds from.

- `zksync-cli <command> --help`: Provides detailed information about how to use a specific command. Replace <command> with the name of the command you want help with (e.g., create, deposit, withdraw, confirm-withdraw).

- `zksync-cli --version`: Returns the current version.

- `zksync-cli localnet`: Manages a local zkSync Era and Ethereum L1 testnet (it requires docker running on your system). It supports a set of sub-subcommands:
  - `zksync-cli localnet up`: Bootstrap L1 and L2 localnets.
  - `zksync-cli localnet down`: clear L1 and L2 localnets.
  - `zksync-cli localnet start`: start L1 and L2 localnets.
  - `zksync-cli localnet stop`: stop L1 and L2 localnets.
  - `zksync-cli localnet logs`: Display logs.
  - `zksync-cli localnet help`: Display this message and quit.
  - `zksync-cli localnet wallets`: Display seeded wallet keys.

### ⚙️ Options (flags)

- `--l1-rpc-url`: override the default L1 rpc URL when `localnet` is selected as the network. Usage `--l1-rpc-url=http://...`.
- `--l2-rpc-url`: override the default L2 rpc URL when `localnet` is selected as the network. Usage `--l1-rpc-url=http://...`.
- `--zeek`: zeek, the dev cat, will search for an inspirational quote and provide to you at the end of any command.

## 👩‍💻 Developing new features

### Install and build

1. Install all dependencies with `npm i`.
2. This project was build with Typescript. Run `npm run build` to compile code in `/src` into `/bin`.
3. You can run your local build with `node ./bin`

### Testing

> ⚠️ This project does not have unit tests yet 🤕

Proper tests will be included soon. For now, you can test new changes manually by running your build (refer to [Install and build](#install-and-build)).


### 📊 Tracking

zkSync-cli tracks its usage for the single purpose of providing data so it can be improved. Data is fully anonymized. If you want to disable the tracking, set the environment variable `NO_TRACKING` to `true`.

## 🌍 Official Links

- [Website](https://zksync.io/)
- [GitHub](https://github.com/matter-labs)
- [Twitter](https://twitter.com/zksync)
- [Discord](https://join.zksync.dev/)

## 📜 License

This project is licensed under [MIT](./LICENSE-MIT).
# zkSync CLI tool

This CLI tool simplifies the process of developing applications and interacting with zkSync 2.0.

## Requirements

- Node/NPM
- Yarn

## Usage

You can install this program globally with `npm i -g zksync-cli` or run the commands direcly with npx with `npx zksync-cli@latest {COMMAND}`.

### Commands

- `zksync-cli help`: Provides detailed information about each command. 

- `zksync-cli create {PROJECT_NAME}`: creates a new Hardhat project in the given project name. If not provided, creates the project in the current folder, although this requires the folder to be empty.

- `zksync-cli deposit`: deposits funds from L1 (Goerli testnet) to zkSync 2.0 testnet. It will ask to enter: network, recipient wallet, amount in ETH (eg 0.1) and the private key of the wallet you're sending the funds from.

- `zksync-cli withdraw`: withdraws funds from zkSync 2.0 to L1 (Goerli testnet). It will ask to enter: network, recipient wallet, amount in ETH (eg 0.1) and the private key of the wallet you're sending the funds from.

- `zksync-cli confirm-withdrawal`: confirms withdrawal of funds from zkSync 2.0 to L1 (Goerli testnet). It will ask to enter: network, withdrawal transaction address and the private key of the wallet you sent the funds from.

- `zksync-cli <command> --help`: Provides detailed information about how to use a specific command. Replace <command> with the name of the command you want help with (e.g., create, deposit, withdraw).

> Both deposit and withdraw might take a couple of minutes to complete.


### Options (flags)

- `--zeek`: zeek, the dev cat, will search for an inspirational quote and provide to you at the end of any command.
- `--l1-rpc-url`: override the default Goerli L1 rpc URL when `localnet` is selected as the network.
- `--l2-rpc-url`: override the default zkSync testnet rpc URL when `localnet` is selected as the network.

## Developing new features

### Install and build

Install all dendencies with `npm i`.
This project was build with Typescript. Run `npm run build` to compile code in `/src` into `/bin`.

To create a version run:

```sh
git tag v0.1.3    // with the correspondent tag
git push --tags  
```

### Testing

Proper tests will be included soon. For now, you can test new changes locally by installing this package globably with `npm i -g`.


### Tracking

zkSync-cli tracks its usage for the single purpose of providing data so it can be improved. Data is fully anonymized. If you want to disable the tracking, set the environment variable NO_TRACKING to true.

## Official Links

- [Website](https://zksync.io/)
- [GitHub](https://github.com/matter-labs)
- [Twitter](https://twitter.com/zksync)
- [Discord](https://discord.gg/nMaPGrDDwk)

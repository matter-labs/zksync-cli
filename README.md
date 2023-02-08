# zkSync CLI tool

This CLI tool simplifies the process of developing applications and interacting with zkSync 2.0.

## Requirements

- Node/NPM
- Yarn

## Usage

You can install this program globally with `npm i -g zksync-cli` or run the commands direcly with npx with `npx zksync-cli@latest {COMMAND}`.

### Commands

- `zksync-cli create {PROJECT_NAME}`: creates a new Hardhat project in the given project name. If not provided, creates the project in the current folder, although this requires the folder to be empty.

- `zksync-cli deposit`: deposits funds from L1 (Goerli testnet) to zkSync 2.0 testnet. It will ask to enter: recipient wallet, amount in ETH (eg 0.1) and the private key of the wallet you're sending the funds from.

- `zksync-cli withdraw`: withdraws funds from zkSync 2.0 to L1 (Goerli testnet). It will ask to enter: recipient wallet, amount in ETH (eg 0.1) and the private key of the wallet you're sending the funds from.

> Both deposit and withdraw might take a couple of minutes to complete.

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

## Official Links

- [Website](https://zksync.io/)
- [GitHub](https://github.com/matter-labs)
- [Twitter](https://twitter.com/zksync)
- [Discord](https://discord.gg/nMaPGrDDwk)

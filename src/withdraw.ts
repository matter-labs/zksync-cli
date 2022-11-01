// import { Wallet, Provider, utils } from 'zksync-web3';
// import * as ethers from 'ethers';
// import { HardhatRuntimeEnvironment } from 'hardhat/types';
// import { Deployer } from '@matterlabs/hardhat-zksync-deploy';

import chalk from 'chalk';

export default async function () {
  console.log(chalk.magentaBright('Withdrawing funds from L2 wallet'));

  // // Initialize the wallet.
  // const provider = new Provider('https://zksync2-testnet.zksync.dev');
  // const wallet = new Wallet(WALLET_PRIV_KEY);

  // const AMOUNT = '0.1';

  // // Create deployer object and load the artifact of the contract you want to deploy.
  // const deployer = new Deployer(hre, wallet);

  // // Deposit funds to L2
  // const depositHandle = await deployer.zkWallet.deposit({
  //   // to: deployer.zkWallet.address,
  //   to: '0x051291a08df689f8000a640ff0321fb5a91c6be0',
  //   token: utils.ETH_ADDRESS,
  //   amount: ethers.utils.parseEther(AMOUNT),
  // });
  // // Wait until the deposit is processed on zkSync
  // await depositHandle.wait();
}

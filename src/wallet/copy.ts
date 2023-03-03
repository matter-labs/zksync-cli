import fs from 'fs/promises';
import { getZKSYNCDir } from "../utils";
import chalk from 'chalk';
import { WALLET_FILE } from '../constants';
import Wallet from 'ethereumjs-wallet';
import { uniqueNamesGenerator, colors, animals } from 'unique-names-generator';

interface ICopyWalletOption {
    publicKey?: string;
    address?: string;
    nickname?: string;
    pathTo?: string;
}

export default async function copyWallet({ publicKey, address, nickname, pathTo }: ICopyWalletOption) {
    if (!publicKey && !address && !nickname) {
        console.log(chalk.redBright("Please provide a public key, address or nickname to copy a private key."));
        return ;
    }
    let crediential = publicKey || address || nickname;
    if(!pathTo){
        console.log(chalk.magentaBright(`Copying wallet with ${crediential} to ${process.cwd()}/.env ...`));
    } else {
        console.log(chalk.magentaBright(`Copying wallet with ${crediential} to ${pathTo}.env ...`));
    }

    try {
        await fs.access(`${getZKSYNCDir()}/${WALLET_FILE}`);
        // file exists
        const content = await fs.readFile(`${getZKSYNCDir()}/${WALLET_FILE}`);
        const json = JSON.parse(content.toString());
        const newJson = json.filter((wallet: any) => {
            return wallet.publicKey === crediential || wallet.address === crediential || wallet.nickname === crediential;
        });
        // https://github.com/matter-labs/zksync-hardhat-template/blob/main/.env.example
        if(!pathTo){
            await fs.writeFile(`${process.cwd()}/.env`, "WALLET_PRIVATE_KEY=" + newJson[0].privateKey);
        } else {
            await fs.writeFile(`${pathTo}.env`, "WALLET_PRIVATE_KEY=" + newJson[0].privateKey);
        }

    } catch (e) {
        console.log(chalk.red("Error on copying private key to environment"))
    }
}
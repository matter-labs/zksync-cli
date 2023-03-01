import fs from 'fs/promises';
import { getZKSYNCDir } from "../utils";
import chalk from 'chalk';
import { WALLET_FILE } from '../constants';
import { parseArgs } from "node:util";

interface IDeleteWalletOption {
    publicKey?: string;
    address?: string;
    nickname?: string;
}

export default async function deleteWallet({ publicKey, address, nickname }: IDeleteWalletOption) {
    if (!publicKey && !address && !nickname) {
        console.log(chalk.redBright("Please provide a public key, address or nickname to delete a wallet."));
        return ;
    }
    let crediential = publicKey || address || nickname;
    console.log(chalk.magentaBright(`Deleting wallet with ${crediential}...`));

    try {
        await fs.access(`${getZKSYNCDir()}/${WALLET_FILE}`);
        // file exists
        const content = await fs.readFile(`${getZKSYNCDir()}/${WALLET_FILE}`);
        const json = JSON.parse(content.toString());
        const newJson = json.filter((wallet: any) => {
            return wallet.publicKey !== crediential && wallet.address !== crediential && wallet.nickname !== crediential;
        });
        if (newJson.length === json.length) {
            console.log(chalk.redBright("No wallet found with the given crediential."));
            return ;
        }
        await fs.writeFile(`${getZKSYNCDir()}/${WALLET_FILE}`, JSON.stringify(newJson));
        console.log(chalk.greenBright("Wallet deleted successfully."));
    } catch (e) {
        // file does not exist
        console.log(chalk.red("No wallet file found. Please create a wallet first."));
    }
}
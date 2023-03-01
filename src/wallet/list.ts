import chalk from "chalk";
import fs from 'fs/promises';
import { getZKSYNCDir } from "../utils";
import { WALLET_FILE } from "../constants";

export default async function listWallets() {
    console.log(chalk.magentaBright("Listing wallets..."));
    // access wallet file
    try {
        await fs.access(`${getZKSYNCDir()}/${WALLET_FILE}`)
        // file exists
        const content = await fs.readFile(`${getZKSYNCDir()}/${WALLET_FILE}`);
        const json = JSON.parse(content.toString()).map((wallet: any) => {
            return {
                address: wallet.address,
                nickname: wallet.nickname,
            };
        });
        
        console.table(json);
    } catch (e) {
        // file does not exist
        console.log(chalk.red("No wallet file found. Please create a wallet first."));
    }
}
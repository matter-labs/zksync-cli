import fs from 'fs/promises';
import { getZKSYNCDir } from "../utils";
import chalk from 'chalk';
import { WALLET_FILE } from "../constants";

export default async function cleanWallets() {
    console.log(chalk.magentaBright("Cleaning wallets..."));
    // access wallet file
    try {
        await fs.access(`${getZKSYNCDir()}/${WALLET_FILE}`)
        // file exists
        await fs.writeFile(`${getZKSYNCDir()}/${WALLET_FILE}`, JSON.stringify([]));
        console.log(chalk.greenBright("Wallets cleaned successfully."));
    } catch (e) {
        // file does not exist
        console.log(chalk.red("No wallet file found. Please create a wallet first."));
    }
}
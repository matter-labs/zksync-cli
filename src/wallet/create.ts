import chalk from 'chalk';
import Wallet from 'ethereumjs-wallet';
import { getZKSYNCDir } from '../utils';
import fs from 'fs/promises';
import { WALLET_FILE } from '../constants';
import { uniqueNamesGenerator, colors, animals } from 'unique-names-generator';

interface IWalletCreateResult {
    address: string
    privateKey: string
    publicKey: string
    nickname: string
}

interface IWalletCreateOption {
    count: number
}

export default async function({ count }: IWalletCreateOption): Promise<IWalletCreateResult[]> {
    console.log(chalk.magentaBright(`Creating ${count} wallets...`))
    console.log(chalk.redBright('WARNING: Your private keys are stored in plain text. Only use this for testing purposes.'))
    console.log(chalk.redBright('To check your private keys, look at $HOME/.zksync/wallet.json'))
    const wallets = []
    for (let i = 0; i < count; i++) {
        wallets.push(Wallet.generate())
    }
    const results = wallets.map((wallet, i) => {
        const address = wallet.getAddressString()
        const privateKey = wallet.getPrivateKeyString()
        const publicKey = wallet.getPublicKeyString()
        const nickname = uniqueNamesGenerator({ dictionaries: [colors, animals] })
        console.log(chalk.magentaBright(`Wallet ${i + 1}:`))
        console.log(chalk.green(`Address: ${address}`))
        console.log(chalk.green(`Private key: ${privateKey}`))
        console.log(chalk.green(`Public key: ${publicKey}`))
        console.log(chalk.green(`Nickname: ${nickname}`))
        console.log(chalk.magentaBright('---------------------'))
        return {
            address,
            privateKey,
            publicKey,
            nickname,
        };
    });
    const zkWalletFile = `${getZKSYNCDir()}/${WALLET_FILE}`;

    try {
        await fs.access(zkWalletFile);
        // file exists
        const content = await fs.readFile(zkWalletFile);
        const json = JSON.parse(content.toString());
        const newJson = [...json, ...results];
        await fs.writeFile(zkWalletFile, JSON.stringify(newJson));
    } catch (e) {
        // file does not exist
        await fs.writeFile(zkWalletFile, JSON.stringify(results));
    }

    return results;
}
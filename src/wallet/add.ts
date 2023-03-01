import fs from 'fs/promises';
import { getZKSYNCDir } from "../utils";
import chalk from 'chalk';
import { WALLET_FILE } from '../constants';
import Wallet from 'ethereumjs-wallet';
import { uniqueNamesGenerator, colors, animals } from 'unique-names-generator';

interface IAddWalletOption {
    publicKey?: string;
    nickname?: string;
    privateKey?: string;
}

export default async function addWallet({ nickname, privateKey }: IAddWalletOption) {
    if (!privateKey) {
        console.log(chalk.redBright("Please provide a private Key to add a wallet."));
        return ;
    }
    // trim 0x from private key
    if (privateKey.startsWith('0x')) {
        privateKey = privateKey.slice(2);
    }
    let wallet = Wallet.fromPrivateKey(Buffer.from(privateKey, 'hex'));
    if (!wallet) {
        console.log(chalk.redBright("Invalid public key or private key."));
        return ;
    }
    console.log(chalk.magentaBright(`Adding wallet with ${wallet.getAddressString()}...`));
    
    nickname = nickname || uniqueNamesGenerator({ dictionaries: [colors, animals] });

    try {
        fs.access(`${getZKSYNCDir()}/${WALLET_FILE}`);
        // file exists
        const content = await fs.readFile(`${getZKSYNCDir()}/${WALLET_FILE}`);
        const json = JSON.parse(content.toString());
        const duplicate = json.filter((temp: any) => {
            return (temp.publicKey === wallet.getPublicKeyString() && temp.address === wallet.getAddressString()) || temp.nickname === nickname;
        })
        if (duplicate.length > 0) {
            console.log(chalk.redBright("Wallet already exists."));
            return ;
        }
        json.push({
            nickname,
            address: wallet.getAddressString(),
            publicKey: wallet.getPublicKeyString(),
            privateKey: wallet.getPrivateKeyString(),
        });
        await fs.writeFile(`${getZKSYNCDir()}/${WALLET_FILE}`, JSON.stringify(json));
        console.log(chalk.greenBright("Wallet added successfully."));
    } catch (e) {
        console.log(e)
        // file does not exist
        const json = [{
            nickname,
            address: wallet.getAddressString(),
            publicKey: wallet.getPublicKeyString(),
            privateKey: wallet.getPrivateKeyString(),
        }];
        await fs.writeFile(`${getZKSYNCDir()}/${WALLET_FILE}`, JSON.stringify(json));
    }
}
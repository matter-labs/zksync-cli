import chalk from "chalk";
import { FUND_URL } from '../constants';

interface IFundWalletOptions {
    address: string;
}

export default function fundWallet({ address }: IFundWalletOptions) {
    console.log(chalk.magentaBright(`Funding wallet with address ${address}...`));
    const newURL = FUND_URL.replace('{ADDR}', address);
    console.log(chalk.greenBright(`Please visit \n ${newURL} \n to fund your wallet.`));
}
import { parseArgs } from 'node:util';
import createWallet from './create';
import deleteWallet from './delete';
import listWallet from './list';
import cleanWallets from './clean';
import addWallet from './add';
import fundWallet from './fund';

enum WalletCommands {
    // Create a new wallet
    Create = 'create',
    // List all wallets
    List = 'ls',
    // Delete a wallet
    Delete = 'delete',
    // Clean all wallets
    Clean = 'clean',
    // Add a new wallet
    Add = 'add',
    // Add funds to a wallet
    Fund = 'fund',
}

interface IWalletOptions {
    option: WalletCommands;
    args: string[];
}

export default function wallet({option, args}: IWalletOptions) {
    switch (option) {
        case WalletCommands.Create:
            createWallet({
                count: parseInt(args[0], 10),
            });
            break;
        case WalletCommands.List:
            listWallet();
            break;
        case WalletCommands.Delete:
            const deleteArgs = parseArgs({
                args,
                options: {
                    publicKey: {
                        type: 'string',
                        short: 'p',
                    },
                    address: {
                        type: 'string',
                        short: 'a',
                    },
                    nickname: {
                        type: 'string',
                        short: 'n',
                    },
                }
            })
            deleteWallet(deleteArgs.values);
            break;
        case WalletCommands.Clean:
            cleanWallets();
            break;
        case WalletCommands.Add:
            const addArgs = parseArgs({
                args,
                options: {
                    privateKey: {
                        type: 'string',
                        short: 'p',
                    },
                    nickname: {
                        type: 'string',
                        short: 'n',
                    },
                }
            })
            addWallet(addArgs.values);
            break;
        case WalletCommands.Fund:
            fundWallet({
                address: args[0],
            });
            break;
    }
}

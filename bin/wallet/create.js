"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const ethereumjs_wallet_1 = __importDefault(require("ethereumjs-wallet"));
const utils_1 = require("../utils");
const promises_1 = __importDefault(require("fs/promises"));
const constants_1 = require("../constants");
const unique_names_generator_1 = require("unique-names-generator");
function default_1({ count }) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(chalk_1.default.magentaBright(`Creating ${count} wallets...`));
        console.log(chalk_1.default.redBright('WARNING: Your private keys are stored in plain text. Only use this for testing purposes.'));
        console.log(chalk_1.default.redBright('To check your private keys, look at $HOME/.zksync/wallet.json'));
        const wallets = [];
        for (let i = 0; i < count; i++) {
            wallets.push(ethereumjs_wallet_1.default.generate());
        }
        const results = wallets.map((wallet, i) => {
            const address = wallet.getAddressString();
            const privateKey = wallet.getPrivateKeyString();
            const publicKey = wallet.getPublicKeyString();
            const nickname = (0, unique_names_generator_1.uniqueNamesGenerator)({ dictionaries: [unique_names_generator_1.colors, unique_names_generator_1.animals] });
            console.log(chalk_1.default.magentaBright(`Wallet ${i + 1}:`));
            console.log(chalk_1.default.green(`Address: ${address}`));
            console.log(chalk_1.default.green(`Private key: ${privateKey}`));
            console.log(chalk_1.default.green(`Public key: ${publicKey}`));
            console.log(chalk_1.default.green(`Nickname: ${nickname}`));
            console.log(chalk_1.default.magentaBright('---------------------'));
            return {
                address,
                privateKey,
                publicKey,
                nickname,
            };
        });
        const zkWalletFile = `${(0, utils_1.getZKSYNCDir)()}/${constants_1.WALLET_FILE}`;
        try {
            yield promises_1.default.access(zkWalletFile);
            // file exists
            const content = yield promises_1.default.readFile(zkWalletFile);
            const json = JSON.parse(content.toString());
            const newJson = [...json, ...results];
            yield promises_1.default.writeFile(zkWalletFile, JSON.stringify(newJson));
        }
        catch (e) {
            // file does not exist
            yield promises_1.default.writeFile(zkWalletFile, JSON.stringify(results));
        }
        return results;
    });
}
exports.default = default_1;

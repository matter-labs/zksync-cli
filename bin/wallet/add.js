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
const promises_1 = __importDefault(require("fs/promises"));
const utils_1 = require("../utils");
const chalk_1 = __importDefault(require("chalk"));
const constants_1 = require("../constants");
const ethereumjs_wallet_1 = __importDefault(require("ethereumjs-wallet"));
const unique_names_generator_1 = require("unique-names-generator");
function addWallet({ nickname, privateKey }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!privateKey) {
            console.log(chalk_1.default.redBright("Please provide a private Key to add a wallet."));
            return;
        }
        // trim 0x from private key
        if (privateKey.startsWith('0x')) {
            privateKey = privateKey.slice(2);
        }
        let wallet = ethereumjs_wallet_1.default.fromPrivateKey(Buffer.from(privateKey, 'hex'));
        if (!wallet) {
            console.log(chalk_1.default.redBright("Invalid public key or private key."));
            return;
        }
        console.log(chalk_1.default.magentaBright(`Adding wallet with ${wallet.getAddressString()}...`));
        nickname = nickname || (0, unique_names_generator_1.uniqueNamesGenerator)({ dictionaries: [unique_names_generator_1.colors, unique_names_generator_1.animals] });
        try {
            promises_1.default.access(`${(0, utils_1.getZKSYNCDir)()}/${constants_1.WALLET_FILE}`);
            // file exists
            const content = yield promises_1.default.readFile(`${(0, utils_1.getZKSYNCDir)()}/${constants_1.WALLET_FILE}`);
            const json = JSON.parse(content.toString());
            const duplicate = json.filter((temp) => {
                return (temp.publicKey === wallet.getPublicKeyString() && temp.address === wallet.getAddressString()) || temp.nickname === nickname;
            });
            if (duplicate.length > 0) {
                console.log(chalk_1.default.redBright("Wallet already exists."));
                return;
            }
            json.push({
                nickname,
                address: wallet.getAddressString(),
                publicKey: wallet.getPublicKeyString(),
                privateKey: wallet.getPrivateKeyString(),
            });
            yield promises_1.default.writeFile(`${(0, utils_1.getZKSYNCDir)()}/${constants_1.WALLET_FILE}`, JSON.stringify(json));
            console.log(chalk_1.default.greenBright("Wallet added successfully."));
        }
        catch (e) {
            console.log(e);
            // file does not exist
            const json = [{
                    nickname,
                    address: wallet.getAddressString(),
                    publicKey: wallet.getPublicKeyString(),
                    privateKey: wallet.getPrivateKeyString(),
                }];
            yield promises_1.default.writeFile(`${(0, utils_1.getZKSYNCDir)()}/${constants_1.WALLET_FILE}`, JSON.stringify(json));
        }
    });
}
exports.default = addWallet;

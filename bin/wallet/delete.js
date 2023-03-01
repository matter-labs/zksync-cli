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
function deleteWallet({ publicKey, address, nickname }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!publicKey && !address && !nickname) {
            console.log(chalk_1.default.redBright("Please provide a public key, address or nickname to delete a wallet."));
            return;
        }
        let crediential = publicKey || address || nickname;
        console.log(chalk_1.default.magentaBright(`Deleting wallet with ${crediential}...`));
        try {
            yield promises_1.default.access(`${(0, utils_1.getZKSYNCDir)()}/${constants_1.WALLET_FILE}`);
            // file exists
            const content = yield promises_1.default.readFile(`${(0, utils_1.getZKSYNCDir)()}/${constants_1.WALLET_FILE}`);
            const json = JSON.parse(content.toString());
            const newJson = json.filter((wallet) => {
                return wallet.publicKey !== crediential && wallet.address !== crediential && wallet.nickname !== crediential;
            });
            if (newJson.length === json.length) {
                console.log(chalk_1.default.redBright("No wallet found with the given crediential."));
                return;
            }
            yield promises_1.default.writeFile(`${(0, utils_1.getZKSYNCDir)()}/${constants_1.WALLET_FILE}`, JSON.stringify(newJson));
            console.log(chalk_1.default.greenBright("Wallet deleted successfully."));
        }
        catch (e) {
            // file does not exist
            console.log(chalk_1.default.red("No wallet file found. Please create a wallet first."));
        }
    });
}
exports.default = deleteWallet;

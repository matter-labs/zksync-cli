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
const promises_1 = __importDefault(require("fs/promises"));
const utils_1 = require("../utils");
const constants_1 = require("../constants");
function listWallets() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(chalk_1.default.magentaBright("Listing wallets..."));
        // access wallet file
        try {
            yield promises_1.default.access(`${(0, utils_1.getZKSYNCDir)()}/${constants_1.WALLET_FILE}`);
            // file exists
            const content = yield promises_1.default.readFile(`${(0, utils_1.getZKSYNCDir)()}/${constants_1.WALLET_FILE}`);
            const json = JSON.parse(content.toString()).map((wallet) => {
                return {
                    address: wallet.address,
                    nickname: wallet.nickname,
                };
            });
            console.table(json);
        }
        catch (e) {
            // file does not exist
            console.log(chalk_1.default.red("No wallet file found. Please create a wallet first."));
        }
    });
}
exports.default = listWallets;

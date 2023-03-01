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
function cleanWallets() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(chalk_1.default.magentaBright("Cleaning wallets..."));
        // access wallet file
        try {
            yield promises_1.default.access(`${(0, utils_1.getZKSYNCDir)()}/${constants_1.WALLET_FILE}`);
            // file exists
            yield promises_1.default.writeFile(`${(0, utils_1.getZKSYNCDir)()}/${constants_1.WALLET_FILE}`, JSON.stringify([]));
            console.log(chalk_1.default.greenBright("Wallets cleaned successfully."));
        }
        catch (e) {
            // file does not exist
            console.log(chalk_1.default.red("No wallet file found. Please create a wallet first."));
        }
    });
}
exports.default = cleanWallets;

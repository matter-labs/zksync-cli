"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const zksync_web3_1 = require("zksync-web3");
const ethers = __importStar(require("ethers"));
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
function default_1() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(chalk_1.default.magentaBright('Withdraw funds from zkSync to Goerli'));
        const questions = [
            {
                message: 'Address to withdraw funds to:',
                name: 'to',
                type: 'input',
            },
            {
                message: 'Amount in ETH:',
                name: 'amount',
                type: 'input',
            },
            {
                message: 'Private key of the sender:',
                name: 'key',
                type: 'password',
            },
        ];
        const results = yield inquirer_1.default.prompt(questions);
        console.log(chalk_1.default.magentaBright(`Withdrawing ${results.amount}ETH to ${results.to}`));
        // // Initialize the wallet.
        const L1Provider = ethers.getDefaultProvider('goerli');
        const zkSyncProvider = new zksync_web3_1.Provider('https://zksync2-testnet.zksync.dev');
        const wallet = new zksync_web3_1.Wallet(results.key, zkSyncProvider, L1Provider);
        // Withdraw funds to L1
        const withdrawHandle = yield wallet.withdraw({
            to: results.to,
            token: zksync_web3_1.utils.ETH_ADDRESS,
            amount: ethers.utils.parseEther(results.amount),
        });
        console.log(chalk_1.default.magentaBright(`Transaction submitted 💸💸💸`));
        console.log(chalk_1.default.magentaBright(`https://scan-v2.zksync.dev/tx/${withdrawHandle.hash}`));
        console.log(chalk_1.default.magentaBright(`Your funds will be available in L1 in a couple of minutes.`));
        console.log(chalk_1.default.magentaBright(`To check the latest transactions of this wallet on zkSync, visit: https://scan-v2.zksync.dev/address/${results.to}`));
        // ends
        process.exit(0);
    });
}
exports.default = default_1;

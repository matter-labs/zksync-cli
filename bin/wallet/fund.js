"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const constants_1 = require("../constants");
function fundWallet({ address }) {
    console.log(chalk_1.default.magentaBright(`Funding wallet with address ${address}...`));
    const newURL = constants_1.FUND_URL.replace('{ADDR}', address);
    console.log(chalk_1.default.greenBright(`Please visit \n ${newURL} \n to fund your wallet.`));
}
exports.default = fundWallet;

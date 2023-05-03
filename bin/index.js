#! /usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
// @ts-ignore
// const figlet = require('figlet');
const figlet_1 = __importDefault(require("figlet"));
// import method to create projects
const create_1 = __importDefault(require("./create"));
const deposit_1 = __importDefault(require("./deposit"));
const withdraw_1 = __importDefault(require("./withdraw"));
const localnet_1 = __importDefault(require("./localnet"));
const availableOptions = ['create', 'deposit', 'withdraw', 'localnet'];
// second argument should be the selected option
const option = process.argv[2];
if (!availableOptions.includes(option)) {
    console.log(`Invalid operation. Available operations are: ${availableOptions}`);
    process.exit(-1);
}
// Starts CLI
console.log(chalk_1.default.magentaBright(figlet_1.default.textSync(`zkSync ${option}`, { horizontalLayout: 'full' })));
switch (option) {
    case 'create':
        // arg 3 is the project name
        const projectName = process.argv[3] || '.';
        (0, create_1.default)(projectName);
        break;
    case 'deposit':
        (0, deposit_1.default)();
        break;
    case 'withdraw':
        (0, withdraw_1.default)();
        break;
    case 'localnet':
        const subcommandName = process.argv[3] || undefined;
        (0, localnet_1.default)(subcommandName);
        break;
}

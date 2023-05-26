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
const help_1 = __importDefault(require("./help"));
const availableOptions = ['create', 'deposit', 'withdraw', 'help'];
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
        if (process.argv[3] === '--help') {
            console.log(chalk_1.default.greenBright('Usage:'));
            console.log('  zksync-cli create <project_name>\n');
            console.log('Example:');
            console.log('  zksync-cli create my_project\n');
            process.exit(0);
        }
        // arg 3 is the project name
        const projectName = process.argv[3] || '.';
        (0, create_1.default)(projectName);
        break;
    case 'deposit':
        if (process.argv[3] === '--help') {
            console.log(chalk_1.default.greenBright('Usage:'));
            console.log('  zksync-cli deposit\n');
            process.exit(0);
        }
        (0, deposit_1.default)();
        break;
    case 'withdraw':
        if (process.argv[3] === '--help') {
            console.log(chalk_1.default.greenBright('Usage:'));
            console.log('  zksync-cli withdraw\n');
            process.exit(0);
        }
        (0, withdraw_1.default)();
        break;
    case 'help':
        (0, help_1.default)();
        break;
}

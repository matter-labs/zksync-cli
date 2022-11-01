#! /usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
// @ts-ignore
var figlet = require('figlet');
// import method to create projects
var create_1 = __importDefault(require("./create"));
var deposit_1 = __importDefault(require("./deposit"));
var withdraw_1 = __importDefault(require("./withdraw"));
var availableOptions = ['create', 'deposit', 'withdraw'];
// second argument should be the selected option
var option = process.argv[2];
if (!availableOptions.includes(option)) {
    console.log("Invalid operation. Available operations are: ".concat(availableOptions));
    process.exit(-1);
}
// Starts CLI
console.log(chalk_1.default.magentaBright(figlet.textSync("zkSync ".concat(option), { horizontalLayout: 'full' })));
switch (option) {
    case 'create':
        // arg 3 is the project name
        var projectName = process.argv[3] || '.';
        (0, create_1.default)(projectName);
        break;
    case 'deposit':
        (0, deposit_1.default)();
        break;
    case 'withdraw':
        (0, withdraw_1.default)();
        break;
}

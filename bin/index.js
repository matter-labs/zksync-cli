#! /usr/bin/env node
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
const chalk_1 = __importDefault(require("chalk"));
// @ts-ignore
// const figlet = require('figlet');
const figlet_1 = __importDefault(require("figlet"));
// import method to create projects
const create_1 = __importStar(require("./create"));
const deposit_1 = __importStar(require("./deposit"));
const withdraw_1 = __importStar(require("./withdraw"));
const confirm_withdrawal_1 = __importStar(require("./confirm-withdrawal"));
const zeek_1 = __importDefault(require("./zeek"));
const help_1 = __importDefault(require("./help"));
const availableOptions = [
    "create",
    "deposit",
    "withdraw",
    "confirm-withdrawal",
    "help",
];
// second argument should be the selected option
const option = process.argv[2];
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const helpFlag = Boolean(process.argv.filter((arg) => arg === "--help")[0]);
    if (!availableOptions.includes(option)) {
        console.log(`Invalid operation. Available operations are: ${availableOptions}`);
        process.exit(-1);
    }
    // Starts CLI
    console.log(chalk_1.default.magentaBright(figlet_1.default.textSync(`zkSync ${option}`, { horizontalLayout: "full" })));
    const zeekFlag = Boolean(process.argv.filter((arg) => arg === "--zeek")[0]);
    const l1RpcUrl = String(process.argv
        .filter((arg) => arg.startsWith("l1-rpc-url"))
        .map((arg) => arg.split("=")[1])[0]);
    const l2RpcUrl = String(process.argv
        .filter((arg) => arg.startsWith("l2-rpc-url"))
        .map((arg) => arg.split("=")[1])[0]);
    if (helpFlag) {
        switch (option) {
            case "create":
                (0, create_1.help)();
                break;
            case "deposit":
                (0, deposit_1.help)();
                break;
            case "withdraw":
                (0, withdraw_1.help)();
                break;
            case "confirm-withdrawal":
                (0, confirm_withdrawal_1.help)();
                break;
            default:
                (0, help_1.default)();
                break;
        }
    }
    else {
        switch (option) {
            case "create":
                // arg 3 is the project name
                const projectName = process.argv[3] || ".";
                yield (0, create_1.default)(projectName, zeekFlag);
                break;
            case "deposit":
                yield (0, deposit_1.default)(zeekFlag, l1RpcUrl, l2RpcUrl);
                break;
            case "withdraw":
                yield (0, withdraw_1.default)(zeekFlag, l1RpcUrl, l2RpcUrl);
                break;
            case "confirm-withdrawal":
                yield (0, confirm_withdrawal_1.default)(zeekFlag, l1RpcUrl, l2RpcUrl);
                break;
            case "help":
                (0, help_1.default)();
                break;
        }
    }
    if (zeekFlag) {
        yield (0, zeek_1.default)();
    }
    process.exit(0);
});
main();

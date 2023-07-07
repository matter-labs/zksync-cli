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
const pkg = __importStar(require("../package.json"));
function default_1() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(chalk_1.default.greenBright(`zksync-cli version ${pkg.version}`));
        console.log(chalk_1.default.bold("\nUsage:"));
        console.log("zksync-cli <command> [...args]\n");
        console.log(chalk_1.default.bold(`Commands:\n`));
        console.log(chalk_1.default.greenBright(`create <project_name>`));
        console.log(`Creates a new Hardhat project in the provided folder. If no folder is specified, it will create the project in the current folder, provided it's empty.\n`);
        console.log(chalk_1.default.greenBright(`deposit`));
        console.log(`Deposits funds from L1 to zkSync Era. It will prompt for the network (localnet, testnet, mainnet), recipient wallet, amount in ETH (e.g., 0.1), and the private key of the wallet sending funds.\n`);
        console.log(chalk_1.default.greenBright(`withdraw`));
        console.log(`Withdraws funds from zkSync Era to L1. It will prompt for the network (localnet, testnet, mainnet), recipient wallet, amount in ETH (e.g., 0.1), and the private key of the wallet sending funds.\n`);
        console.log(chalk_1.default.greenBright(`confirm-withdrawal`));
        console.log(`Confirms the withdrawal of funds from zkSync to Layer 1. It will prompt for the network (localnet, testnet, mainnet), the transaction address of the withdrawal, and the private key of the wallet initiating the confirmation.\n`);
        // Exit the process
        process.exit(0);
    });
}
exports.default = default_1;

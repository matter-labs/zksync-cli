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
function default_1() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(chalk_1.default.bold('\nUsage:'));
        console.log('  zksync-cli <command> [...args]\n');
        console.log(chalk_1.default.bold(`Commands:\n`));
        console.log(chalk_1.default.greenBright(`  create <project_name>`));
        console.log(`    Creates a new Hardhat project in the provided folder. If no folder is specified, it will create the project in the current folder, provided it's empty.\n`);
        console.log(chalk_1.default.greenBright(`  deposit`));
        console.log(`    Deposits funds from L1 (Goerli testnet) to zkSync 2.0 testnet. It will prompt for recipient wallet, amount in ETH (e.g., 0.1), and the private key of the wallet sending funds.\n`);
        console.log(chalk_1.default.greenBright(`  withdraw`));
        console.log(`    Withdraws funds from zkSync 2.0 to L1 (Goerli testnet). It will prompt for recipient wallet, amount in ETH (e.g., 0.1), and the private key of the wallet sending funds.\n`);
        console.log(chalk_1.default.bold(`For more specific help use:`));
        console.log('  zksync-cli <command> --help\n');
        // Exit the process
        process.exit(0);
    });
}
exports.default = default_1;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_util_1 = require("node:util");
const create_1 = __importDefault(require("./create"));
const delete_1 = __importDefault(require("./delete"));
const list_1 = __importDefault(require("./list"));
const clean_1 = __importDefault(require("./clean"));
const add_1 = __importDefault(require("./add"));
const fund_1 = __importDefault(require("./fund"));
var WalletCommands;
(function (WalletCommands) {
    // Create a new wallet
    WalletCommands["Create"] = "create";
    // List all wallets
    WalletCommands["List"] = "ls";
    // Delete a wallet
    WalletCommands["Delete"] = "delete";
    // Clean all wallets
    WalletCommands["Clean"] = "clean";
    // Add a new wallet
    WalletCommands["Add"] = "add";
    // Add funds to a wallet
    WalletCommands["Fund"] = "fund";
})(WalletCommands || (WalletCommands = {}));
function wallet({ option, args }) {
    switch (option) {
        case WalletCommands.Create:
            (0, create_1.default)({
                count: parseInt(args[0], 10),
            });
            break;
        case WalletCommands.List:
            (0, list_1.default)();
            break;
        case WalletCommands.Delete:
            const deleteArgs = (0, node_util_1.parseArgs)({
                args,
                options: {
                    publicKey: {
                        type: 'string',
                        short: 'p',
                    },
                    address: {
                        type: 'string',
                        short: 'a',
                    },
                    nickname: {
                        type: 'string',
                        short: 'n',
                    },
                }
            });
            (0, delete_1.default)(deleteArgs.values);
            break;
        case WalletCommands.Clean:
            (0, clean_1.default)();
            break;
        case WalletCommands.Add:
            const addArgs = (0, node_util_1.parseArgs)({
                args,
                options: {
                    privateKey: {
                        type: 'string',
                        short: 'p',
                    },
                    nickname: {
                        type: 'string',
                        short: 'n',
                    },
                }
            });
            (0, add_1.default)(addArgs.values);
            break;
        case WalletCommands.Fund:
            (0, fund_1.default)({
                address: args[0],
            });
            break;
    }
}
exports.default = wallet;

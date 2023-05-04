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
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
// ---------------------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------------------
function runCommand(command, options) {
    const defaultOptions = { cwd: repoDirectory(), encoding: 'utf-8' };
    const unifiedOptions = Object.assign(Object.assign({}, defaultOptions), options);
    return (0, child_process_1.execSync)(command, unifiedOptions).toString();
}
function repoDirectory() {
    const xdgStateHome = process.env.XDG_STATE_HOME || path.join(os.homedir(), ".local/state");
    return path.join(xdgStateHome, "zksync-cli/local-setup");
}
function isRepoCloned() {
    return fs.existsSync(repoDirectory());
}
function cloneRepo() {
    const parentDirectory = path.join(repoDirectory(), "..");
    runCommand(`mkdir -p "${parentDirectory}"`);
    const options = { cwd: parentDirectory };
    runCommand("git clone https://github.com/matter-labs/local-setup.git", options);
}
function createStartInBackgroundScript() {
    runCommand("sed 's/^docker-compose up$/docker-compose up --detach/' start.sh > start-background.sh");
    runCommand("chmod +x start-background.sh");
}
function setUp() {
    cloneRepo();
    createStartInBackgroundScript();
}
// ---------------------------------------------------------------------------------------
// Localnet operations
// ---------------------------------------------------------------------------------------
function logs() {
    const options = { stdio: 'inherit' };
    runCommand("docker-compose logs --follow", options);
    return 0;
}
function up() {
    if (!isRepoCloned()) {
        setUp();
    }
    runCommand("./start-background.sh");
    return 0;
}
function down() {
    runCommand("docker-compose down");
    return 0;
}
function clear() {
    runCommand("./clear.sh");
    return 0;
}
function wallets() {
    const rawJSON = fs.readFileSync(path.join(repoDirectory(), "rich-wallets.json")).toString();
    const wallets = JSON.parse(rawJSON);
    console.log(wallets);
    return 0;
}
// ---------------------------------------------------------------------------------------
// Command handling
// ---------------------------------------------------------------------------------------
function help() {
    console.log("USAGE: zksync-cli localnet <operation>");
    console.log("");
    console.log("Manage local L1 and L2 chains");
    console.log("");
    console.log("Available operations");
    console.log('  up      -- Start L1 and L2 localnets');
    console.log('  down    -- Stop L1 and L2 localnets');
    console.log('  clear   -- Reset the localnet state');
    console.log('  logs    -- Display logs');
    console.log('  help    -- Display this message and quit');
    console.log('  wallets -- Display seeded wallet keys');
    return 0;
}
function handleUndefinedOperation() {
    console.error("No operation provided");
    help();
    return 1;
}
function handleInvalidOperation(operationName) {
    const validOperationNames = Array.from(operationHandlers.keys());
    console.error('Invalid operation: ', operationName);
    help();
    return 1;
}
const operationHandlers = new Map([
    ['up', up],
    ['down', down],
    ['logs', logs],
    ['help', help],
    ['wallets', wallets],
    ['clear', clear],
    [undefined, handleUndefinedOperation],
]);
function default_1(operationName) {
    return __awaiter(this, void 0, void 0, function* () {
        const handler = operationHandlers.get(operationName) || (() => handleInvalidOperation(operationName));
        process.exit(handler());
    });
}
exports.default = default_1;

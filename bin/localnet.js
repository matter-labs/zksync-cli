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
Object.defineProperty(exports, "__esModule", { value: true });
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
/**
 * Runs CLI commands
 * @param {*} command String command to run
 */
const runCommand = (command) => {
    try {
        // runs given command and prints its output to console
        execSync(`${command}`, { stdio: 'inherit' });
    }
    catch (error) {
        console.error('Failed to run command: ', error);
        return false;
    }
    return true;
};
function localSetupRepoPath() {
    const defaultXDGStateHome = path.join(process.env.HOME, ".local", "state");
    const xdgStateHome = process.env["XDG_STATE_HOME"] || defaultXDGStateHome;
    return path.join(xdgStateHome, "zksync-cli", "local-setup");
}
function localSetupRepoExists() {
    return fs.existsSync(localSetupRepoPath());
}
function cloneLocalSetupRepo() {
    const repoParentDir = path.join(localSetupRepoPath(), "..");
    runCommand(`mkdir -p "${repoParentDir}"`);
    runCommand(`cd "${repoParentDir}" && git clone https://github.com/matter-labs/local-setup.git`);
}
function createLocalSetupStartInBackgroundScript() {
    runCommand(`cd "${localSetupRepoPath()}" && sed 's/^docker-compose up$/docker-compose up --detach/' start.sh > start-background.sh && chmod +x start-background.sh`);
}
function handleStartOperation() {
    const repoPath = localSetupRepoPath();
    if (!localSetupRepoExists()) {
        cloneLocalSetupRepo();
    }
    createLocalSetupStartInBackgroundScript();
    runCommand(`cd "${localSetupRepoPath()}" && ./start-background.sh`);
    return 0;
}
function handleDownOperation() {
    runCommand(`cd "${localSetupRepoPath()}" && docker-compose down`);
    return 0;
}
function handleLogsOperation() {
    runCommand(`cd "${localSetupRepoPath()}" && docker-compose logs --follow`);
    return 0;
}
function handleClearOperation() {
    runCommand(`cd "${localSetupRepoPath()}" && ./clear.sh`);
    return 0;
}
function handleHelpOperation() {
    console.log("USAGE: zksync-cli localnet <operation>");
    console.log("");
    console.log("Manage local L1 and L2 chains");
    console.log("");
    console.log("Available operations");
    console.log('  start   -- Start L1 and L2 localnets');
    console.log('  down    -- Stop L1 and L2 localnets');
    console.log('  clear   -- Reset the localnet state');
    console.log('  logs    -- Display logs');
    console.log('  help    -- Display this message and quit');
    console.log('  wallets -- Display seeded wallet keys');
    return 0;
}
function handleUndefinedOperation() {
    console.error("No operation provided");
    handleHelpOperation();
    return 1;
}
function handleWalletsOperation() {
    const rawJSON = fs.readFileSync(path.join(localSetupRepoPath(), "rich-wallets.json"));
    const wallets = JSON.parse(rawJSON);
    console.log(wallets);
    return 0;
}
function handleInvalidOperation(operationName) {
    const validOperationNames = Array.from(operationHandlers.keys());
    console.error('Invalid operation: ', operationName);
    handleHelpOperation();
    return 1;
}
const operationHandlers = new Map([
    ['start', handleStartOperation],
    ['down', handleDownOperation],
    ['logs', handleLogsOperation],
    ['help', handleHelpOperation],
    ['wallets', handleWalletsOperation],
    ['clear', handleClearOperation],
    [undefined, handleUndefinedOperation],
]);
function default_1(operationName) {
    return __awaiter(this, void 0, void 0, function* () {
        const handler = operationHandlers.get(operationName) || (() => handleInvalidOperation(operationName));
        process.exit(handler());
    });
}
exports.default = default_1;

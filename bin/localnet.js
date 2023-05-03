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
    runCommand(`cd "${localSetupRepoPath()}" && ./start-background.sh &`);
    // 3. cd into repo and run ./start.sh
    return 1;
}
function stop() {
    console.error("UNIMPLEMENTED: stop"); // FIXME
    return 1;
}
function logs() {
    console.error("UNIMPLEMENTED: logs"); // FIXME
    return 1;
}
function help() {
    console.error("UNIMPLEMENTED: help"); // FIXME
    return 1;
}
function handleUndefinedOperation() {
    console.error("No operation provided");
    console.error("USAGE: zksync-cli localnet <OPERATION>");
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
    ['start', handleStartOperation],
    ['stop', stop],
    ['logs', logs],
    ['help', help],
    [undefined, handleUndefinedOperation],
]);
function default_1(operationName) {
    return __awaiter(this, void 0, void 0, function* () {
        const handler = operationHandlers.get(operationName) || (() => handleInvalidOperation(operationName));
        process.exit(handler());
    });
}
exports.default = default_1;

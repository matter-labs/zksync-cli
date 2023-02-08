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
const { execSync } = require('child_process');
const chalk_1 = __importDefault(require("chalk"));
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
function default_1(projectName) {
    return __awaiter(this, void 0, void 0, function* () {
        // clones repo inside the given project name folder
        const cloneGitTemplate = `git clone https://github.com/matter-labs/zksync-hardhat-template ${projectName}`;
        // changes dir and installs deps with Yarn
        const installDeps = `cd ${projectName} && yarn`;
        const cleanup = `cd ${projectName} && rm -f -r .git`;
        console.log(chalk_1.default.magentaBright('Creating a zkSync - Hardhat project...'));
        console.log(chalk_1.default.magentaBright(`Initialising project with name ${projectName}`));
        const cloned = runCommand(cloneGitTemplate);
        if (!cloned)
            process.exit(-1);
        const cleaned = runCommand(cleanup);
        if (!cleaned)
            process.exit(-1);
        console.log(chalk_1.default.magentaBright('Installing dependencies with yarn...'));
        const depsInstalled = runCommand(installDeps);
        if (!depsInstalled)
            process.exit(-1);
        console.log(chalk_1.default.magentaBright('Dependencies installed'));
        console.log(`All ready! Run cd ${projectName} to enter your project folder.

Contracts are stored in the /contracts folder.
Deployment scripts go in the /deploy folder.

Run ${chalk_1.default.magentaBright('yarn hardhat compile')} to compile your contracts.
Run ${chalk_1.default.magentaBright('yarn hardhat deploy-zksync')} to deploy your contract (this command accepts a --script option).

Run ${chalk_1.default.magentaBright('git init')} to initialise a new repository.

Read the README file to learn more.

`);
    });
}
exports.default = default_1;

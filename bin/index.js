#! /usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
// @ts-ignore
var figlet = require('figlet');
var execSync = require('child_process').execSync;
/**
 * Runs CLI commands
 * @param {*} command String command to run
 */
var runCommand = function (command) {
    try {
        // runs given command and prints its output to console
        execSync("".concat(command), { stdio: 'inherit' });
    }
    catch (error) {
        console.error('Failed to run command: ', error);
        return false;
    }
    return true;
};
var availableOptions = ['create'];
// second argument should be "create" to create a new project. To be extended in the future
var option = process.argv[2];
if (!availableOptions.includes(option)) {
    console.log("Invalid operation. Available operations are: ".concat(availableOptions));
    process.exit(-1);
}
// arg 3 is the project name
var projectName = process.argv[3] || '.';
// clones repo inside the given project name folder
var cloneGitTemplate = "git clone --depth 1 https://github.com/matter-labs/zksync-hardhat-template ".concat(projectName);
// changes dir and installs deps with Yarn
var installDeps = "cd ".concat(projectName, " && yarn");
// Starts CLI
console.log(chalk_1.default.magentaBright(figlet.textSync("zkSync ".concat(option), { horizontalLayout: 'full' })));
console.log(chalk_1.default.magentaBright('Creating a zkSync - Hardhat project...'));
console.log(chalk_1.default.magentaBright("Initialising project with name ".concat(projectName)));
var cloned = runCommand(cloneGitTemplate);
if (!cloned)
    process.exit(-1);
console.log(chalk_1.default.magentaBright('Installing dependencies with yarn...'));
var depsInstalled = runCommand(installDeps);
if (!depsInstalled)
    process.exit(-1);
console.log(chalk_1.default.magentaBright('Dependencies installed'));
console.log("All ready! Run cd ".concat(projectName, " to enter your project folder.\n\nContracts are stored in the /contracts folder.\nDeployment scripts go in the /deploy folder.\n\nRun ").concat(chalk_1.default.magentaBright('yarn hardhat compile'), " to compile your contracts.\nRun ").concat(chalk_1.default.magentaBright('yarn hardhat deploy-zksync'), " to deploy your contract (this command accepts a --script option).\n\nRead the README file to learn more.\n\n"));

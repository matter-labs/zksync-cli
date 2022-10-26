#! /usr/bin/env node

import chalk from 'chalk';

// @ts-ignore
const figlet = require('figlet');

const { execSync } = require('child_process');

/**
 * Runs CLI commands
 * @param {*} command String command to run
 */
const runCommand = (command: string) => {
  try {
    // runs given command and prints its output to console
    execSync(`${command}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to run command: ', error);
    return false;
  }
  return true;
};

const availableOptions = ['create'];

// second argument should be "create" to create a new project. To be extended in the future
const option = process.argv[2];

if (!availableOptions.includes(option)) {
  console.log(
    `Invalid operation. Available operations are: ${availableOptions}`
  );
  process.exit(-1);
}

// arg 3 is the project name
const projectName = process.argv[3] || '.';

// clones repo inside the given project name folder
const cloneGitTemplate = `git clone --depth 1 https://github.com/matter-labs/zksync-hardhat-template ${projectName}`;

// changes dir and installs deps with Yarn
const installDeps = `cd ${projectName} && yarn`;

// Starts CLI

console.log(
  chalk.blueBright(figlet.textSync('zkSync', { horizontalLayout: 'full' }))
);

console.log(chalk.blueBright('Creating a zkSync - Hardhat project...'));

console.log(chalk.blueBright(`Initialising project with name ${projectName}`));

const cloned = runCommand(cloneGitTemplate);

if (!cloned) process.exit(-1);
console.log(chalk.blueBright('Installing dependencies with yarn...'));

const depsInstalled = runCommand(installDeps);
if (!depsInstalled) process.exit(-1);

console.log(chalk.blueBright('Dependencies installed'));

console.log(`All ready! Run cd ${projectName} to enter your project folder.

Contracts are stored in the /contracts folder.
Deployment scripts go in the /deploy folder.

Run ${chalk.blueBright('yarn hardhat compile')} to compile your contracts.
Run ${chalk.blueBright(
  'yarn hardhat deploy-zksync'
)} to deploy your contract (this command accepts a --script option).

Read the README file to learn more.

`);

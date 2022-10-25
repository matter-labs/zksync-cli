#! /usr/bin/env node
console.log('Creating a zkSync - Hardhat project...');

const { execSync } = require('child_process');

/**
 * Runs CLI commands
 * @param {*} command String command to run
 */
const runCommand = (command) => {
  try {
    // runs given command and prints its output to console
    execSync(`${command}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to run command: ', error);
    return false;
  }
  return true;
};

const projectName = process.argv[2];

// clones repo inside the given project name folder
const cloneGitTemplate = `git clone --depth 1 https://github.com/uF4No/zksync-hardhat-template.git ${projectName}`;

// changes dir and installs deps with Yarn
const installDeps = `cd ${projectName} && yarn`;

console.log(`Initialising project with name ${projectName}`);

console.log('Clonning from source repo...');
const cloned = runCommand(cloneGitTemplate);

if (!cloned) process.exit(-1);
console.log('Installing dependencies with yarn...');

const depsInstalled = runCommand(installDeps);
if (!depsInstalled) process.exit(-1);

console.log('Dependencies installed');

console.log(`All ready! Run cd ${projectName} to enter your project folder.

Contracts are stored in the /contracts folder.
Deployment scripts go in the /deploy folder.

Run yarn hardhat compile to compile your contracts.
Run yarn hardhat deploy-zksync to deploy your contract (this command accepts a --script option).

Read the README file to learn more.

`);

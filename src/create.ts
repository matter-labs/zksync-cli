const { execSync } = require('child_process');
import chalk from 'chalk';
import { track } from './analytics';

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

export default async function (projectName: string, zeek?: boolean) {

  track("create", {zeek, network: "goerli"})

  // clones repo inside the given project name folder
  const cloneGitTemplate = `git clone https://github.com/matter-labs/zksync-hardhat-template ${projectName}`;

  // changes dir and installs deps with Yarn
  const installDeps = `cd ${projectName} && yarn`;

  const cleanup = `cd ${projectName} && rm -f -r .git`;

  console.log(chalk.magentaBright('Creating a zkSync - Hardhat project...'));

  console.log(
    chalk.magentaBright(`Initialising project with name ${projectName}`)
  );

  const cloned = runCommand(cloneGitTemplate);

  if (!cloned) process.exit(-1);
  const cleaned = runCommand(cleanup);
  if (!cleaned) process.exit(-1);

  console.log(chalk.magentaBright('Installing dependencies with yarn...'));

  const depsInstalled = runCommand(installDeps);
  if (!depsInstalled) process.exit(-1);

  console.log(chalk.magentaBright('Dependencies installed'));

  console.log(`All ready! Run cd ${projectName} to enter your project folder.

Contracts are stored in the /contracts folder.
Deployment scripts go in the /deploy folder.

Run ${chalk.magentaBright('yarn hardhat compile')} to compile your contracts.
Run ${chalk.magentaBright(
    'yarn hardhat deploy-zksync'
  )} to deploy your contract (this command accepts a --script option).

Run ${chalk.magentaBright('git init')} to initialise a new repository.

Read the README file to learn more.

`);
}

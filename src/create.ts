const { execSync } = require("child_process");
import chalk from "chalk";
import { track } from "./analytics";

import inquirer, { Answers, QuestionCollection } from "inquirer";

/**
 * Runs CLI commands
 * @param {*} command String command to run
 */
const runCommand = (command: string) => {
  try {
    // runs given command and prints its output to console
    execSync(`${command}`, { stdio: "inherit" });
  } catch (error) {
    console.error("Failed to run command: ", error);
    return false;
  }
  return true;
};

export default async function (projectName: string, zeek?: boolean) {
  const questions: QuestionCollection = [
    {
      message: "Project template:",
      name: "template",
      type: "list",
      choices: ["Hardhat + Solidity", "Hardhat + Vyper"],
      default: "Hardhat + Solidity",
    },
  ];

  const answers: Answers = await inquirer.prompt(questions);

  let repoUrl;

  switch (answers.template) {
    case "Hardhat + Vyper":
      repoUrl = `https://github.com/matter-labs/zksync-hardhat-vyper-template`;
      break;
    default:
      repoUrl = `https://github.com/matter-labs/zksync-hardhat-template`;
      break;
  }

  track("create", { zeek, template: answers.template });

  // clones repo inside the given project name folder
  const cloneGitTemplate = `git clone ${repoUrl} ${projectName}`;

  // changes dir and installs deps with Yarn
  const installDeps = `cd ${projectName} && yarn`;

  // removes .git folder so new repo can be initialised
  const cleanup = `cd ${projectName} && rm -f -r .git`;

  console.log(
    chalk.magentaBright(`Creating a zkSync ${answers.template} project...`)
  );

  console.log(
    chalk.magentaBright(`Initialising project with name ${projectName}`)
  );

  const cloned = runCommand(cloneGitTemplate);

  if (!cloned) process.exit(-1);
  // runs cleanup
  const cleaned = runCommand(cleanup);
  if (!cleaned) process.exit(-1);

  console.log(chalk.magentaBright("Installing dependencies with yarn..."));

  const depsInstalled = runCommand(installDeps);
  if (!depsInstalled) process.exit(-1);

  console.log(chalk.magentaBright("Dependencies installed"));

  console.log(`All ready 🎉🎉 
  
  Run cd ${projectName} to enter your project folder.

  Contracts are stored in the /contracts folder.
  Deployment scripts go in the /deploy folder.

  Run ${chalk.magentaBright("yarn hardhat compile")} to compile your contracts.
  Run ${chalk.magentaBright(
    "yarn hardhat deploy-zksync"
  )} to deploy your contract (this command accepts a --script option).

  Run ${chalk.magentaBright("git init")} to initialise a new repository.

  Read the ${chalk.magentaBright("README")} file to learn more.

  `);
}

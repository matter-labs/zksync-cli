#! /usr/bin/env node

import chalk from 'chalk';

// @ts-ignore
// const figlet = require('figlet');
import figlet from 'figlet';

// import method to create projects
import create from './create';
import deposit from './deposit';
import withdraw from './withdraw';
import help from './help';

const availableOptions: string[] = ['create', 'deposit', 'withdraw', 'help'];

// second argument should be the selected option
const option: string = process.argv[2];

if (!availableOptions.includes(option)) {
  console.log(
    `Invalid operation. Available operations are: ${availableOptions}`
  );
  process.exit(-1);
}

// Starts CLI

console.log(
  chalk.magentaBright(
    figlet.textSync(`zkSync ${option}`, { horizontalLayout: 'full' })
  )
);

switch (option) {
  case "create":
    if (process.argv[3] === "--help") {
      console.log(chalk.greenBright("Usage:"));
      console.log("zksync-cli create <project_name>\n");
      console.log("Example:");
      console.log("  zksync-cli create my_project\n");
      process.exit(0);
    }
    // arg 3 is the project name
    const projectName = process.argv[3] || ".";
    create(projectName);
    break;
  case "deposit":
    if (process.argv[3] === "--help") {
      console.log(chalk.greenBright("Usage:"));
      console.log("zksync-cli deposit\n");
      process.exit(0);
    }
    deposit();
    break;
  case "withdraw":
    if (process.argv[3] === "--help") {
      console.log(chalk.greenBright("Usage:"));
      console.log("zksync-cli withdraw\n");
      process.exit(0);
    }
    withdraw();
    break;
  case "help":
    help();
    break;
}

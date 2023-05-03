#! /usr/bin/env node

import chalk from 'chalk';

// @ts-ignore
// const figlet = require('figlet');
import figlet from 'figlet';

// import method to create projects
import create from './create';
import deposit from './deposit';
import withdraw from './withdraw';
import localnet from './localnet';

const availableOptions: string[] = ['create', 'deposit', 'withdraw', 'localnet'];

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
  case 'create':
    // arg 3 is the project name
    const projectName = process.argv[3] || '.';
    create(projectName);
    break;
  case 'deposit':
    deposit();
    break;
  case 'withdraw':
    withdraw();
    break;
  case 'localnet':
    const subcommandName = process.argv[3] || undefined;
    localnet(subcommandName);
    break;
}

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
import zeek from './zeek';

const availableOptions: string[] = ['create', 'deposit', 'withdraw', 'help'];

// second argument should be the selected option
const option: string = process.argv[2];

const main = async() => {
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

  const zeekFlag = Boolean(process.argv.filter(arg => arg === "--zeek")[0]);

  switch (option) {
    case 'create':
      // arg 3 is the project name
      const projectName = process.argv[3] || '.';
      await create(projectName, zeekFlag);
      break;
    case 'deposit':
      await deposit(zeekFlag);
      break;
    case 'withdraw':
      await withdraw(zeekFlag);
      break;
    case "help":
     help();
    break;
  }

  if(zeekFlag) {
    await zeek();
  }

  process.exit(0);
}

main();

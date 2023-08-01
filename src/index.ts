#! /usr/bin/env node

import chalk from "chalk";

// @ts-ignore
// const figlet = require('figlet');
import figlet from "figlet";
import * as pkg from "../package.json";

// import method to create projects
import create, { help as createHelp } from "./create";
import deposit, { help as depositHelp } from "./deposit";
import withdraw, { help as withdrawHelp } from "./withdraw";
import confirmWithdraw, {
  help as confirmWithdrawalHelp,
} from "./confirm-withdraw";
import zeek from "./zeek";
import help from "./help";

const availableOptions: string[] = [
  "create",
  "deposit",
  "withdraw",
  "confirm-withdraw",
  "help",
];

// second argument should be the selected option
const option: string = process.argv[2];

const main = async () => {
  const helpFlag = Boolean(
    process.argv.filter((arg) => ["--help", "-h"].includes(arg))[0]
  );
  const versionFlag = Boolean(
    process.argv.filter((arg) => ["--version", "-v"].includes(arg))[0]
  );
  console.log("helpFlag :>> ", helpFlag);
  console.log("versionFlag :>> ", versionFlag);

  if (versionFlag) {
    console.log(chalk.magentaBright(`zksync-cli version ${pkg.version}`));
    process.exit(0);
  }

  if (!availableOptions.includes(option)) {
    console.log(
      `Invalid operation. Available operations are: ${availableOptions}`
    );
    process.exit(-1);
  }

  // Starts CLI

  console.log(
    chalk.magentaBright(
      figlet.textSync(`zkSync ${option}`, { horizontalLayout: "full" })
    )
  );

  const zeekFlag = Boolean(process.argv.filter((arg) => arg === "--zeek")[0]);
  const l1RpcUrl = String(
    process.argv
      .filter((arg) => arg.startsWith("--l1-rpc-url"))
      .map((arg) => arg.split("=")[1])[0]
  );
  const l2RpcUrl = String(
    process.argv
      .filter((arg) => arg.startsWith("--l2-rpc-url"))
      .map((arg) => arg.split("=")[1])[0]
  );

  if (helpFlag) {
    switch (option) {
      case "create":
        createHelp();
        break;
      case "deposit":
        depositHelp();
        break;
      case "withdraw":
        withdrawHelp();
        break;
      case "confirm-withdraw":
        confirmWithdrawalHelp();
        break;
      default:
        help();
        break;
    }
  } else {
    switch (option) {
      case "create":
        // arg 3 is the project name
        const projectName = process.argv[3] || ".";
        await create(projectName, zeekFlag);
        break;
      case "deposit":
        await deposit(zeekFlag, l1RpcUrl, l2RpcUrl);
        break;
      case "withdraw":
        await withdraw(zeekFlag, l1RpcUrl, l2RpcUrl);
        break;
      case "confirm-withdraw":
        await confirmWithdraw(zeekFlag, l1RpcUrl, l2RpcUrl);
        break;
      case "help":
        help();
        break;
    }
  }

  if (zeekFlag) {
    await zeek();
  }

  process.exit(0);
};

main();

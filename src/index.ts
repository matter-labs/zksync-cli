import chalk from "chalk";
import figlet from "figlet";

import confirmWithdraw, { help as confirmWithdrawalHelp } from "./confirm-withdraw";
import create, { help as createHelp } from "./create";
import deposit, { help as depositHelp } from "./deposit";
import help from "./help";
import withdraw, { help as withdrawHelp } from "./withdraw";
import zeek from "./zeek";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as pkg from "../package.json";

export const getPackageVersion = () => pkg.version;

const availableOptions: string[] = ["create", "deposit", "withdraw", "confirm-withdraw", "help"];

// second argument should be the selected option
const option: string = process.argv[2];

const main = async () => {
  const helpFlag = Boolean(process.argv.filter((arg) => ["--help", "-h"].includes(arg))[0]);
  const versionFlag = Boolean(process.argv.filter((arg) => ["--version", "-v"].includes(arg))[0]);

  if (versionFlag) {
    console.log(chalk.magentaBright(`zksync-cli version ${getPackageVersion()}`));
    process.exit(0);
  }

  if (!availableOptions.includes(option)) {
    console.log(`Invalid operation. Available operations are: ${availableOptions}`);
    process.exit(-1);
  }

  // Starts CLI

  console.log(chalk.magentaBright(figlet.textSync(`zkSync ${option}`, { horizontalLayout: "full" })));

  const zeekFlag = Boolean(process.argv.filter((arg) => arg === "--zeek")[0]);
  const l1RpcUrl = process.argv.filter((arg) => arg.startsWith("--l1-rpc-url")).map((arg) => arg.split("=")[1])[0];

  const l2RpcUrl = process.argv.filter((arg) => arg.startsWith("--l2-rpc-url")).map((arg) => arg.split("=")[1])[0];

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
    // arg 3 is the project name
    const projectName = process.argv[3] || ".";
    switch (option) {
      case "create":
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

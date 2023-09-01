import { Option } from "commander";
import { Wallet } from "ethers";

import { l1RpcUrlOption, l2RpcUrlOption, privateKeyOption, zeekOption } from "../common/options";
import { program } from "../setup";
import { fillMissingParams, optionNameToParam } from "../utils/helpers";
import Logger from "../utils/logger";
import { isDecimalAmount, isAddress, isPrivateKey } from "../utils/validators";

const amountOption = new Option("--amount <amount>", "Amount of ETH to deposit (eg. 0.1)");
const recipientOption = new Option("--recipient <address>", "Recipient address on L1 (0x address)");
program
  .command("deposit")
  .description("Deposit ETH from L1 to L2")
  .addOption(amountOption)
  .addOption(recipientOption)
  .addOption(l1RpcUrlOption)
  .addOption(l2RpcUrlOption)
  .addOption(privateKeyOption)
  .addOption(zeekOption)
  .action(async (options) => {
    Logger.debug(`Deposit options: ${JSON.stringify(options)}`);

    await fillMissingParams(options, [
      {
        message: amountOption.description,
        name: optionNameToParam(amountOption.long!),
        type: "input",
        required: true,
        validate: (input: string) => isDecimalAmount(input),
      },
      {
        message: privateKeyOption.description,
        name: optionNameToParam(privateKeyOption.long!),
        type: "password",
        required: true,
        validate: (input: string) => isPrivateKey(input),
      },
    ]);

    const senderWallet = new Wallet(options[optionNameToParam(privateKeyOption.long!)]);
    await fillMissingParams(options, [
      {
        message: recipientOption.description,
        name: optionNameToParam(recipientOption.long!),
        type: "input",
        default: senderWallet.address,
        required: true,
        validate: (input: string) => isAddress(input),
      },
    ]);

    Logger.info("\nDeposit:");
    Logger.info(` From: ${senderWallet.address}`);
    Logger.info(` To: ${options.recipient}`);
    Logger.info(` Amount: ${options.amount} ETH`);
  });

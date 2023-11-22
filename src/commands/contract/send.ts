import inquirer from "inquirer";

import Program from "./command.js";
import { DefaultOptions, accountOption, chainOption, privateKeyOption, zeekOption } from "../../common/options.js";
import { l2Chains } from "../../data/chains.js";
import { bigNumberToDecimal } from "../../utils/formatters.js";
import { getL2Wallet, getL2Provider, optionNameToParam } from "../../utils/helpers.js";
import Logger from "../../utils/logger.js";
import { isAddress, isPrivateKey } from "../../utils/validators.js";
import zeek from "../../utils/zeek.js";
import { keccak256 } from '@ethersproject/keccak256';

type BalanceOptions = DefaultOptions & {
  chain?: string;
  l1RpcUrl?: string;
  l2RpcUrl?: string;
  account?: string;
  privateKey?: string;
};

export const handler = async (options: BalanceOptions) => {
  try {
    const answers: BalanceOptions = await inquirer.prompt(
      [
        {
          message: chainOption.description,
          name: optionNameToParam(chainOption.long!),
          type: "list",
          choices: l2Chains.filter((e) => e.l1Chain).map((e) => ({ name: e.name, value: e.network })),
          required: true,
          when(answers: BalanceOptions) {
            if (answers.l1RpcUrl && answers.l2RpcUrl) {
              return false;
            }
            return true;
          },
        },
        {
          message: accountOption.description,
          name: optionNameToParam(accountOption.long!),
          type: "input",
          required: true,
          validate: (input: string) => isAddress(input),
        },
        {
          message: privateKeyOption.description,
          name: optionNameToParam(privateKeyOption.long!),
          type: "password",
          required: true,
          validate: (input: string) => isPrivateKey(input),
        },
      ],
      options
    );

    options = {
      ...options,
      ...answers,
    };

    const selectedChain = l2Chains.find((e) => e.network === options.chain);
    const provider = getL2Provider(options.l2RpcUrl ?? selectedChain!.rpcUrl);
    const senderWallet = getL2Wallet(options.privateKey ?? "Unknown private key", provider);

    const gasPrice = await senderWallet.provider.getGasPrice();
    //const gasLimit = await greeter.estimateGas.setGreeting(greeting);

    const contractAddress = "0xdaeb5e89b1ce24906368b2e5472868d3f64eeeb7";
    const functionName = "transfer(address, uint256)";
    const datatoSend = ["0xa61464658AfeAf65CccaaFD3a512b69A83B77618", 200]; //el address, la cant de plata
    const nonce = await senderWallet.getNonce();

    const encodedData = keccak256(Buffer.from("name()", "utf8")).slice(0,4);
    const transactionRequest = {
        to: contractAddress,
        data: encodedData,
        gasPrice: gasPrice,
        gasLimit: 21_000_000,
        nonce: nonce
    };

    const send = await provider.getBalance("0xE90E12261CCb0F3F7976Ae611A29e84a6A85f424" ?? "Unknown account");

    const tx = await senderWallet.sendTransaction(transactionRequest);
    Logger.info(`\nTransaction hash: ${tx.hash}`);

    if (options.zeek) {
      zeek();
    }
  } catch (error) {
    Logger.error("There was an error while fetching balance for the account:");
    Logger.error(error);
  }
};

Program.command("send")
  .description("Get balance of an L2 or L1 account")
  .addOption(chainOption)
  .addOption(accountOption)
  .addOption(privateKeyOption)
  .addOption(zeekOption)
  .action(handler);
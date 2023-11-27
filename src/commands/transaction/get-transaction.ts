import inquirer from "inquirer";

import Program from "./command.js";
import { chainOption } from "../../common/options.js";
import { l2Chains } from "../../data/chains.js";
import { optionNameToParam } from "../../utils/helpers.js";
import { Provider } from "zksync-web3";
import Logger from "../../utils/logger.js";
import { isTransactionHash } from "../../utils/validators.js";
import { Option } from "commander";

const transactionHashOption = new Option("--tx-hash, --transaction-hash <TX_HASH>", "get transaction by hash");

type GetTransactionOptions = {
  chain?: string;
  txHash?: string;
}

export const handler = async (options: GetTransactionOptions) => {
  try {
    const answers: GetTransactionOptions = await inquirer.prompt(
      [
        {
          message: chainOption.description,
          name: optionNameToParam(chainOption.long!),
          type: "list",
          choices: l2Chains.filter((e) => e.l1Chain).map((e) => ({ name: e.name, value: e.network })),
          required: true,
        },
        {
          message: transactionHashOption.description,
          name: "txHash",
          type: "input",
          required: true,
          validate: (input: string) => isTransactionHash(input),
        },
      ],
      options
    );

    options = {
      ...options,
      ...answers,
    };

    const chain = l2Chains.find((e) => e.network === options.chain);
    const l2Provider = new Provider(chain!.rpcUrl);

    console.log(await l2Provider.getTransactionDetails(String(options.txHash)));
  } catch (error) {
    Logger.error("There was an error while withdrawing funds:");
    Logger.error(error);
  }
};

Program.command("get-transaction")
  .description("Get transaction by hash")
  .addOption(chainOption)
  .addOption(transactionHashOption)
  .action(handler);

import inquirer from "inquirer";

import Program from "./command.js";
import { accountOption, chainOption, zeekOption } from "../../common/options.js";
import { l2Chains } from "../../data/chains.js";
import { bigNumberToDecimal } from "../../utils/formatters.js";
import { getL2Provider, optionNameToParam } from "../../utils/helpers.js";
import Logger from "../../utils/logger.js";
import { isAddress } from "../../utils/validators.js";
import zeek from "../../utils/zeek.js";

import type { DefaultOptions } from "../../common/options.js";

type BalanceOptions = DefaultOptions & {
  chain?: string;
  l2RpcUrl?: string;
  address?: string;
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
            if (answers.l2RpcUrl) {
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
      ],
      options
    );

    options = {
      ...options,
      ...answers,
    };

    const selectedChain = l2Chains.find((e) => e.network === options.chain);
    const l2Provider = getL2Provider(options.l2RpcUrl ?? selectedChain!.rpcUrl);
    const balance = await l2Provider.getBalance(options.address!);

    Logger.info(`\n${selectedChain?.name} Balance: ${bigNumberToDecimal(balance)} ETH`);

    if (options.zeek) {
      zeek();
    }
  } catch (error) {
    Logger.error("There was an error while fetching balance for the specified address:");
    Logger.error(error);
  }
};

Program.command("balance")
  .description("Get balance of an L2 account")
  .addOption(chainOption)
  .addOption(accountOption)
  .addOption(zeekOption)
  .action(handler);

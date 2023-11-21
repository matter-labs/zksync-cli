import inquirer from "inquirer";

import Program from "./command.js";
import { DefaultOptions, chainOption, zeekOption } from "../../common/options.js";
import { l2Chains } from "../../data/chains.js";
import { bigNumberToDecimal } from "../../utils/formatters.js";
import { getL2Provider, optionNameToParam } from "../../utils/helpers.js";
import Logger from "../../utils/logger.js";
import { isAddress } from "../../utils/validators.js";
import zeek from "../../utils/zeek.js";

type TransferOptions = DefaultOptions & {
  chain?: string;
  l1RpcUrl?: string;
  l2RpcUrl?: string;
  account?: string;
};

export const handler = async (options: TransferOptions) => {
  try {
    const answers: TransferOptions = await inquirer.prompt(
      [
        {
          message: chainOption.description,
          name: optionNameToParam(chainOption.long!),
          type: "list",
          choices: l2Chains.filter((e) => e.l1Chain).map((e) => ({ name: e.name, value: e.network })),
          required: true,
          when(answers: TransferOptions) { 
            if (answers.l1RpcUrl && answers.l2RpcUrl) {
              return false;
            }
            return true;
          },
        },
        {
          message: "accountOption.description",
          name: optionNameToParam("accountOption.long!"),
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
    const provider = getL2Provider(options.l2RpcUrl ?? selectedChain!.rpcUrl);
    const transfer = "await provider.getTransfer(options.account ?? Unknown account);"

    Logger.info(`\n${selectedChain?.name} transfer: ${bigNumberToDecimal(transfer)} ETH`);

    if (options.zeek) {
      zeek();
    }
  } catch (error) {
    Logger.error("There was an error while fetching transfer for the account:");
    Logger.error(error);
  }
};

Program.command("transfer")
  .description("Get transfer of an L2 or L1 account")
  .addOption(chainOption)
  .addOption(zeekOption)
  .action(handler);

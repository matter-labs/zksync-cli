import inquirer from "inquirer";

import Program from "./command.js";

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
      ],
      options
    );

    options = {
      ...options,
      ...answers,
    };

    const selectedChain = l2Chains.find((e) => e.network === options.chain);
    const provider = getL2Provider(options.l2RpcUrl ?? selectedChain!.rpcUrl);
    const balance = await provider.getBalance(options.account ?? "Unknown account");

    Logger.info(`\n${selectedChain?.name} Balance: ${bigNumberToDecimal(balance)} ETH`);

    if (options.zeek) {
      zeek();
    }
  } catch (error) {
    Logger.error("There was an error while fetching balance for the account:");
    Logger.error(error);
  }
};

Program.command("encode")
  .description("Get balance of an L2 or L1 account")
  .addOption(chainOption)
  .addOption(accountOption)
  .addOption(zeekOption)
  .action(handler);

import inquirer from "inquirer";

import Program from "./command.js";
import { accountOption, chainOption, l2RpcUrlOption, erc20AddressOption, zeekOption } from "../../common/options.js";
import { l2Chains } from "../../data/chains.js";
import { bigNumberToDecimal } from "../../utils/formatters.js";
import { getL2Provider, optionNameToParam } from "../../utils/helpers.js";
import Logger from "../../utils/logger.js";
import { isAddress } from "../../utils/validators.js";
import zeek from "../../utils/zeek.js";
import { utils } from 'zksync-web3';

import type { DefaultOptions } from "../../common/options.js";

type BalanceOptions = DefaultOptions & {
  chain?: string;
  l2RpcUrl?: string;
  address?: string;
  erc20Address?: string;
};

export const handler = async (options: BalanceOptions) => {
  try {
    const answers: BalanceOptions = await inquirer.prompt(
      [
        {
          message: chainOption.description,
          name: optionNameToParam(chainOption.long!),
          type: "list",
          choices: l2Chains.map((e) => ({ name: e.name, value: e.network })),
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
<<<<<<< HEAD
    const l2Provider = getL2Provider(options.l2RpcUrl ?? selectedChain!.rpcUrl);
    if (options.erc20Address) {
      const tokenName = "name";
      const balance = await l2Provider.getBalance(options.address!);
      Logger.info(`\n${selectedChain?.name} Balance: ${bigNumberToDecimal(balance)} ${tokenName}`);
=======
    const provider = getL2Provider(options.l2RpcUrl ?? selectedChain!.rpcUrl);

    if (options.erc20Address) {
>>>>>>> 5e68eea... Use IERC20 encodeFunctionData. Add call

      const tokenNameEncodedData = utils.IERC20.encodeFunctionData("name()");
      const balanceOfEncodedData = utils.IERC20.encodeFunctionData("balanceOf(address)", [options.account!]);

      const tokenNameTransactionReq = {
          to: options.erc20Address!,
          data: tokenNameEncodedData
      };

      const balanceOfTransactionReq = {
        to: options.erc20Address!,
        data: balanceOfEncodedData
    };
  
      const tokenName = await provider.call(tokenNameTransactionReq);
      const balance = await provider.call(balanceOfTransactionReq);
      Logger.info(`\n${selectedChain?.name} Balance: ${bigNumberToDecimal(balance)} ${tokenName}`);
    } else {
      const balance = await l2Provider.getBalance(options.address ?? "Unknown account");
      Logger.info(`\n${selectedChain?.name} Balance: ${bigNumberToDecimal(balance)} ETH`);
    }


    if (options.zeek) {
      zeek();
    }
  } catch (error) {
    Logger.error("There was an error while fetching balance for the specified address:");
    Logger.error(error);
  }
};

Program.command("balance")
  .description("Get ETH balance of an L2 account")
  .addOption(chainOption)
  .addOption(l2RpcUrlOption)
  .addOption(accountOption)
  .addOption(erc20AddressOption)
  .addOption(zeekOption)
  .action(handler);
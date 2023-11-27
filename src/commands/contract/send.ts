import inquirer from "inquirer";

import Program from "./command.js";
import { DefaultOptions, addressOption, chainOption, dataOption, functionOption, privateKeyOption, zeekOption } from "../../common/options.js";
import { l2Chains } from "../../data/chains.js";
import { getL2Wallet, getL2Provider, optionNameToParam } from "../../utils/helpers.js";
import Logger from "../../utils/logger.js";
import { isAddress, isPrivateKey } from "../../utils/validators.js";
import zeek from "../../utils/zeek.js";
import { keccak256 } from '@ethersproject/keccak256';
import { BigNumber } from "ethers";


type SendOptions = DefaultOptions & {
  chain?: string;
  l1RpcUrl?: string;
  l2RpcUrl?: string;
  address?: string;
  privateKey?: string;
  function?: string;
  data?: string;
};

export const handler = async (options: SendOptions) => {
  try {
    const answers: SendOptions = await inquirer.prompt(
      [
        {
          message: chainOption.description,
          name: optionNameToParam(chainOption.long!),
          type: "list",
          choices: l2Chains.filter((e) => e.l1Chain).map((e) => ({ name: e.name, value: e.network })),
          required: true,
          when(answers: SendOptions) {
            if (answers.l1RpcUrl && answers.l2RpcUrl) {
              return false;
            }
            return true;
          },
        },
        {
          message: addressOption.description,
          name: optionNameToParam(addressOption.long!),
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
        {
          message: functionOption.description,
          name: optionNameToParam(functionOption.long!),
          type: "input",
          required: true,
        },
        {
          message: dataOption.description,
          name: optionNameToParam(dataOption.long!),
          type: "input",
          required: false,
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

    const encodedData = getFunctionSelector(options.function!) + remove0x(options.data ?? "");
    
    const gasPrice = await senderWallet.provider.getGasPrice();
    const nonce = await senderWallet.getNonce();
    
    let transactionRequest = {
        to: options.address,
        data: encodedData,
        gasPrice: gasPrice,
        gasLimit: BigNumber.from(0),
        nonce: nonce
    };

    const estimatedGas = await senderWallet.estimateGas(transactionRequest);
    transactionRequest.gasLimit = estimatedGas;


    const tx = await senderWallet.sendTransaction(transactionRequest);
    Logger.info(`\nTransaction hash: ${tx.hash}`);

    if (options.zeek) {
      zeek();
    }
  } catch (error) {
    Logger.error("There was an error while sending the transaction:");
    Logger.error(error);
  }
};

Program.command("send")
  .description("Send a transaction to a contract.")
  .addOption(chainOption)
  .addOption(addressOption)
  .addOption(privateKeyOption)
  .addOption(functionOption)
  .addOption(dataOption)
  .addOption(zeekOption)
  .action(handler);


const getFunctionSelector = (functionSignature: string): string => {
  return keccak256(Buffer.from(functionSignature!, "utf8")).slice(0,10);
}

const remove0x = (data: string): string => {
  if (data.slice(0,2) === "0x"){
    return data.slice(2);
  }
  return data;
}
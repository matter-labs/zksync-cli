import inquirer from "inquirer";
import Program from "./command.js";
import {
    getL2Provider,
    optionNameToParam,
  } from "../../utils/helpers.js";
import { Option } from "commander";
import Logger from "../../utils/logger.js";
import { ethers } from "ethers";
import { l2Chains } from "../../data/chains.js";
import {
    TransactionRequest
} from "@ethersproject/abstract-provider";

const contractOption = new Option("--conctract, --contract <someContract(arguments)>", "contract to call");
const functionOption = new Option("--f, --function <someFunction(arguments)>", "function to call");
const argumentsOption = new Option("--args, --arguments <argument list>", "arguments to call");
const dataOption = new Option("--d, --data <someData(arguments)>", "data to call the functions");
const chainOption = new Option("--chain, --chain <someChain(arguments)>", "the chain id of the function");

type CallOptions = {
    contract?: string; 
    function?: string;
    args?: string;
    data?: string;
    chain_id?: string;
    l1RpcUrl?: string;
    l2RpcUrl?: string;
    chain?: string;
  };


function getInputValues(inputsString: string = ""): string[] {
    return inputsString
        .split(",")
        .filter(element => element !== '')
        .map(element => element.trim());
}
    
function getFunctionName(argumentsString: string = ""): string {
    return argumentsString.split(/[(]/)[0];
}

function encodeData(func: string = "", args: string = "") {
    let functionName = getFunctionName(func);
    let inputValues = getInputValues(args);

    let functionInterface = new ethers.utils.Interface(["function " + String(func)]);
    return functionInterface.encodeFunctionData(functionName, inputValues);
}

  export const handler = async (options: CallOptions) => {
    try {
        const answers = await inquirer.prompt(
            [    
                {
                    message: chainOption.description,
                    name: optionNameToParam(chainOption.long!),
                    type: "list",
                    choices: l2Chains.filter((e) => e.l1Chain).map((e) => ({ name: e.name, value: e.network })),
                    required: true,
                    when(answers: CallOptions) {
                      if (answers.l1RpcUrl && answers.l2RpcUrl) {
                        return false;
                      }
                      return true;
                    },
                  },
                {
                    message: contractOption.description,
                    name: optionNameToParam(contractOption.long!),
                    type: "input",
                    required: true,
                },
                {
                    message: functionOption.description,
                    name: optionNameToParam(functionOption.long!),
                    type: "input",
                    required: true,
                },
                {
                    message: argumentsOption.description,
                    name: optionNameToParam(argumentsOption.long!),
                    type: "input",
                    required: true,
                },
                {
                    message: dataOption.description,
                    name: optionNameToParam(dataOption.long!),
                    type: "input",
                    required: true,
                },
                {
                    message: chainOption.description,
                    name: optionNameToParam(chainOption.long!),
                    type: "input",
                    required: true,
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

            let data = encodeData(options.function, options.args);
            
            let tx: TransactionRequest = {
                to: options.contract,
                data: data,
                chainId: Number(options.chain_id)
            };

            console.log(await provider.call(tx));

    } catch(error) {
        Logger.error("There was an error while performing function call");
        Logger.error(error);
    }
  }

  Program.command("call")
    .addOption(contractOption)
    .description("Call a contract function")
    .action(handler);
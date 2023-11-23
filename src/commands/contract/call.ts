import inquirer from "inquirer";

import Program from "./command.js";
import { optionNameToParam } from "../../utils/helpers.js";
import { Option } from "commander";
import Logger from "../../utils/logger.js";


const contractOption = new Option("--conctract, --contract <someContract(arguments)>", "contract to call");
const functionOption = new Option("--f, --function <someFunction(arguments)>", "function to call");
const argumentsOption = new Option("--args, --arguments <argument list>", "arguments to call");
const dataOption = new Option("--d, --data <someData(arguments)>", "data to call the functions");


type CallOptions = {
    contract?: string; 
    function?: string;
    args?: string;
    data?: string;
    // chain_id?: string;
  };


  function convertAddress(address: string = '') {
        let prefix = address.slice(0,2);
        if (prefix === "0x") {
            let slice = address.slice(2);
            return Uint8Array.from(Buffer.from(slice, "hex"));    
        }
        return Uint8Array.from(Buffer.from(address, "hex"));
  }

  export const handler = async (options: CallOptions) => {
    try {
        const answers = await inquirer.prompt(
            [  
                {
                    message: contractOption.description,
                    name: optionNameToParam(contractOption.long!),
                    type: "input",
                    required: true,
                },
                // {
                //     message: functionOption.description,
                //     name: optionNameToParam(functionOption.long!),
                //     type: "input",
                //     required: true,
                // },
                // {
                //     message: argumentsOption.description,
                //     name: optionNameToParam(argumentsOption.long!),
                //     type: "input",
                //     required: true,
                // },
                // {
                //     message: dataOption.description,
                //     name: optionNameToParam(dataOption.long!),
                //     type: "input",
                //     required: true,
                // },
              ],
              options
            );

            options = {
                ...options,
                ...answers,
              };
          
            let contract = convertAddress(options.contract);
            console.log(contract);

    } catch(error) {
        Logger.error("There was an error while performing function call");
        Logger.error(error);
    }
  }

  Program.command("call")
    .addOption(contractOption)
    .description("Call a contract function")
    .action(handler);
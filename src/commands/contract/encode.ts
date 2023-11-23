import inquirer from "inquirer";
import { optionNameToParam } from "../../utils/helpers.js";
import { Option } from "commander";
import Program from "./command.js";
import Logger from "../../utils/logger.js";
import { ethers } from "ethers";

const functionOption = new Option("--f, --function <someFunction(arguments)>", "function to encode");
const argumentsOption = new Option("--arg, --arguments <argument list>", "arguments to encode");

type EncodeOptions = {
  function?: string;
  arguments?: string;
};

const ALLOWED_TYPES = [ "uint256", "sint256", "address", "bool", "bytes", "string" ];

const getArgumentTypes = (argumentsString: string = ""): string[] => {
    let commaSepArgumentTypes = argumentsString.split(/[(]|[)]/)[1];
    if ( commaSepArgumentTypes === "" ) {
        return [];
    }

    let argumentTypeList = commaSepArgumentTypes.split(",");

    if ( !argumentTypeList.every(item => { return ALLOWED_TYPES.includes(item) }) ) {
        throw new Error("Couldn't parse argument types");
    }

    return argumentTypeList;
}

const getInputValues = (inputsString: string = ""): string[] => {
    let inputList = inputsString.split(",");
    if ( inputList[0] === "" ) {
        return [];
    } else {
        return inputList;
    }
}

const getFunctionName = (argumentsString: string = ""): string => {
    return argumentsString.split(/[(]/)[0];
}

export const handler = async (options: EncodeOptions = {}) => {
  try {
      const answers: EncodeOptions = await inquirer.prompt(
          [
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
          ], 
          options
      );

      options = { ...options, ...answers};

      let functionName = getFunctionName(options.function);
      let argumentTypes = getArgumentTypes(options.function);
      let inputsObjects = new Array(argumentTypes.length);
      let inputValues = getInputValues(options.arguments);

      let functionInterface = new ethers.utils.Interface(["function " + String(options.function)]);
      console.log(functionInterface.encodeFunctionData(functionName, inputValues));

  } catch (error) {
    Logger.error("There was an error while encoding the function signature:");
    Logger.error(error);
  }
};

Program.command("encode")
  .description("Encode function's signature and arguments as hexstring")
  .addOption(functionOption)
  .action(handler);

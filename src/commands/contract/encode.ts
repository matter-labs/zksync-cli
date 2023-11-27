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

const getInputValues = (inputsString: string = ""): string[] => {
    return inputsString
        .split(",")
        .filter(element => element !== '')
        .map(element => element.trim());
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

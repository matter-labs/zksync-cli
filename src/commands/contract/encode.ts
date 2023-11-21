import inquirer from "inquirer";
import { optionNameToParam } from "../../utils/helpers.js";
import { Option } from "commander";
import Program from "./command.js";
import Logger from "../../utils/logger.js";

const functionOption = new Option("--f, --function <someFunction(arguments)>", "function to encode");
const argumentsOption = new Option("--arg, --arguments <argument list>", "arguments to encode");
const typesOption = new Option("--t, --types <types list>", "types to encode");

type EncodeOptions = {
  function?: string;
  arguments?: string;
  types?: string;
};

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
              {
                  message: typesOption.description,
                  name: optionNameToParam(typesOption.long!),
                  type: "input",
                  required: true,
              }
          ], 
          options
      );
      options = { ...options, ...answers}
      console.log(options);
  } catch (error) {
    Logger.error("There was an error while fetching balance for the account:");
    Logger.error(error);
  }
};

Program.command("encode")
  .description("Encode function's signature and arguments as hexstring")
  .addOption(functionOption)
  .action(handler);

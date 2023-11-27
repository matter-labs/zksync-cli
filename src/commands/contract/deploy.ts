import inquirer from "inquirer";
import Program from "./command.js";
import Logger from "../../utils/logger.js";
import { Provider, Wallet, ContractFactory } from "zksync-web3";
import { Option } from "commander";
import { optionNameToParam } from "../../utils/helpers.js";
import { isPrivateKey } from  "../../utils/validators.js";
import { 
    DefaultTransactionOptions,
    chainOption,
    privateKeyOption
} from "../../common/options.js";
import { l2Chains } from "../../data/chains.js";
import { readFileSync } from 'fs';
import { Contract } from "ethers";

const contractOption = new Option("--contract, --contract <artifact.json>", "Compiled contract name");
const createOption = new Option("--create, --create <bool>", "Use create");
const create2Option = new Option("--create2, --create2 <bool>", "Use create2");

type DeployOptions = DefaultTransactionOptions & {
  contract?: string;
  create?: boolean;
  create2?: boolean;
};

export const handler = async (options: DeployOptions) => {
  try {
    const answers: DeployOptions = await inquirer.prompt(
      [
        {
          message: chainOption.description,
          name: optionNameToParam(chainOption.long!),
          type: "list",
          choices: l2Chains.filter((e) => e.l1Chain).map((e) => ({ name: e.name, value: e.network })),
          required: true,
        },
        {
          message: "Private key of the contract deployer",
          name: optionNameToParam(privateKeyOption.long!),
          type: "password",
          required: true,
          validate: (input: string) => isPrivateKey(input),
        },
        {
          message: contractOption.description,
          name: optionNameToParam(contractOption.long!),
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

    const chain = l2Chains.find((e) => e.network === options.chain);
    const l2Provider = new Provider(chain!.rpcUrl);
    const wallet = new Wallet(options!.privateKey, l2Provider);

    const combinedContract = JSON.parse(readFileSync("build/combined.json", "utf-8"));

    var contractName = String(options.contract);
    if (contractName.includes(".sol")) {
        contractName = contractName.replace(".sol", "");
    }

    const abi = combinedContract.contracts[`${contractName}.sol:${contractName}`].abi;
    const bytecode: string = combinedContract.contracts[`${contractName}.sol:${contractName}`].bin;

    const factory = new ContractFactory(abi, bytecode, wallet);
    const contract = (await factory.deploy()) as Contract;

    Logger.info(`Contract address: ${contract.address}`);

  } catch (error) {
    Logger.error("There was an error while deploying the contract:");
    Logger.error(error);
  }
};

Program.command("deploy")
  .description("Deploy contract")
  .addOption(contractOption)
  .addOption(createOption)
  .addOption(create2Option)
  .action(handler);

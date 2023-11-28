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
import { Contract, utils } from "ethers";

const contractOption = new Option("--contract, --contract <artifact.json>", "Compiled contract name");
const create2Option = new Option("--create-type, --create-type <create | create2>", "Choose create function").choices(["create", "create2"]);
const constructorOption = new Option("--constructor-values, --constructor-values [values]", "Input values for the constructor");

type DeployOptions = DefaultTransactionOptions & {
  contract?: string;
  createType?: string;
  constructorValues?: string;
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
        {
          message: create2Option.description,
          name: "createType",
          type: "list",
          choices: ["create", "create2"],
          required: true,
        },
        {
          message: constructorOption.description,
          name: "constructorValues",
          type: "input",
          required: false,
        }
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

    var contractNameKey = String(options.contract);
    if (contractNameKey.includes(".sol")) {
        contractNameKey = contractNameKey.replace(".sol", "");
    }
    contractNameKey = `${contractNameKey}.sol:${contractNameKey}`;

    const abi = combinedContract.contracts[contractNameKey].abi;
    const bytecode: string = combinedContract.contracts[contractNameKey].bin;

    const factory = new ContractFactory(abi, bytecode, wallet);

    for (const [key, value] of Object.entries(combinedContract.contracts[contractNameKey]["factory-deps"])) {
        const depKey = String(String(value).split("/").pop());
        const abiDep = combinedContract.contracts[depKey].abi;
        const bytecodeDep: string = combinedContract.contracts[depKey].bin;
        const factoryDep = new ContractFactory(abiDep, bytecodeDep, wallet);
        await factoryDep.deploy();
    }

    const contractArgs = String(options.constructorValues)
        .split(",")
        .filter(arg => arg !== '')
        .map(arg => arg.trim());

    var contractData = {};
    if (options!.createType === "create2") {
        contractData = { customData: { salt: utils.hexlify(utils.randomBytes(32))}}
    }

    const contract = (await factory.deploy(...contractArgs, contractData)) as Contract;
    Logger.info(`Contract address: ${contract.address}`);
  } catch (error) {
    Logger.error("There was an error while deploying the contract:");
    Logger.error(error);
  }
};

Program.command("deploy")
  .description("Deploy contract")
  .addOption(contractOption)
  .addOption(create2Option)
  .action(handler);

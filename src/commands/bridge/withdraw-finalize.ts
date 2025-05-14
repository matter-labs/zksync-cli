import { Option } from "commander";
import inquirer from "inquirer";
//import { Interface, JsonRpcProvider } from "ethers";
// import type { JsonRpcProvider } from "ethers";
//import IL1SharedBridge from "zksync-ethers/abi/IL1SharedBridge.json" with { type: "json" };

import Program from "./command.js";
import {
  chainWithL1Option,
  l1RpcUrlOption,
  l2RpcUrlOption,
  privateKeyOption,
  zeekOption,
} from "../../common/options.js";
import { l2Chains } from "../../data/chains.js";
import { ETH_TOKEN } from "../../utils/constants.js";
import { useDecimals } from "../../utils/formatters.js";
import {
  getAddressFromPrivateKey,
  getL1Provider,
  getL2Provider,
  getL2Wallet,
  optionNameToParam,
} from "../../utils/helpers.js";
import Logger from "../../utils/logger.js";
import { getBalance } from "../../utils/token.js";
import { isPrivateKey, isTransactionHash } from "../../utils/validators.js";
import zeek from "../../utils/zeek.js";
import { getChains } from "../config/chains.js";

import type { DefaultTransactionOptions } from "../../common/options.js";

const transactionHashOption = new Option("--hash <transaction_hash>", "L2 withdrawal transaction hash to finalize");

type WithdrawFinalizeOptions = DefaultTransactionOptions & {
  hash: string;
};

export const handler = async (options: WithdrawFinalizeOptions) => {
  try {
    Logger.debug(
      `Initial withdraw-finalize options: ${JSON.stringify(
        { ...options, ...(options.privateKey ? { privateKey: "<hidden>" } : {}) },
        null,
        2
      )}`
    );

    const chains = [...l2Chains, ...getChains()];
    const answers: WithdrawFinalizeOptions = await inquirer.prompt(
      [
        {
          message: chainWithL1Option.description,
          name: optionNameToParam(chainWithL1Option.long!),
          type: "list",
          choices: chains.filter((e) => e.l1Chain).map((e) => ({ name: e.name, value: e.network })),
          required: true,
          when(answers: WithdrawFinalizeOptions) {
            return !(answers.l1Rpc && answers.rpc);
          },
        },
        {
          message: transactionHashOption.description,
          name: optionNameToParam(transactionHashOption.long!),
          type: "input",
          required: true,
          validate: (input: string) => isTransactionHash(input),
        },
        {
          message: privateKeyOption.description,
          name: optionNameToParam(privateKeyOption.long!),
          type: "password",
          required: true,
          validate: (input: string) => isPrivateKey(input),
        },
      ],
      options
    );

    options = {
      ...options,
      ...answers,
    };

    Logger.debug(`Final withdraw-finalize options: ${JSON.stringify({ ...options, privateKey: "<hidden>" }, null, 2)}`);

    const fromChain = chains.find((e) => e.network === options.chain);
    const fromChainLabel = fromChain && !options.rpc ? fromChain.name : (options.rpc ?? "Unknown chain");
    const toChain = chains.find((e) => e.network === options.chain)?.l1Chain;
    const toChainLabel = toChain && !options.l1Rpc ? toChain.name : (options.l1Rpc ?? "Unknown chain");

    Logger.info("\nWithdraw finalize:");
    Logger.info(` From chain: ${fromChainLabel}`);
    Logger.info(` To chain:   ${toChainLabel}`);
    Logger.info(` Withdrawal transaction (L2): ${options.hash}`);
    Logger.info(` Finalizer address (L1):       ${getAddressFromPrivateKey(options.privateKey)}`);

    const l1Provider = getL1Provider(options.l1Rpc ?? toChain!.rpcUrl);
    const l2Provider = getL2Provider(options.rpc ?? fromChain!.rpcUrl);
    const zkWallet = getL2Wallet(options.privateKey, l2Provider, l1Provider);

    Logger.info("\nChecking status of the transaction...");
    try {
      const alreadyFinalized = await zkWallet.isWithdrawalFinalized(options.hash);
      if (alreadyFinalized) {
        Logger.error(`\nWithdrawal with specified hash is already finalized on ${toChainLabel}`);
        return;
      }
    } catch (err) {
      Logger.error("isWithdrawalFinalized reverted:", err);
    }

    const l2Details = await l2Provider.getTransactionDetails(options.hash);
    if (!l2Details) {
      Logger.error("Transaction with specified hash wasn't found on L2");
      return;
    }
    if (!l2Details.ethExecuteTxHash) {
      Logger.error(`\nTransaction is still being processed on ${fromChainLabel}. Please try again later.`);
      Logger.info(`L2 Transaction Details: ${JSON.stringify(l2Details, null, 2)}`);
      return;
    }

    // const finalizeParams = await zkWallet.finalizeWithdrawalParams(options.hash);
    const finalizationHandle = await zkWallet.finalizeWithdrawal(options.hash);
    Logger.info("\nWithdrawal finalized:");
    Logger.info(` Finalization transaction hash: ${finalizationHandle.hash}`);
    // console.log("finalizeParams", finalizeParams);
    // const { sharedL1 }   = await l2Provider.getDefaultBridgeAddresses();
    // console.log("sharedL1", sharedL1);

    // const iface   = new Interface(IL1SharedBridge);
    // const calldata = iface.encodeFunctionData("finalizeWithdrawal", [
    //   finalizeParams.l1BatchNumber,
    //   finalizeParams.l2MessageIndex,
    //   finalizeParams.l2TxNumberInBlock,
    //   finalizeParams.sender,
    //   finalizeParams.message,
    //   finalizeParams.proof,
    // ]);

    // // 6️⃣  Gas estimation ---------------------------------------------------------
    // const gasLimit = await l2Provider.estimateGasL1({ to: sharedL1, from: zkWallet.address, data: calldata });
    // console.log("gasLimit", gasLimit);
    // // 7️⃣  Send transaction -------------------------------------------------------
    // Logger.info("\nSending finalization transaction...");

    // const txResponse = await zkWallet.sendTransaction({
    //   to: sharedL1,
    //   data: calldata,
    // });

    Logger.info("\nWithdrawal finalization tx sent:");
    Logger.info(` Finalization transaction hash: ${finalizationHandle.hash}`);
    if (toChain?.explorerUrl) {
      Logger.info(` Transaction link: ${toChain.explorerUrl}/tx/${finalizationHandle.hash}`);
    }

    Logger.info("\nWaiting for finalization transaction to be mined...");
    const receipt = await finalizationHandle.wait();
    if (!receipt) {
      Logger.error("Transaction was not mined - unknown error");
      return;
    }
    Logger.info(` Finalization transaction was mined in block ${receipt.blockNumber}`);

    const token = ETH_TOKEN;
    const { bigNumberToDecimal } = useDecimals(token.decimals);
    const senderBalance = await getBalance(token.l1Address, zkWallet.address, l1Provider);
    Logger.info(
      `\nSender L1 balance after transaction: ${bigNumberToDecimal(senderBalance)} ${token.symbol} ${
        token.name ? `(${token.name})` : ""
      }`
    );

    if (options.zeek) zeek();
  } catch (error) {
    Logger.error("There was an error while finalizing withdrawal:");
    Logger.error(error);
  }
};

Program.command("withdraw-finalize")
  .description("Finalize withdrawal of funds")
  .addOption(transactionHashOption)
  .addOption(chainWithL1Option)
  .addOption(l1RpcUrlOption)
  .addOption(l2RpcUrlOption)
  .addOption(privateKeyOption)
  .addOption(zeekOption)
  .action(handler);

import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";

import { handler as withdrawFinalize } from "./withdraw-finalize";
import { mockConsoleOutput } from "../test-utils/mockers";
import { mockL2Provider, mockL1Provider, mockL2Wallet } from "../test-utils/mocks";

describe("withdraw-finalize", () => {
  let stdOutMock: ReturnType<typeof mockConsoleOutput>;
  let l1ProviderMock: ReturnType<typeof mockL1Provider>;
  let l2ProviderMock: ReturnType<typeof mockL2Provider>;
  let l2WalletMock: ReturnType<typeof mockL2Wallet>;

  const chain = "era-testnet";
  const privateKey = "7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";
  const publicAddress = "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049";
  const senderFinalBalance = "0.5";
  const transactionHash = "0x5313817e1e3ba46e12aad81d481293069096ade97b577d175c34a18466f97e5a";
  const ethExecuteTxHash = "0xc219cb70d5458bb405a2e71d2b810148a302cb93b7b81b4d434d7d55eb82d120";

  beforeEach(() => {
    stdOutMock = mockConsoleOutput();
    l1ProviderMock = mockL1Provider({
      getBalance: jest.fn().mockResolvedValue(BigNumber.from(parseEther(senderFinalBalance))),
    });
    l2ProviderMock = mockL2Provider({
      getTransactionDetails: jest.fn().mockResolvedValue({ ethExecuteTxHash }),
    });
    l2WalletMock = mockL2Wallet({
      finalizeWithdrawal: () => Promise.resolve({ hash: transactionHash }),
    });
  });

  afterEach(() => {
    stdOutMock.mockRestore();
    l1ProviderMock.mockRestore();
    l2ProviderMock.mockRestore();
    l2WalletMock.mockRestore();
  });

  it("runs withdraw method with defined parameters", async () => {
    const finalizeWithdrawalMock = jest.fn().mockResolvedValue({
      hash: transactionHash,
    });
    l2WalletMock = mockL2Wallet({
      finalizeWithdrawal: finalizeWithdrawalMock,
    });

    await withdrawFinalize({
      hash: transactionHash,
      chain,
      privateKey,
    });

    expect(finalizeWithdrawalMock).toHaveBeenCalledWith(transactionHash);
  });

  it("outputs expected logs", async () => {
    await withdrawFinalize({
      hash: transactionHash,
      chain,
      privateKey,
    });

    expect(stdOutMock).not.hasConsoleErrors();

    expect(stdOutMock).toBeInConsole("Withdraw finalize:");
    expect(stdOutMock).toBeInConsole("From chain: zkSync Era Testnet");
    expect(stdOutMock).toBeInConsole("To chain: Ethereum Goerli");
    expect(stdOutMock).toBeInConsole(`Withdrawal transaction (L2): ${transactionHash}`);
    expect(stdOutMock).toBeInConsole(`Finalizer address (L1): ${publicAddress}`);

    expect(stdOutMock).toBeInConsole("Checking status of the transaction...");
    expect(stdOutMock).toBeInConsole("Transaction is ready to be finalized");

    expect(stdOutMock).toBeInConsole("Sending finalization transaction...");

    expect(stdOutMock).toBeInConsole("Withdrawal finalized:");
    expect(stdOutMock).toBeInConsole(`Finalization transaction hash: ${transactionHash}`);
    expect(stdOutMock).toBeInConsole(`Transaction link: https://goerli.etherscan.io/tx/${transactionHash}`);
    expect(stdOutMock).toBeInConsole(`Sender L1 balance after transaction: ${senderFinalBalance} ETH`);
  });

  it("uses private key and default rpc urls", async () => {
    await withdrawFinalize({
      hash: transactionHash,
      chain,
      privateKey,
    });

    expect(l2WalletMock).toHaveBeenCalledWith(privateKey, expect.anything(), expect.anything());

    expect(l2ProviderMock).toHaveBeenCalledTimes(1);
    expect(l2ProviderMock).toHaveBeenCalledWith("https://testnet.era.zksync.dev");
    expect(l1ProviderMock).toHaveBeenCalledTimes(1);
    expect(l1ProviderMock).toHaveBeenCalledWith("https://rpc.ankr.com/eth_goerli");
  });

  it("uses custom rpc url", async () => {
    const l1RpcUrl = "http://localhost:8545";
    const l2RpcUrl = "http://localhost:3050";

    await withdrawFinalize({
      hash: transactionHash,
      privateKey,
      l1RpcUrl,
      l2RpcUrl,
    });

    expect(stdOutMock).toBeInConsole(`From chain: ${l2RpcUrl}`);
    expect(stdOutMock).toBeInConsole(`To chain: ${l1RpcUrl}`);

    expect(l2ProviderMock).toHaveBeenCalledTimes(1);
    expect(l2ProviderMock).toHaveBeenCalledWith("http://localhost:3050");
    expect(l1ProviderMock).toHaveBeenCalledTimes(1);
    expect(l1ProviderMock).toHaveBeenCalledWith("http://localhost:8545");

    expect(stdOutMock).not.toBeInConsole("Transaction link:");
  });

  it("fails if transaction is still being processed", async () => {
    l2ProviderMock = mockL2Provider({
      getTransactionDetails: jest.fn().mockResolvedValue({ ethExecuteTxHash: undefined, otherInfo: "test" }),
    });

    await withdrawFinalize({
      hash: transactionHash,
      chain,
      privateKey,
    });

    expect(stdOutMock).hasConsoleErrors();

    expect(stdOutMock).toBeInConsole(
      "Transaction is still being processed on zkSync Era Testnet, please try again when the ethExecuteTxHash has been computed"
    );
    expect(stdOutMock).toBeInConsole("L2 Transaction Details:");
  });
});

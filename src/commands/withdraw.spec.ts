import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";

import { handler as withdraw } from "./withdraw";
import { mockConsoleOutput } from "../test-utils/mockers";
import { mockL2Provider, mockL1Provider, mockL2Wallet } from "../test-utils/mocks";

describe("withdraw", () => {
  let stdOutMock: ReturnType<typeof mockConsoleOutput>;
  let l1ProviderMock: ReturnType<typeof mockL1Provider>;
  let l2ProviderMock: ReturnType<typeof mockL2Provider>;
  let l2WalletMock: ReturnType<typeof mockL2Wallet>;

  const chain = "era-testnet";
  const amount = "0.1";
  const privateKey = "7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";
  const recipient = "0xa1cf087DB965Ab02Fb3CFaCe1f5c63935815f044";
  const senderFinalBalance = "0.5";
  const transactionHash = "0x5313817e1e3ba46e12aad81d481293069096ade97b577d175c34a18466f97e5a";

  beforeEach(() => {
    stdOutMock = mockConsoleOutput();
    l1ProviderMock = mockL1Provider();
    l2ProviderMock = mockL2Provider({
      getBalance: jest.fn().mockResolvedValue(BigNumber.from(parseEther(senderFinalBalance))),
    });
    l2WalletMock = mockL2Wallet({
      withdraw: () => Promise.resolve({ hash: transactionHash }),
    });
  });

  afterEach(() => {
    stdOutMock.mockRestore();
    l1ProviderMock.mockRestore();
    l2ProviderMock.mockRestore();
    l2WalletMock.mockRestore();
  });

  it("runs withdraw method with defined parameters", async () => {
    const withdrawMock = jest.fn().mockResolvedValue({
      hash: transactionHash,
    });
    l2WalletMock = mockL2Wallet({
      withdraw: withdrawMock,
    });

    await withdraw({
      amount: amount,
      chain,
      recipient,
      privateKey,
    });

    expect(withdrawMock).toHaveBeenCalledWith({
      amount: BigNumber.from(parseEther(amount)),
      to: recipient,
      token: "0x0000000000000000000000000000000000000000",
    });
  });

  it("outputs expected logs", async () => {
    await withdraw({
      amount: amount,
      chain,
      recipient,
      privateKey,
    });

    expect(stdOutMock).not.hasConsoleErrors();

    expect(stdOutMock).toBeInConsole("Withdraw:");
    expect(stdOutMock).toBeInConsole("From: 0x36615Cf349d7F6344891B1e7CA7C72883F5dc049 (zkSync Era Testnet)");
    expect(stdOutMock).toBeInConsole(`To: ${recipient} (Ethereum Goerli)`);
    expect(stdOutMock).toBeInConsole("Amount: 0.1 ETH");

    expect(stdOutMock).toBeInConsole("Sending withdraw transaction...");

    expect(stdOutMock).toBeInConsole("Withdraw sent:");
    expect(stdOutMock).toBeInConsole(`Transaction hash: ${transactionHash}`);
    expect(stdOutMock).toBeInConsole(`Transaction link: https://goerli.explorer.zksync.io/tx/${transactionHash}`);
    expect(stdOutMock).toBeInConsole(`Sender L2 balance after transaction: ${senderFinalBalance} ETH`);
  });

  it("uses private key and default rpc urls", async () => {
    await withdraw({
      amount: amount,
      chain,
      recipient,
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

    await withdraw({
      amount: amount,
      recipient,
      privateKey,
      l1RpcUrl,
      l2RpcUrl,
    });

    expect(stdOutMock).toBeInConsole(`From: 0x36615Cf349d7F6344891B1e7CA7C72883F5dc049 (${l2RpcUrl})`);
    expect(stdOutMock).toBeInConsole(`To: ${recipient} (${l1RpcUrl})`);

    expect(l2ProviderMock).toHaveBeenCalledTimes(1);
    expect(l2ProviderMock).toHaveBeenCalledWith("http://localhost:3050");
    expect(l1ProviderMock).toHaveBeenCalledTimes(1);
    expect(l1ProviderMock).toHaveBeenCalledWith("http://localhost:8545");

    expect(stdOutMock).not.toBeInConsole("Transaction link:");
  });
});

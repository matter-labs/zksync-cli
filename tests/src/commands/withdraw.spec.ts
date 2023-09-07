import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { mockProcessStdout } from "jest-mock-process";

import { handler as withdraw } from "../../../src/commands/withdraw";
import { mockL2Provider, mockL1Provider, mockL2Wallet } from "../../utils/mocks";

describe("Withdraw", () => {
  let stdOutMock: ReturnType<typeof mockProcessStdout>;
  let l1ProviderMock: ReturnType<typeof mockL1Provider>;
  let l2ProviderMock: ReturnType<typeof mockL2Provider>;
  let l2WalletMock: ReturnType<typeof mockL2Wallet>;

  beforeEach(() => {
    stdOutMock = mockProcessStdout();
    l1ProviderMock = mockL1Provider();
    l2ProviderMock = mockL2Provider();
    l2WalletMock = mockL2Wallet();
  });

  afterEach(() => {
    stdOutMock.mockRestore();
    l1ProviderMock.mockRestore();
    l2ProviderMock.mockRestore();
    l2WalletMock.mockRestore();
  });

  it("works with predefined parameters", async () => {
    const transactionHash = "0x5313817e1e3ba46e12aad81d481293069096ade97b577d175c34a18466f97e5a";
    const withdrawMock = jest.fn().mockResolvedValue({
      hash: transactionHash,
    });
    l2WalletMock = mockL2Wallet({
      withdraw: withdrawMock,
    });
    const senderFinalBalance = "0.5";
    l2ProviderMock = mockL2Provider({
      getBalance: jest.fn().mockResolvedValue(BigNumber.from(parseEther(senderFinalBalance))),
    });

    const amount = "0.1";
    const privateKey = "7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";
    const recipient = "0xa1cf087DB965Ab02Fb3CFaCe1f5c63935815f044";

    await withdraw({
      amount: amount,
      chain: "era-testnet",
      recipient,
      privateKey,
    });

    expect(stdOutMock).toBeInConsole("Withdraw:");
    expect(stdOutMock).toBeInConsole("From: 0x36615Cf349d7F6344891B1e7CA7C72883F5dc049 (zkSync Era Testnet)");
    expect(stdOutMock).toBeInConsole(`To: ${recipient} (Ethereum Goerli)`);
    expect(stdOutMock).toBeInConsole("Amount: 0.1 ETH");

    expect(stdOutMock).toBeInConsole("Sending withdraw transaction...");
    expect(l2ProviderMock).toHaveBeenCalledTimes(1);
    expect(l2ProviderMock).toHaveBeenCalledWith("https://testnet.era.zksync.dev");
    expect(l1ProviderMock).toHaveBeenCalledTimes(1);
    expect(l1ProviderMock).toHaveBeenCalledWith("https://rpc.ankr.com/eth_goerli");
    expect(l2WalletMock).toHaveBeenCalledWith(privateKey, expect.anything(), expect.anything());
    expect(withdrawMock).toHaveBeenCalledWith({
      amount: BigNumber.from(parseEther(amount)),
      to: recipient,
      token: "0x0000000000000000000000000000000000000000",
    });

    expect(stdOutMock).toBeInConsole("Withdraw sent:");
    expect(stdOutMock).toBeInConsole(`Transaction hash: ${transactionHash}`);
    expect(stdOutMock).toBeInConsole(`Transaction link: https://goerli.explorer.zksync.io/tx/${transactionHash}`);
    expect(stdOutMock).toBeInConsole(`Sender L2 balance after transaction: ${senderFinalBalance} ETH`);
  });
});

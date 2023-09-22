import child_process from "child_process";
import { ethers } from "ethers";
import * as zkSyncSDK from "zksync-web3";

import {
  optionNameToParam,
  getAddressFromPrivateKey,
  getL1Provider,
  getL2Provider,
  getL2Wallet,
  executeCommand,
} from "./helpers";

describe("helpers", () => {
  describe("optionNameToParam", () => {
    it("converts option name to param format", () => {
      expect(optionNameToParam("--l1-rpc-url")).toBe("l1RpcUrl");
    });
  });

  describe("getAddressFromPrivateKey", () => {
    it("computes the address from the private key", () => {
      const privateKey = "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";
      expect(getAddressFromPrivateKey(privateKey)).toBe("0x36615Cf349d7F6344891B1e7CA7C72883F5dc049");
    });
  });

  describe("getL1Provider", () => {
    it("initializes an L1 provider", () => {
      const spy = jest.spyOn(ethers.providers, "JsonRpcProvider").mockImplementation(jest.fn());
      getL1Provider("http://l1-url.com");
      expect(spy).toHaveBeenCalledWith("http://l1-url.com");
      spy.mockRestore();
    });
  });

  describe("getL2Provider", () => {
    it("initializes an L2 provider", () => {
      const spy = jest.spyOn(zkSyncSDK, "Provider").mockImplementation(jest.fn());
      getL2Provider("http://l2-url.com");
      expect(spy).toHaveBeenCalledWith("http://l2-url.com");
      spy.mockRestore();
    });
  });

  describe("getL2Wallet", () => {
    it("initializes an L2 wallet with L2 and L1 providers", () => {
      const spy = jest.spyOn(zkSyncSDK, "Wallet").mockImplementation(jest.fn());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const l2ProviderMock = { l2: true } as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const l1ProviderMock = { l1: true } as any;

      getL2Wallet("mockPrivateKey", l2ProviderMock, l1ProviderMock);
      expect(spy).toHaveBeenCalledWith("mockPrivateKey", l2ProviderMock, l1ProviderMock);
      spy.mockRestore();
    });
  });

  describe("executeCommand", () => {
    let mockProcessSpawn: jest.SpyInstance;

    beforeEach(() => {
      mockProcessSpawn = jest.spyOn(child_process, "spawn").mockImplementation(jest.fn());
    });

    afterEach(() => {
      mockProcessSpawn.mockRestore();
    });

    it("should execute the command and resolve with output", async () => {
      mockProcessSpawn.mockImplementation(() => ({
        stdout: {
          on: jest.fn().mockImplementation((_, cb) => cb("mockOutput")),
        },
        stderr: {
          on: jest.fn(),
        },
        on: jest.fn().mockImplementation((_, cb) => cb(0)),
      }));

      const output = await executeCommand("echo mockOutput", { silent: true });
      expect(output).toBe("mockOutput");
    });

    it("should reject with an error if the command exits with a non-zero code", async () => {
      mockProcessSpawn.mockImplementation(() => ({
        stdout: {
          on: jest.fn(),
        },
        stderr: {
          on: jest.fn().mockImplementation((_, cb) => cb("mockErrorOutput")),
        },
        on: jest.fn().mockImplementation((_, cb) => cb(1)),
      }));

      await expect(executeCommand("echo mockOutput", { silent: true })).rejects.toThrow(
        "Command exited with code 1: mockErrorOutput"
      );
    });

    it("should reject with an error if the child process emits an error", async () => {
      mockProcessSpawn.mockImplementation(() => ({
        stdout: {
          on: jest.fn(),
        },
        stderr: {
          on: jest.fn(),
        },
        on: jest.fn().mockImplementation((event, cb) => {
          if (event === "error") {
            setImmediate(() => cb(new Error("Mock spawn error")));
          }
        }),
      }));

      await expect(executeCommand("echo mockOutput", { silent: true })).rejects.toThrow("Mock spawn error");
    });
  });
});

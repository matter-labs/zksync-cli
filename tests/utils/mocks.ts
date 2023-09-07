/* eslint-disable @typescript-eslint/no-explicit-any */
import * as helpers from "../../src/utils/helpers";

export const mockL2Provider = (params: any = {}) => {
  return jest.spyOn(helpers, "getL2Provider").mockImplementation(() => ({
    getBalance: jest.fn(),
    ...params,
  }));
};

export const mockL1Provider = (params: any = {}) => {
  return jest.spyOn(helpers, "getL1Provider").mockImplementation(() => ({
    getBalance: jest.fn(),
    ...params,
  }));
};

export const mockL2Wallet = (params: any = {}) => {
  return jest.spyOn(helpers, "getL2Wallet").mockImplementation(() => ({
    address: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
    deposit: jest.fn(),
    withdraw: jest.fn(),
    finalizeWithdrawal: jest.fn(),
    ...params,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }));
};

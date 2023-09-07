/* eslint-disable @typescript-eslint/no-explicit-any */
import * as helpers from "../../src/utils/helpers";

export const mockExecute = () => {
  return jest.spyOn(helpers, "executeCommand").mockImplementation(() => {});
};

export const mockL2Provider = (params: any = {}) => {
  return jest.spyOn(helpers, "getL2Provider").mockImplementation(() => ({
    ...params,
  }));
};

export const mockL1Provider = (params: any = {}) => {
  return jest.spyOn(helpers, "getL1Provider").mockImplementation(() => ({
    ...params,
  }));
};

export const mockL2Wallet = (params: any = {}) => {
  return jest.spyOn(helpers, "getL2Wallet").mockImplementation(() => ({
    ...params,
  }));
};

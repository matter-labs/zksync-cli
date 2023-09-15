/* eslint-disable @typescript-eslint/no-explicit-any */
import * as helpers from "../utils/helpers";

export const mockExecute = (): any => {
  return jest.spyOn(helpers, "executeCommand").mockImplementation(async (): Promise<any> => {});
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

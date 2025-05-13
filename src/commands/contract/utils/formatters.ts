import { ethers, AbiCoder } from "ethers";

import type { ABI } from "./helpers.js";

export const getInterfaceFromSignature = (method: string) => {
  return new ethers.Interface(["function " + String(method)]);
};

export const getFragmentFromSignature = (method: string) => {
  const functionInterface = getInterfaceFromSignature(method);
  return functionInterface.fragments[0];
};

export const getInputsFromSignature = (method: string) => {
  return getFragmentFromSignature(method).inputs;
};

export const encodeData = (func: string, args: unknown[]): string => {
  const functionInterface = getInterfaceFromSignature(func);
  return functionInterface.encodeFunctionData(func, args);
};

export const encodeParam = (param: ethers.ParamType, arg: unknown) => {
  return AbiCoder.defaultAbiCoder().encode([param], [arg]);
};

export const decodeData = (types: string[], bytecode: string) => {
  return AbiCoder.defaultAbiCoder().decode(types, bytecode);
};

export const getInputValues = (inputsString: string): string[] => {
  return inputsString
    .split(",")
    .map((element) => element.trim())
    .filter((element) => !!element);
};

export const getMethodId = (method: string) => {
  const methodSignature = getFragmentFromSignature(method).format("sighash");
  return ethers.id(methodSignature).substring(2, 10); // remove 0x and take first 4 bytes
};

export const getMethodsFromAbi = (abi: ABI, type: "read" | "write"): ethers.FunctionFragment[] => {
  if (type === "read") {
    const readMethods = abi.filter(
      (fragment) =>
        fragment.type === "function" && (fragment.stateMutability === "view" || fragment.stateMutability === "pure")
    );
    const contractInterface = new ethers.Interface(readMethods);
    return contractInterface.fragments as ethers.FunctionFragment[];
  } else {
    const writeMethods = abi.filter(
      (fragment) =>
        fragment.type === "function" &&
        (fragment.stateMutability === "nonpayable" || fragment.stateMutability === "payable")
    );
    const contractInterface = new ethers.Interface(writeMethods);
    return contractInterface.fragments as ethers.FunctionFragment[];
  }
};

/**
 * Format method args based on the method signature into a valid
 * encodable format.
 *
 * @example "42,77" => [42,77]
 */
export const formatArgs = (method: string, args: Array<string[] | string>) => {
  const inputs = getInputsFromSignature(method);

  return args.map((arg, index) => {
    const input = inputs[index];
    if (input.baseType === "array") {
      return (arg as string)
        .replace(/\[|\]/g, "")
        .split(",")
        .map((element) => element.trim());
    }
    return arg;
  });
};

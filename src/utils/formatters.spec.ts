import { parseUnits } from "ethers/lib/utils";

import { decimalToBigNumber, bigNumberToDecimal } from "./formatters";
import { ETH_TOKEN } from "../utils/constants";

describe("Conversion utilities", () => {
  describe("decimalToBigNumber", () => {
    it("converts decimal string to BigNumber using default decimals", () => {
      const decimal = "1.5";
      const expectedBigNumber = parseUnits(decimal, ETH_TOKEN.decimals);
      const result = decimalToBigNumber(decimal);

      expect(result.toString()).toBe(expectedBigNumber.toString());
    });

    it("converts decimal string to BigNumber using custom decimals", () => {
      const decimal = "1.5";
      const decimals = 6;
      const expectedBigNumber = parseUnits(decimal, decimals);
      const result = decimalToBigNumber(decimal, decimals);

      expect(result.toString()).toBe(expectedBigNumber.toString());
    });
  });

  describe("bigNumberToDecimal", () => {
    it("converts BigNumber to decimal string using default decimals", () => {
      const bigNumberValue = parseUnits("1.5", ETH_TOKEN.decimals);
      const expectedResult = "1.5";
      const result = bigNumberToDecimal(bigNumberValue);

      expect(result).toBe(expectedResult);
    });

    it("converts BigNumber to decimal string using custom decimals", () => {
      const decimals = 6;
      const bigNumberValue = parseUnits("1.5", decimals);
      const expectedResult = "1.5";
      const result = bigNumberToDecimal(bigNumberValue, decimals);

      expect(result).toBe(expectedResult);
    });

    it("converts BigNumber to decimal string without trailing .0 using default decimals", () => {
      const bigNumberValue = parseUnits("2", ETH_TOKEN.decimals);
      const expectedResult = "2";
      const result = bigNumberToDecimal(bigNumberValue);

      expect(result).toBe(expectedResult);
    });
  });
});

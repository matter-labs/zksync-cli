import { isDecimalAmount, isAddress, isTransactionHash, isPrivateKey } from "./validators";

describe("formatters", () => {
  describe("isDecimalAmount", () => {
    it("returns true for a valid decimal", () => {
      const result = isDecimalAmount("1.2345");
      expect(result).toBe(true);
    });

    it("returns an error message for an invalid decimal", () => {
      const result = isDecimalAmount("abc");
      expect(result).toBe("Incorrect amount");
    });

    it("respects the provided decimals", () => {
      const result = isDecimalAmount("1.23456789", 9);
      expect(result).toBe(true);
    });
  });

  describe("isAddress", () => {
    it("returns true for a valid address", () => {
      const validAddress = "0xa1cf087DB965Ab02Fb3CFaCe1f5c63935815f044";
      expect(isAddress(validAddress)).toBe(true);
    });

    it("returns an error message for an invalid address", () => {
      const invalidAddress = "0x12345";
      expect(isAddress(invalidAddress)).toBe("Incorrect address");
    });
  });

  describe("isTransactionHash", () => {
    it("returns true for a valid transaction hash", () => {
      const validHash = "0x5313817e1e3ba46e12aad81d481293069096ade97b577d175c34a18466f97e5a";
      expect(isTransactionHash(validHash)).toBe(true);
    });

    it("returns an error message for an invalid transaction hash", () => {
      const invalidHash = "0x12345";
      expect(isTransactionHash(invalidHash)).toBe("Incorrect transaction hash");
    });
  });

  describe("isPrivateKey", () => {
    it("returns true for a valid private key", () => {
      const validPrivateKey = "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";
      expect(isPrivateKey(validPrivateKey)).toBe(true);
    });

    it("returns an error message for an invalid private key", () => {
      const invalidPrivateKey = "0x12345";
      expect(isPrivateKey(invalidPrivateKey)).toBe("Incorrect private key");
    });
  });
});

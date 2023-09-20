import fs from "fs";
import { homedir } from "os";
import path from "path";

import { getLocalPath, fileOrDirExists, writeFile } from "./files";

jest.mock("fs");

describe("files", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("getLocalPath", () => {
    it("returns the correct path based on the user directory", () => {
      const expectedDirectory = path.join(
        process.env.XDG_STATE_HOME || path.join(homedir(), ".local/state/"),
        "zksync-cli/"
      );
      const result = getLocalPath("test.txt");

      expect(result).toBe(path.join(expectedDirectory, "test.txt"));
    });
  });

  describe("fileOrDirExists", () => {
    it("returns true if file/directory exists", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const result = fileOrDirExists("/path/to/file");

      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith("/path/to/file");
    });

    it("returns false if file/directory does not exist", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const result = fileOrDirExists("/path/to/nonexistent");

      expect(result).toBe(false);
      expect(fs.existsSync).toHaveBeenCalledWith("/path/to/nonexistent");
    });
  });

  describe("writeFile", () => {
    it("creates directory if it doesn't exist and writes the file", () => {
      const filePath = "/path/to/file/test.txt";
      const data = "Test data";

      (fs.existsSync as jest.Mock).mockReturnValue(false);

      writeFile(filePath, data);

      expect(fs.existsSync).toHaveBeenCalledWith(path.dirname(filePath));
      expect(fs.mkdirSync).toHaveBeenCalledWith(path.dirname(filePath), { recursive: true });
      expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, data);
    });

    it("writes the file if directory exists", () => {
      const filePath = "/path/to/existing-dir/test.txt";
      const data = "Test data in existing dir";

      (fs.existsSync as jest.Mock).mockReturnValue(true);

      writeFile(filePath, data);

      expect(fs.existsSync).toHaveBeenCalledWith(path.dirname(filePath));
      expect(fs.mkdirSync).not.toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, data);
    });
  });
});

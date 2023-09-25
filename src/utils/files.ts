import fs from "fs";
import { homedir } from "os";
import path from "path";
import { fileURLToPath } from "url";

const getUserDirectory = () => {
  // From the XDG Base Directory Specification:
  // `$XDG_STATE_HOME` defines the base directory relative to which user-specific state files should be stored.
  // If `$XDG_STATE_HOME` is either not set or empty, a default equal to `$HOME/.local/state/` should be used.
  const xdgStateHome = process.env.XDG_STATE_HOME || path.join(homedir(), ".local/state/");
  return path.join(xdgStateHome, "zksync-cli/");
};

export const getLocalPath = (...filePath: string[]) => {
  return path.join(getUserDirectory(), ...filePath);
};

export const fileOrDirExists = (destination: string) => {
  return fs.existsSync(destination);
};

export const getDirPath = (filePath: string) => {
  const filename = fileURLToPath(filePath);
  return path.dirname(filename);
};

export const writeFile = (filePath: string, data: string | NodeJS.ArrayBufferView) => {
  // Create directory if it doesn't exist
  const directory = path.dirname(filePath);
  if (!fileOrDirExists(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  // Then write file
  fs.writeFileSync(filePath, data);
};

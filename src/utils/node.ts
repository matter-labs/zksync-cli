import { executeCommand } from "./helpers.js";

let nodeVersion: string | undefined;

export const getNodeVersion = async () => {
  if (nodeVersion) return nodeVersion;
  try {
    const version = await executeCommand("node --version", { silent: true });
    nodeVersion = version.trim().slice(1);
    return nodeVersion;
  } catch {
    throw new Error("Node.js is not installed. Download: http://nodejs.org");
  }
};

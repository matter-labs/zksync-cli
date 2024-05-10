import { executeCommand } from "./helpers.js";

// Define the type for package managers
export type PackageManagerType = "npm" | "yarn" | "pnpm" | "bun" | "forge";

// Define the structure of the package manager methods
interface PackageManagerMethods {
  install(packages?: string): string;
  run(script: string): string;
  uninstall(packages?: string): string;
  isInstalled(): Promise<boolean>;
  init?(gitUrl: string, folderLocation: string): Promise<boolean>;
}

// The package manager implementations
export const packageManagers: Record<PackageManagerType, PackageManagerMethods> = {
  npm: {
    install(packages?: string): string {
      return `npm install${packages ? ` ${packages}` : ""}`;
    },
    run(script: string): string {
      return `npm run ${script}`;
    },
    uninstall(packages: string): string {
      return `npm uninstall ${packages}`;
    },
    isInstalled(): Promise<boolean> {
      return executeCommand("npm --version", { silent: true })
        .then(() => true)
        .catch(() => false);
    },
  },
  yarn: {
    install(packages?: string): string {
      return `yarn${packages ? ` add ${packages}` : ""}`;
    },
    run(script: string): string {
      return `yarn ${script}`;
    },
    uninstall(packages: string): string {
      return `yarn remove ${packages}`;
    },
    isInstalled(): Promise<boolean> {
      return executeCommand("yarn --version", { silent: true })
        .then(() => true)
        .catch(() => false);
    },
  },
  pnpm: {
    install(packages?: string): string {
      return packages ? `pnpm add ${packages}` : "pnpm install";
    },
    run(script: string): string {
      return `pnpm ${script}`;
    },
    uninstall(packages: string): string {
      return `pnpm uninstall ${packages}`;
    },
    isInstalled(): Promise<boolean> {
      return executeCommand("pnpm --version", { silent: true })
        .then(() => true)
        .catch(() => false);
    },
  },
  bun: {
    install(packages?: string): string {
      return packages ? `bun add ${packages}` : "bun install";
    },
    run(script: string): string {
      return `bun run ${script}`;
    },
    uninstall(packages: string): string {
      return `bun remove ${packages}`;
    },
    isInstalled(): Promise<boolean> {
      return executeCommand("bun --version", { silent: true })
        .then(() => true)
        .catch(() => false);
    },
  },
  forge: {
    install(packages: string): string {
      return `forge install ${packages}`;
    },
    run(): string {
      return "forge build --zksync —-use=0.8.24";
    },
    uninstall(packages: string): string {
      return `forge remove ${packages}`;
    },
    isInstalled(): Promise<boolean> {
      // TODO: Implement validation check for foundry-zksync forge
      return executeCommand("forge --version", { silent: true })
        .then(() => true)
        .catch(() => false);
    },
    init(gitUrl: string, folderLocation: string): Promise<boolean> {
      return executeCommand(`forge init --template ${gitUrl} ${folderLocation}`, { silent: true })
        .then(() => true)
        .catch(() => false);
    },
  },
};

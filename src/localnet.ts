const { execSync } = require('child_process');
const path = require('path'); 
const fs = require('fs');

/**
 * Runs CLI commands
 * @param {*} command String command to run
 */
const runCommand = (command: string) => {
  try {
    // runs given command and prints its output to console
    execSync(`${command}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to run command: ', error);
    return false;
  }
  return true;
};

function localSetupRepoPath(): string {
    const defaultXDGStateHome = path.join(process.env.HOME!, ".local", "state");
    const xdgStateHome = process.env["XDG_STATE_HOME"] || defaultXDGStateHome;
    return path.join(xdgStateHome, "zksync-cli", "local-setup");
}

function localSetupRepoExists(): boolean {
    return fs.existsSync(localSetupRepoPath());
}

function cloneLocalSetupRepo() {
    const repoParentDir = path.join(localSetupRepoPath(), "..");
    runCommand(`mkdir -p "${repoParentDir}"`);
    runCommand(`cd "${repoParentDir}" && git clone https://github.com/matter-labs/local-setup.git`);
}

function createLocalSetupStartInBackgroundScript() {
    runCommand(`cd "${localSetupRepoPath()}" && sed 's/^docker-compose up$/docker-compose up --detach/' start.sh > start-background.sh && chmod +x start-background.sh`);
}

function handleStartOperation(): number {
    const repoPath = localSetupRepoPath();
    
    if (!localSetupRepoExists()) {
        cloneLocalSetupRepo();
    }

    createLocalSetupStartInBackgroundScript();

    runCommand(`cd "${localSetupRepoPath()}" && ./start-background.sh`);

    return 0;
}

function handleDownOperation(): number {
    runCommand(`cd "${localSetupRepoPath()}" && docker-compose down`);
    return 0;
}

function handleLogsOperation(): number {
    runCommand(`cd "${localSetupRepoPath()}" && docker-compose logs --follow`);
    return 0;
}

function handleClearOperation(): number {
    runCommand(`cd "${localSetupRepoPath()}" && ./clear.sh`);
    return 0;
}

function handleHelpOperation(): number {
    console.log("USAGE: zksync-cli localnet <operation>");
    console.log("");
    console.log("Manage local L1 and L2 chains");
    console.log("");
    console.log("Available operations");
    console.log('  start   -- Start L1 and L2 localnets');
    console.log('  down    -- Stop L1 and L2 localnets');
    console.log('  clear   -- Reset the localnet state');
    console.log('  logs    -- Display logs');
    console.log('  help    -- Display this message and quit');
    console.log('  wallets -- Display seeded wallet keys');
    return 0;
}

function handleUndefinedOperation(): number {
    console.error("No operation provided");
    handleHelpOperation();
    return 1;
}

function handleWalletsOperation(): number {
    const rawJSON = fs.readFileSync(path.join(localSetupRepoPath(), "rich-wallets.json"));
    const wallets = JSON.parse(rawJSON);
    console.log(wallets);
    return 0;
}

function handleInvalidOperation(operationName: string): number {
    const validOperationNames = Array.from(operationHandlers.keys());
    console.error('Invalid operation: ', operationName);
    handleHelpOperation();
    return 1;
}

const operationHandlers = new Map<string | undefined, () => number>([
    ['start', handleStartOperation],
    ['down', handleDownOperation],
    ['logs', handleLogsOperation],
    ['help', handleHelpOperation],
    ['wallets', handleWalletsOperation],
    ['clear', handleClearOperation],
    [undefined, handleUndefinedOperation],
]);

export default async function (operationName: string | undefined) {
    const handler = operationHandlers.get(operationName) || (() => handleInvalidOperation(operationName!));
    process.exit(handler());
}

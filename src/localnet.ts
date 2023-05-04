import { execSync, ExecSyncOptions } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// ---------------------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------------------

function runCommand(command: string, options?: ExecSyncOptions): string {
    const defaultOptions: ExecSyncOptions = { cwd: repoDirectory(), encoding: 'utf-8' };
    const unifiedOptions: ExecSyncOptions = {...defaultOptions, ...options};
    return execSync(command, unifiedOptions).toString();
}

function repoDirectory(): string {
    const xdgStateHome = process.env.XDG_STATE_HOME || path.join(os.homedir(), ".local/state");
    return path.join(xdgStateHome, "zksync-cli/local-setup");
}

function isRepoCloned(): boolean {
    return fs.existsSync(repoDirectory());
}

function cloneRepo() {
    const parentDirectory = path.join(repoDirectory(), "..");
    runCommand(`mkdir -p "${parentDirectory}"`);
    const options: ExecSyncOptions = { cwd: parentDirectory };
    runCommand("git clone https://github.com/matter-labs/local-setup.git", options);
}
    
function createStartInBackgroundScript() {
    runCommand("sed 's/^docker-compose up$/docker-compose up --detach/' start.sh > start-background.sh");
    runCommand("chmod +x start-background.sh");
}

function setUp() {
    cloneRepo();
    createStartInBackgroundScript();
}

// ---------------------------------------------------------------------------------------
// Localnet operations
// ---------------------------------------------------------------------------------------

function logs(): number {
    const options: ExecSyncOptions = { stdio: 'inherit' };
    runCommand("docker-compose logs --follow", options);
    return 0;
}

function up(): number {
    if (! isRepoCloned()) {
        setUp();
    }
    runCommand("./start-background.sh")
    return 0;
}

function down(): number {
    runCommand("docker-compose down");
    return 0;
}

function clear(): number {
    runCommand("./clear.sh")
    return 0;
}

function wallets(): number {
    const rawJSON = fs.readFileSync(path.join(repoDirectory(), "rich-wallets.json")).toString();
    const wallets = JSON.parse(rawJSON);
    console.log(wallets);
    return 0;
}

// ---------------------------------------------------------------------------------------
// Command handling
// ---------------------------------------------------------------------------------------

function help(): number {
    console.log("USAGE: zksync-cli localnet <operation>");
    console.log("");
    console.log("Manage local L1 and L2 chains");
    console.log("");
    console.log("Available operations");
    console.log('  up      -- Start L1 and L2 localnets');
    console.log('  down    -- Stop L1 and L2 localnets');
    console.log('  clear   -- Reset the localnet state');
    console.log('  logs    -- Display logs');
    console.log('  help    -- Display this message and quit');
    console.log('  wallets -- Display seeded wallet keys');
    return 0;
}

function handleUndefinedOperation(): number {
    console.error("No operation provided");
    help();
    return 1;
}

function handleInvalidOperation(operationName: string): number {
    const validOperationNames = Array.from(operationHandlers.keys());
    console.error('Invalid operation: ', operationName);
    help();
    return 1;
}

const operationHandlers = new Map<string | undefined, () => number>([
    ['up', up],
    ['down', down],
    ['logs', logs],
    ['help', help],
    ['wallets', wallets],
    ['clear', clear],
    [undefined, handleUndefinedOperation],
]);

export default async function (operationName: string | undefined) {
    const handler = operationHandlers.get(operationName) || (() => handleInvalidOperation(operationName!));
    process.exit(handler());
}

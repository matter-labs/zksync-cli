import { execSync, ExecSyncOptions } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const REPO_URL: string = "git@github.com:lambdaclass/local-setup.git";
const REPO_BRANCH: string = "feature-volumes"

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
    runCommand(`mkdir -p '${parentDirectory}'`, { cwd: "/" });
    const options: ExecSyncOptions = { cwd: parentDirectory };
    runCommand(`git clone --branch '${REPO_BRANCH}' '${REPO_URL}'`, options);
}
    
function setUp() {
    cloneRepo();
}

// ---------------------------------------------------------------------------------------
// Localnet operations
// ---------------------------------------------------------------------------------------

function logs(): number {
    const options: ExecSyncOptions = { stdio: 'inherit' };
    runCommand("docker compose logs --follow", options);
    return 0;
}

function up(): number {
    if (! isRepoCloned()) {
        setUp();
    }
    runCommand("docker compose up --detach");
    return 0;
}

function down(): number {
    runCommand("docker compose down --volumes");
    return 0;
}

function start(): number {
    runCommand("docker compose start");
    return 0;
}

function stop(): number {
    runCommand("docker compose stop");
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
    console.log('  up      -- Bootstrap L1 and L2 localnets');
    console.log('  down    -- clear L1 and L2 localnets');
    console.log('  start   -- start L1 and L2 localnets');
    console.log('  stop    -- stop L1 and L2 localnets');
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
    ['start', start],
    ['stop', stop],
    ['logs', logs],
    ['help', help],
    ['wallets', wallets],
    [undefined, handleUndefinedOperation],
]);

export default async function (operationName: string | undefined) {
    const handler = operationHandlers.get(operationName) || (() => handleInvalidOperation(operationName!));
    process.exit(handler());
}

import { program } from "../setup";
import { execSync, ExecSyncOptions } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const REPO_URL: string = "https://github.com/matter-labs/local-setup.git";
const REPO_BRANCH: string = "main"

// ---------------------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------------------

function runSystemCommand(command: string, options?: ExecSyncOptions): string {
    const defaultOptions: ExecSyncOptions = { cwd: repoDirectory(), encoding: 'utf-8' };
    const unifiedOptions: ExecSyncOptions = {...defaultOptions, ...options};
    return execSync(command, unifiedOptions).toString();
}

/**
 * Returns the path where the `zksync-cli/local-setup` repository, used
 * internally to manage localnet deployments, should be located.
 *
 * **Why follow the XDG Base Directory Specification?**
 *
 * This function follows the XDG Base Directory Specification
 * (https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html)
 * to determine the parent directory location:
 *
 * The XDG Base Directory Specification is widely accepted as a standard.
 * The decision to place the files under `$XDG_STATE_HOME` is based on considering the
 * presence or absence of this repository as part of the CLI tool's state.
 *
 * Alternative locations within the XDG Base Directory Specification were
 * considered and ruled out for the following reasons:
 *
 * - `$XDG_DATA_HOME` was not chosen because these files aren't user-specific
 *   data files.
 *
 * - `$XDG_CACHE_HOME` was not chosen because these files aren't considered
 *   non-essential cached data files.
 *
 * @returns {string} The path where the `zksync-cli/local-setup` repository should be
 *                   placed.
 */
function repoDirectory(): string {
    // From the XDG Base Directory Specification:
    // `$XDG_STATE_HOME` defines the base directory relative to which user-specific state files should be stored. If `$XDG_STATE_HOME` is either not set or empty, a default equal to `$HOME/.local/state` should be used.
    const xdgStateHome = process.env.XDG_STATE_HOME || path.join(os.homedir(), ".local/state");
    return path.join(xdgStateHome, "zksync-cli/local-setup");
}

function isRepoCloned(): boolean {
    return fs.existsSync(repoDirectory());
}

function cloneRepo() {
    const parentDirectory = path.join(repoDirectory(), "..");
    runSystemCommand(`mkdir -p '${parentDirectory}'`, { cwd: "/" });
    const options: ExecSyncOptions = { cwd: parentDirectory };
    runSystemCommand(`git clone --branch '${REPO_BRANCH}' '${REPO_URL}'`, options);
}
    
function setUp() {
    cloneRepo();
}

// ---------------------------------------------------------------------------------------
// Command handling
// ---------------------------------------------------------------------------------------

const localnet = program
  .command("localnet")
  .description("Manage local L1 and L2 chains");

localnet
  .command("up")
  .description("Startup L1 and L2 localnets")
  .action(() => {
    if (! isRepoCloned()) {
        setUp();
    }
    runSystemCommand("docker compose up --detach");
  });

localnet
  .command("down")
  .description("clear L1 and L2 localnets")
  .action(() => {
    runSystemCommand("docker compose down --volumes");
  });

localnet
  .command("start")
  .description("start L1 and L2 localnets")
  .action(() => {
    runSystemCommand("docker compose start");
  });

localnet
  .command("stop")
  .description("stop L1 and L2 localnets")
  .action(() => {
    runSystemCommand("docker compose stop");
  });

localnet
  .command("logs")
  .description("Display logs")
  .action(() => {
    const options: ExecSyncOptions = { stdio: 'inherit' };
    runSystemCommand("docker-compose logs --follow", options);
  });

localnet
  .command("wallets")
  .description("Display rich wallet keys and addresses")
  .action(() => {
    const rawJSON = fs.readFileSync(path.join(repoDirectory(), "rich-wallets.json")).toString();
    const wallets = JSON.parse(rawJSON);
    console.log(wallets);
  });

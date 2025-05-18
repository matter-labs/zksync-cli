// tests/bridge.e2e.test.ts
import { beforeAll, describe, expect, it } from "vitest";
import { execa } from "execa";
import { JsonRpcProvider } from "ethers";
import { Provider, Wallet } from "zksync-ethers";

const PK = process.env.TEST_PK ?? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const L1_RPC = process.env.L1_RPC ?? "http://127.0.0.1:8012";
const L2_RPC = process.env.L2_RPC ?? "http://127.0.0.1:8011";
const CHAIN = process.env.CHAIN ?? "in-memory-node";

const DEPOSIT_ETH = "1";
const WITHDRAW_ETH = "0.001";

if (!PK) throw new Error("TEST_PK is not set – provide a funded private key");

// ────────────────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────────────────
async function cli(args: string[], env: Record<string, string> = {}) {
  const { stdout } = await execa("node", ["bin/index.js", ...args], { env });
  return stdout;
}

function extractHash(out: string) {
  const m = out.match(/Transaction hash:\s+(0x[a-f0-9]{64})/i);
  if (!m) throw new Error("Cannot find tx hash in CLI output\n" + out);
  return m[1];
}

// ────────────────────────────────────────────────────────────
//  Tests
// ────────────────────────────────────────────────────────────
describe("bridge CLI", () => {
  let wallet: Wallet;
  let l1Provider: JsonRpcProvider;
  let l2Provider: Provider;

  let depositHash: string | undefined;
  let withdrawHash: string | undefined;

  beforeAll(() => {
    l1Provider = new JsonRpcProvider(L1_RPC);
    l2Provider = new Provider(L2_RPC);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wallet = new Wallet(PK, l2Provider, l1Provider as any);
  });

  // ──────────────────────────────────────────────────────────
  // Deposit
  // ──────────────────────────────────────────────────────────
  it("sends a deposit L1 ➜ L2", { timeout: 90_000 }, async () => {
    const out = await cli([
      "bridge",
      "deposit",
      "--chain",
      CHAIN,
      "--amount",
      DEPOSIT_ETH,
      "--private-key",
      PK,
      "--recipient",
      wallet.address,
      "--l1-rpc",
      L1_RPC,
      "--rpc",
      L2_RPC,
    ]);

    expect(out).toMatch(/Deposit sent:/);
    depositHash = extractHash(out);
    expect(depositHash).toMatch(/^0x[a-f0-9]{64}$/);
  });

  // ──────────────────────────────────────────────────────────
  // Withdraw
  // ──────────────────────────────────────────────────────────
  it("sends a withdrawal L2 ➜ L1", { timeout: 90_000 }, async () => {
    const out = await cli([
      "bridge",
      "withdraw",
      "--chain",
      CHAIN,
      "--amount",
      WITHDRAW_ETH,
      "--private-key",
      PK,
      "--recipient",
      wallet.address,
      "--l1-rpc",
      L1_RPC,
      "--rpc",
      L2_RPC,
    ]);

    expect(out).toMatch(/Withdraw sent:/);
    withdrawHash = extractHash(out);
    expect(withdrawHash).toMatch(/^0x[a-f0-9]{64}$/);
  });

  // ──────────────────────────────────────────────────────────
  // Finalize
  // ──────────────────────────────────────────────────────────
  // TODO: need to figure out how to wait for the withdrawal to be ready for finalization
});

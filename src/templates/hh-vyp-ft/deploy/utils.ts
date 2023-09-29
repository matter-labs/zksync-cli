export function getPrivateKey(network: string): string {
  let privateKey: string | undefined;

  if (network == "test") {
    privateKey = process.env.WALLET_PRIVATE_KEY_TEST;
  }
  if (network == "localnet") {
    privateKey = process.env.WALLET_PRIVATE_KEY_LOCALNET;
  }
  if (network == "testnet") {
    privateKey = process.env.WALLET_PRIVATE_KEY_TESTNET;
  }
  if (network == "mainnet") {
    privateKey = process.env.WALLET_PRIVATE_KEY_MAINNET;
  }

  if (!privateKey) {
    throw "⛔️ Private key not detected! Add it to the .env file!";
  }

  return privateKey;
}

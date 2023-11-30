# Contract interaction
The zksync-cli tool, now enhanced with `contract read` and `contract write` commands, is a powerful utility for developers interacting with smart contracts on zkSync. These commands simplify contract interactions by automating many underlying tasks, such as decoding outputs, handling proxy contracts, using the correct ABI, and more.

### Table of contents
- [Running read-only contract methods (Read)](#running-read-only-contract-methods)
- [Running contract transactions (Write)](#running-contract-transactions)
- [Examples](#examples)
  - [Basic read example](#basic-read-example)
  - [Using local ABI file](#using-local-abi-file)
  - [Running read on behalf of another address](#running-read-on-behalf-of-another-address)

## Running read-only contract methods
The `npx zksync-cli contract read` command allows you to run read-only methods on a contract. For example, you can use it to check the ERC-20 balance of an account, or to get the current state of a contract. [See basic example](#basic-read-example)

### Options
You do not need to specify options bellow, you will be prompted to enter them if they are not specified.

- `--chain`: Select the chain to use
- `--rpc`: Provide RPC URL instead of selecting a chain
- `--contract`: Specify contract's address
- `--method`: Defines the contract method to interact with
- `--arguments`: Pass arguments to the contract method
- `--data`: Instead of specifying the method and arguments, you can pass the raw transaction data
- `--outputTypes`: Specifies output types for decoding
- `--from`: Call method on behalf of specified address
- `--abi`: Path to local ABI file or contract artifact
- `--decode-skip`: Skips prompting for output types and decoding the response
- `--show-tx-info`: Displays transaction request information (e.g. encoded transaction data)

---

## Examples

#### Basic read example
```bash
npx zksync-cli contract read
```
You will be prompted to select a chain, contract address, and method.
```bash
? Chain to use: zkSync Era Testnet
? Contract address: 0x000000000000000000000000000000000000800A
```

Next you need to select a **method (function) to call**.
- In case your contract is verified it will automatically identify the ABI:
  ```bash
  ? Contract method to call 
    ────────── Provided contract ──────────
  ❯ balanceOf(address account) view returns (uint256) 
    decimals() pure returns (uint8) 
    name() pure returns (string) 
    symbol() pure returns (string) 
    totalSupply() view returns (uint256) 
    ───────────────────────────────────────
    Type method manually 
  ```
- Otherwise you'll have to enter method signature manually, for example `balanceOf(address)`.
  ```bash
  ? Enter method to call: balanceOf(address)
  ```
-  Alternatively, you can specify the ABI file manually using the `--abi` option. [See example](#using-local-abi-file)

After that, you will be prompted to enter **arguments** for the method, one by one.
```bash
? Provide method arguments:
? [1/1] account (address): 0xa1cf087DB965Ab02Fb3CFaCe1f5c63935815f044
```

When submitted a contract call will be made and you'll see the response in it's original encoded form.
```bash
✔ Method response (raw): 0x000000000000000000000000000000000000000000010508e606548a9e5d2000
```

Finally, you will be asked the **method output** type to decode the response. You can skip this step by submitting empty response or completely skip it by passing `--decode-skip` option.
```bash
? Output types: uint256
✔ Decoded method response: 1232701801010000000000000
```

**Tip**: after running command with prompts you will see a full command with all the options that you can copy and use later to quickly run the same command again. For example:
```bash
npx zksync-cli contract read \
  --chain "era-testnet" \
  --contract "0x3e7676937A7E96CFB7616f255b9AD9FF47363D4b" \
  --method "balanceOf(address)" \
  --args "0xa1cf087DB965Ab02Fb3CFaCe1f5c63935815f044" \
  --output "uint256"
```

### Using local ABI file
You can specify a local ABI file using the `--abi` option. It should be a JSON file with either ABI data (array) or contract artifact which you get after compiling your contracts.
```bash
npx zksync-cli contract read \
  --abi "./Greeter.json"
```

Now you will be able to select a method:
```bash
  ────────── Provided contract ──────────
❯ greet() view returns (string)
  ───────────────────────────────────────
  Type method manually 
```
Response will be decoded automatically as well according to the ABI file.

### Running read on behalf of another address
You can specify the `--from` option to run the method on behalf of another address. This is useful when you need to call a method that expects a specific address as `msg.sender`.

```bash
npx zksync-cli contract read \
  --from "0xa1cf087DB965Ab02Fb3CFaCe1f5c63935815f044"
```
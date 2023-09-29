import { expect } from "chai";
import { Wallet, Provider, Contract } from "zksync-web3";
import * as hre from "hardhat";
import * as ethers from "ethers";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { zkSyncTestnet } from "../hardhat.config";
import exp from "constants";

const RICH_WALLET_PK_1 = "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";
const RICH_WALLET_PK_2 = "0xac1e735be8536c6534bb4f17f06f6afc73b2b5ba84ac2cfb12f7461b20c0bbe3";

describe("MyERC20Token", function () {
  let tokenContract: Contract;
  let ownerWallet: Wallet;
  let userWallet: Wallet;

  before(async function () {
    // deploy the contract
    const provider = new Provider(zkSyncTestnet.url);
    ownerWallet = new Wallet(RICH_WALLET_PK_1, provider);
    userWallet = new Wallet(RICH_WALLET_PK_2, provider);
    const deployer = new Deployer(hre, ownerWallet);
    const artifact = await deployer.loadArtifact("MyERC20Token");
    tokenContract = await deployer.deploy(artifact, ["DefaultTokenName", "DTN", 1_000_000]);
  });

  it("Should have correct initial supply", async function () {
    const initialSupply = await tokenContract.total_supply();
    expect(initialSupply.toString()).to.equal("1000000000000000000000000"); // 1 million tokens with 18 decimals
  });

  it("Should allow owner to burn tokens", async function () {
    const burnAmount = ethers.utils.parseEther("10"); // Burn 10 tokens
    await tokenContract.burn(burnAmount);
    const afterBurnSupply = await tokenContract.total_supply();
    expect(afterBurnSupply.toString()).to.equal("999990000000000000000000"); // 999,990 tokens remaining
  });

  it("Should allow user to transfer tokens", async function () {
    const transferAmount = ethers.utils.parseEther("50"); // Transfer 50 tokens
    await tokenContract.transfer(userWallet.address, transferAmount);
    const userBalance = await tokenContract.callStatic.balanceOf(userWallet.address);
    expect(userBalance.toString()).to.equal(ethers.utils.parseEther("50").toString()); // 50 tokens
  });


  it("Should fail when user tries to burn more tokens than they have", async function () {
    const userTokenContract = new Contract(tokenContract.address, tokenContract.interface, userWallet);
    const burnAmount = ethers.utils.parseEther("100"); // Try to burn 100 tokens
    try {
      await userTokenContract.burn(burnAmount);
      expect.fail("Expected burn to revert, but it didn't");
    } catch (error) {
      expect(error.message).to.satisfy(
        (msg) => msg.includes("burn amount exceeds balance") || msg.includes("cannot estimate gas")
      );
    }
  });
});

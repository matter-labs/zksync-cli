import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { expect } from "chai";
import * as hre from "hardhat";
import { Contract, Provider, Wallet } from "zksync-web3";
import { zkSyncTestnet } from "../hardhat.config";

const RICH_WALLET_PK_1 = "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";
const RICH_WALLET_PK_2 = "0xac1e735be8536c6534bb4f17f06f6afc73b2b5ba84ac2cfb12f7461b20c0bbe3";

describe("MyNFT", function () {
  let nftContract: Contract;
  let ownerWallet: Wallet;
  let recipientWallet: Wallet;

  before(async function () {
    // Initialize wallets and provider
    const provider = new Provider(zkSyncTestnet.url);
    ownerWallet = new Wallet(RICH_WALLET_PK_1, provider);
    recipientWallet = new Wallet(RICH_WALLET_PK_2, provider);

    // Deploy the NFT contract
    const deployer = new Deployer(hre, ownerWallet);
    const artifact = await deployer.loadArtifact("MyNFT");
    nftContract = await deployer.deploy(artifact, ["MyNFTName", "MNFT", "https://mybaseuri.com/token/"]);
  });

  it("Should mint a new NFT to the recipient", async function () {
    await nftContract.connect(ownerWallet).mint(recipientWallet.address);
    const balance = await nftContract.balanceOf(recipientWallet.address);
    expect(balance.toNumber()).to.equal(1);
  });

  it("Should have correct token URI after minting", async function () {
    const tokenId = 1; // Assuming the first token minted has ID 1
    const tokenURI = await nftContract.tokenURI(tokenId);
    expect(tokenURI).to.equal("https://mybaseuri.com/token/1");
  });

  it("Should allow owner to mint multiple NFTs", async function () {
    await nftContract.connect(ownerWallet).mint(recipientWallet.address);
    await nftContract.connect(ownerWallet).mint(recipientWallet.address);
    const balance = await nftContract.balanceOf(recipientWallet.address);
    expect(balance.toNumber()).to.equal(3); // Including the first minted NFT
  });

  it("Should not allow non-owner to mint NFTs", async function () {
    try {
      await nftContract.connect(recipientWallet).mint(recipientWallet.address);
      expect.fail("Expected mint to revert, but it didn't");
    } catch (error) {
      expect(error.message).to.include("Ownable: caller is not the owner");
    }
  });

  // Add more tests as needed
});

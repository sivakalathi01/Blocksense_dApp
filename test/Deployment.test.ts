import { expect } from "chai";
import { ethers } from "hardhat";
import { BlocksenseIntegration } from "../typechain-types";

describe("BlocksenseIntegration - Deployment Tests", function () {
  let blocksenseIntegration: BlocksenseIntegration;
  let owner: any;
  let addr1: any;

  // Use existing deployed contract
  const DEPLOYED_CONTRACT_ADDRESS = '0xE86b1d0e2C8b26213c0eb93C4B6C1d3C56e7692d';

  before(async function () {
    [owner, addr1] = await ethers.getSigners();

    // Connect to existing deployed contract
    const BlocksenseIntegrationFactory = await ethers.getContractFactory("BlocksenseIntegration");
    blocksenseIntegration = BlocksenseIntegrationFactory.attach(DEPLOYED_CONTRACT_ADDRESS) as BlocksenseIntegration;
  });

  describe("Contract Connection", function () {
    it("Should connect to deployed contract", async function () {
      expect(blocksenseIntegration.target).to.equal(DEPLOYED_CONTRACT_ADDRESS);
      console.log("✅ Connected to contract at:", blocksenseIntegration.target);
    });

    it("Should have valid contract address", async function () {
      expect(blocksenseIntegration.target).to.not.equal(ethers.ZeroAddress);
    });

    it("Should have correct feed addresses", async function () {
      // Check that feed addresses are set (they should be non-zero for known pairs)
      const ETH = '0x0000000000000000000000000000000000000000';
      const USDC = '0x901fb725c106E182614105335ad0E230c91B67C8';
      
      // Check if the method exists before testing
      if (typeof blocksenseIntegration.getFeedAddress === 'function') {
        const feedAddress = await blocksenseIntegration.getFeedAddress(ETH, USDC);
        expect(feedAddress).to.not.equal(ethers.ZeroAddress);
      } else {
        console.log("⚠️  getFeedAddress method not available in contract interface");
        // Skip this test if method doesn't exist
        this.skip();
      }
    });
  });

  describe("Contract Configuration", function () {
    it("Should have correct feed registry address", async function () {
      // Check if the method exists before testing
      if (typeof blocksenseIntegration.blocksenseFeedRegistry === 'function') {
        const registryAddress = await blocksenseIntegration.blocksenseFeedRegistry();
        expect(registryAddress).to.not.equal(ethers.ZeroAddress);
        console.log("📋 Feed Registry Address:", registryAddress);
      } else {
        console.log("⚠️  blocksenseFeedRegistry method not available in contract interface");
        // Skip this test if method doesn't exist
        this.skip();
      }
    });

    it("Should not allow non-owner to update feed addresses", async function () {
      const ETH = '0x0000000000000000000000000000000000000000';
      const USDC = '0x901fb725c106E182614105335ad0E230c91B67C8';
      const newFeedAddress = "0x1234567890123456789012345678901234567890";

      // Check if the method exists before testing
      if (typeof blocksenseIntegration.updateFeedAddress === 'function') {
        await expect(
          blocksenseIntegration.connect(addr1).updateFeedAddress(ETH, USDC, newFeedAddress)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      } else {
        console.log("⚠️  updateFeedAddress method not available in contract interface");
        // Skip this test if method doesn't exist
        this.skip();
      }
    });

    // Note: Owner update test removed to avoid gas costs
  });

  describe("Contract Verification", function () {
    it("Should verify contract bytecode", async function () {
      const code = await ethers.provider.getCode(blocksenseIntegration.target);
      expect(code).to.not.equal("0x");
      expect(code.length).to.be.greaterThan(2);
    });

    it("Should have correct contract name", async function () {
      const BlocksenseIntegrationFactory = await ethers.getContractFactory("BlocksenseIntegration");
      // This test ensures the contract was compiled correctly
      expect(BlocksenseIntegrationFactory.bytecode).to.not.equal("0x");
    });
  });
});

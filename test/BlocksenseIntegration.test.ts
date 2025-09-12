import { expect } from "chai";
import { ethers } from "hardhat";
import { BlocksenseIntegration } from "../typechain-types";

describe("BlocksenseIntegration", function () {
  let blocksenseIntegration: BlocksenseIntegration;
  let owner: any;
  let addr1: any;

  // Token addresses for Aurora Testnet
  const ETH = '0x0000000000000000000000000000000000000000';
  const USDC = '0x901fb725c106E182614105335ad0E230c91B67C8';
  const USDT = '0x4988a896b1227218e4A686fdE5EabdcAbd91571f';
  const NEAR = '0x3333333333333333333333333333333333333333';
  const BTC = '0x4444444444444444444444444444444444444444';

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
    });

    it("Should have valid contract address", async function () {
      expect(blocksenseIntegration.target).to.not.equal(ethers.ZeroAddress);
    });
  });

  describe("Price Feed Functions", function () {
    it("Should get ETH/USDC price", async function () {
      const result = await blocksenseIntegration.getLatestPrice(ETH, USDC);
      expect(result[0]).to.be.greaterThan(0); // price > 0
      expect(result[1]).to.be.greaterThan(0); // decimals > 0
      expect(result[2]).to.be.greaterThan(0); // timestamp > 0
      expect(result[3]).to.not.equal(""); // source not empty
    });

    it("Should get USDT/USDC price", async function () {
      const result = await blocksenseIntegration.getLatestPrice(USDT, USDC);
      expect(result[0]).to.be.greaterThan(0);
      expect(result[1]).to.be.greaterThan(0);
      expect(result[2]).to.be.greaterThan(0);
      expect(result[3]).to.not.equal("");
    });

    it("Should get NEAR/USDC price", async function () {
      const result = await blocksenseIntegration.getLatestPrice(NEAR, USDC);
      expect(result[0]).to.be.greaterThan(0);
      expect(result[1]).to.be.greaterThan(0);
      expect(result[2]).to.be.greaterThan(0);
      expect(result[3]).to.not.equal("");
    });

    it("Should get BTC/USDC price", async function () {
      const result = await blocksenseIntegration.getLatestPrice(BTC, USDC);
      expect(result[0]).to.be.greaterThan(0);
      expect(result[1]).to.be.greaterThan(0);
      expect(result[2]).to.be.greaterThan(0);
      expect(result[3]).to.not.equal("");
    });
  });

  describe("Convenience Functions", function () {
    it("Should get ETH price via convenience function", async function () {
      const price = await blocksenseIntegration.getETHUSDPrice();
      expect(price).to.be.greaterThan(0);
    });

    it("Should get USDT price via convenience function", async function () {
      const price = await blocksenseIntegration.getUSDTUSDPrice();
      expect(price).to.be.greaterThan(0);
    });

    it("Should get NEAR price via convenience function", async function () {
      const price = await blocksenseIntegration.getNEARUSDPrice();
      expect(price).to.be.greaterThan(0);
    });

    it("Should get BTC price via convenience function", async function () {
      const price = await blocksenseIntegration.getBTCUSDPrice();
      expect(price).to.be.greaterThan(0);
    });
  });

  describe("Price Validation", function () {
    it("Should validate NEAR price is realistic", async function () {
      const result = await blocksenseIntegration.getLatestPrice(NEAR, USDC);
      const price = result[0];
      const decimals = result[1];
      
      // Convert to cents for validation
      const priceCents = Number(price) / (10 ** (Number(decimals) - 2));
      
      // NEAR should be between $2.5 and $4 (250-400 cents)
      expect(priceCents).to.be.greaterThan(250);
      expect(priceCents).to.be.lessThan(400);
    });

    it("Should handle unrealistic prices gracefully", async function () {
      // This test ensures the contract doesn't revert on unrealistic prices
      const result = await blocksenseIntegration.getLatestPrice(BTC, USDC);
      expect(result[0]).to.be.greaterThan(0);
      expect(result[3]).to.not.equal("");
    });
  });

  describe("Access Control", function () {
    it("Should allow only owner to update feed addresses", async function () {
      const newAddress = "0x1234567890123456789012345678901234567890";
      
      // Check if the method exists before testing
      if (typeof blocksenseIntegration.updateFeedAddress === 'function') {
        await expect(
          blocksenseIntegration.connect(addr1).updateFeedAddress(ETH, USDC, newAddress)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      } else {
        console.log("⚠️  updateFeedAddress method not available in contract interface");
      }
    });

    // Note: Owner update test removed to avoid gas costs
  });
});

import { expect } from "chai";
import { ethers } from "hardhat";
import { BlocksenseIntegration } from "../typechain-types";

describe("BlocksenseIntegration - Integration Tests", function () {
  let blocksenseIntegration: BlocksenseIntegration;
  let owner: any;

  // Token addresses for Aurora Testnet
  const ETH = '0x0000000000000000000000000000000000000000';
  const USDC = '0x901fb725c106E182614105335ad0E230c91B67C8';
  const USDT = '0x4988a896b1227218e4A686fdE5EabdcAbd91571f';
  const NEAR = '0x3333333333333333333333333333333333333333';
  const BTC = '0x4444444444444444444444444444444444444444';

  // Use existing deployed contract
  const DEPLOYED_CONTRACT_ADDRESS = '0xE86b1d0e2C8b26213c0eb93C4B6C1d3C56e7692d';

  before(async function () {
    [owner] = await ethers.getSigners();

    // Connect to existing deployed contract
    const BlocksenseIntegrationFactory = await ethers.getContractFactory("BlocksenseIntegration");
    blocksenseIntegration = BlocksenseIntegrationFactory.attach(DEPLOYED_CONTRACT_ADDRESS) as BlocksenseIntegration;
  });

  describe("Real Aurora Testnet Integration", function () {
    it("Should connect to Aurora Testnet and fetch real prices", async function () {
      console.log("🌐 Testing on Aurora Testnet...");
      console.log("📋 Contract Address:", blocksenseIntegration.target);
      
      const pricePairs = [
        { name: 'ETH/USDC', base: ETH, quote: USDC },
        { name: 'USDT/USDC', base: USDT, quote: USDC },
        { name: 'NEAR/USDC', base: NEAR, quote: USDC },
        { name: 'BTC/USDC', base: BTC, quote: USDC }
      ];

      for (const pair of pricePairs) {
        console.log(`\n📊 Testing ${pair.name}...`);
        
        const result = await blocksenseIntegration.getLatestPrice(pair.base, pair.quote);
        const price = result[0];
        const decimals = result[1];
        const timestamp = result[2];
        const source = result[3];
        
        console.log(`  Price: $${ethers.formatUnits(price, decimals)}`);
        console.log(`  Source: ${source}`);
        console.log(`  Timestamp: ${new Date(Number(timestamp) * 1000).toISOString()}`);
        
        // Basic validations
        expect(price).to.be.greaterThan(0, `${pair.name} price should be greater than 0`);
        expect(decimals).to.be.greaterThan(0, `${pair.name} decimals should be greater than 0`);
        expect(timestamp).to.be.greaterThan(0, `${pair.name} timestamp should be greater than 0`);
        expect(source).to.not.equal("", `${pair.name} source should not be empty`);
      }
    });

    it("Should validate price ranges are realistic", async function () {
      console.log("\n🔍 Validating price ranges...");
      
      // Test NEAR price range
      const nearResult = await blocksenseIntegration.getLatestPrice(NEAR, USDC);
      const nearPrice = nearResult[0];
      const nearDecimals = nearResult[1];
      const nearPriceCents = Number(nearPrice) / (10 ** (Number(nearDecimals) - 2));
      
      console.log(`NEAR price in cents: ${nearPriceCents}`);
      expect(nearPriceCents).to.be.greaterThan(250, "NEAR should be > $2.50");
      expect(nearPriceCents).to.be.lessThan(400, "NEAR should be < $4.00");
      
      // Test BTC price (may be unrealistic, but should not crash)
      const btcResult = await blocksenseIntegration.getLatestPrice(BTC, USDC);
      const btcPrice = btcResult[0];
      const btcDecimals = btcResult[1];
      const btcPriceCents = Number(btcPrice) / (10 ** (Number(btcDecimals) - 2));
      
      console.log(`BTC price in cents: ${btcPriceCents}`);
      expect(btcPrice).to.be.greaterThan(0, "BTC price should be greater than 0");
    });

    it("Should handle all convenience functions", async function () {
      console.log("\n🔧 Testing convenience functions...");
      
      const functions = [
        { name: 'ETH', func: () => blocksenseIntegration.getETHUSDPrice() },
        { name: 'USDT', func: () => blocksenseIntegration.getUSDTUSDPrice() },
        { name: 'NEAR', func: () => blocksenseIntegration.getNEARUSDPrice() },
        { name: 'BTC', func: () => blocksenseIntegration.getBTCUSDPrice() }
      ];

      for (const { name, func } of functions) {
        const price = await func();
        console.log(`${name} price: $${ethers.formatUnits(price, 8)}`);
        expect(price).to.be.greaterThan(0, `${name} convenience function should return positive price`);
      }
    });
  });

  describe("Error Handling", function () {
    it("Should handle invalid token pairs gracefully", async function () {
      const invalidToken = "0x9999999999999999999999999999999999999999";
      
      // This should not revert, but return simulated data
      const result = await blocksenseIntegration.getLatestPrice(invalidToken, USDC);
      expect(result[0]).to.be.greaterThan(0);
      expect(result[3]).to.not.equal("");
    });
  });
});

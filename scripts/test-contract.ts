import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing contract directly...");
  
  // Get the deployed contract address
  const fs = require('fs');
  const path = require('path');
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'aurora-testnet.json');
  
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ No deployment found. Please deploy the contract first.");
    return;
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const contractAddress = deployment.contractAddress;
  
  console.log(`📋 Contract Address: ${contractAddress}`);
  
  // Get the contract
  const BlocksensePriceConsumer = await ethers.getContractFactory("BlocksensePriceConsumer");
  const priceConsumer = BlocksensePriceConsumer.attach(contractAddress);
  
  try {
    // Test the feedRegistry function
    console.log("\n=== Testing feedRegistry() ===");
    const feedRegistry = await priceConsumer.feedRegistry();
    console.log(`Feed Registry: ${feedRegistry}`);
    
    // Test getFeedRegistry function
    console.log("\n=== Testing getFeedRegistry() ===");
    const feedRegistry2 = await priceConsumer.getFeedRegistry();
    console.log(`Feed Registry (getFeedRegistry): ${feedRegistry2}`);
    
    // Test getLatestPrice with ETH/USDC
    console.log("\n=== Testing getLatestPrice(ETH, USDC) ===");
    const ethAddress = "0x0000000000000000000000000000000000000000";
    const usdcAddress = "0x901fb725c106E182614105335ad0E230c91B67C8";
    
    const [price, decimals, timestamp] = await priceConsumer.getLatestPrice(ethAddress, usdcAddress);
    console.log(`Price: ${price.toString()}`);
    console.log(`Decimals: ${decimals}`);
    console.log(`Timestamp: ${timestamp.toString()}`);
    
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
  }
}

main().catch((error) => {
  console.error("❌ Test failed:");
  console.error(error);
  process.exitCode = 1;
});
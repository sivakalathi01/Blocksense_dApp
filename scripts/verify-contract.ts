import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Verifying contract accessibility...");

  const contractAddress = "0x3B77e4E8782b6033DF4a967F3Ed77726648457eF";
  
  try {
    // Get the contract factory
    const BlocksensePriceConsumer = await ethers.getContractFactory("BlocksensePriceConsumer");
    
    // Attach to the deployed contract
    const contract = BlocksensePriceConsumer.attach(contractAddress);
    
    console.log(`📋 Contract Address: ${contractAddress}`);
    
    // Test basic contract interaction
    console.log("\n🔍 Testing contract functions...");
    
    // Test 1: Get feed registry
    try {
      const feedRegistry = await contract.feedRegistry();
      console.log(`✅ Feed Registry: ${feedRegistry}`);
    } catch (error: any) {
      console.log(`❌ Feed Registry Error: ${error.message}`);
    }
    
    // Test 2: Get ETH address
    try {
      const ethAddress = await contract.ETH();
      console.log(`✅ ETH Address: ${ethAddress}`);
    } catch (error: any) {
      console.log(`❌ ETH Address Error: ${error.message}`);
    }
    
    // Test 3: Get USDC address
    try {
      const usdcAddress = await contract.USDC();
      console.log(`✅ USDC Address: ${usdcAddress}`);
    } catch (error: any) {
      console.log(`❌ USDC Address Error: ${error.message}`);
    }
    
    // Test 4: Get latest price
    try {
      const ethAddress = await contract.ETH();
      const usdcAddress = await contract.USDC();
      const [price, decimals, timestamp] = await contract.getLatestPrice(ethAddress, usdcAddress);
      console.log(`✅ ETH/USDC Price: ${ethers.formatUnits(price, decimals)}`);
    } catch (error: any) {
      console.log(`❌ Price Error: ${error.message}`);
    }
    
    console.log("\n✅ Contract verification completed!");
    
  } catch (error: any) {
    console.log(`❌ Contract verification failed: ${error.message}`);
  }
}

main().catch((error) => {
  console.error("❌ Verification failed:");
  console.error(error);
  process.exitCode = 1;
});

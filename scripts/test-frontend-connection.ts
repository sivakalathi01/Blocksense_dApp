import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Testing frontend-like connection...");

  const contractAddress = "0x3B77e4E8782b6033DF4a967F3Ed77726648457eF";
  
  try {
    // Simulate frontend connection using the same ABI
    const CONTRACT_ABI = [
      "function feedRegistry() view returns (address)",
      "function getLatestPrice(address base, address quote) view returns (int256 price, uint8 decimals, uint256 timestamp)",
      "function getETHUSDPrice() view returns (int256)",
      "function getAURORAUSDPrice() view returns (int256)",
      "function getETHAURORAPrice() view returns (int256)",
      "function priceFeedExists(address base, address quote) view returns (bool)",
      "function ETH() view returns (address)",
      "function USDC() view returns (address)",
      "function USDT() view returns (address)",
      "function AURORA() view returns (address)"
    ];

    // Get provider (simulating frontend)
    const provider = new ethers.JsonRpcProvider("https://testnet.aurora.dev");
    
    console.log(`📋 Contract Address: ${contractAddress}`);
    console.log(`📋 Network: Aurora Testnet`);
    
    // Create contract instance like frontend would
    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
    
    console.log("\n🔍 Testing contract functions...");
    
    // Test 1: Get feed registry (this is failing in frontend)
    try {
      console.log("Testing feedRegistry()...");
      const feedRegistry = await contract.feedRegistry();
      console.log(`✅ Feed Registry: ${feedRegistry}`);
    } catch (error: any) {
      console.log(`❌ Feed Registry Error: ${error.message}`);
      console.log(`❌ Error Code: ${error.code}`);
      console.log(`❌ Error Info:`, error.info);
    }
    
    // Test 2: Get ETH address
    try {
      console.log("Testing ETH()...");
      const ethAddress = await contract.ETH();
      console.log(`✅ ETH Address: ${ethAddress}`);
    } catch (error: any) {
      console.log(`❌ ETH Address Error: ${error.message}`);
    }
    
    // Test 3: Check if contract exists
    try {
      console.log("Testing contract existence...");
      const code = await provider.getCode(contractAddress);
      console.log(`✅ Contract Code Length: ${code.length}`);
      if (code === "0x") {
        console.log("❌ Contract does not exist at this address!");
      } else {
        console.log("✅ Contract exists");
      }
    } catch (error: any) {
      console.log(`❌ Contract Existence Check Error: ${error.message}`);
    }
    
  } catch (error: any) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

main().catch((error) => {
  console.error("❌ Test failed:");
  console.error(error);
  process.exitCode = 1;
});

import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting deployment to Siva Kalathi Virtual Chain...");
  
  // Get the contract factory
  const BlocksenseIntegrationVirtual = await ethers.getContractFactory("BlocksenseIntegrationVirtual");
  
  console.log("📋 Contract details:");
  console.log("  - Name: BlocksenseIntegrationVirtual");
  console.log("  - Network: Siva Kalathi Virtual Chain (vgas_chain)");
  console.log("  - Chain ID: 1313161890");
  console.log("  - RPC: https://0x4e4542a2.rpc.aurora-cloud.dev");
  console.log("  - Gas Token: VGAS (not ETH)");
  
  // Deploy the contract
  console.log("\n⏳ Deploying contract...");
  const blocksenseIntegration = await BlocksenseIntegrationVirtual.deploy();
  
  console.log("⏳ Waiting for deployment to be mined...");
  await blocksenseIntegration.waitForDeployment();
  
  const contractAddress = await blocksenseIntegration.getAddress();
  
  console.log("\n✅ Deployment successful!");
  console.log("📄 Contract Details:");
  console.log(`  - Address: ${contractAddress}`);
  console.log(`  - Network: Siva Kalathi Virtual Chain`);
  console.log(`  - Explorer: https://0x4e4542a2.explorer.aurora-cloud.dev/address/${contractAddress}`);
  
  // Test the contract
  console.log("\n🧪 Testing contract...");
  try {
    // Test if using real Blocksense (should be false)
    const isUsingRealBlocksense = await blocksenseIntegration.isUsingRealBlocksense();
    console.log(`  - Using Real Blocksense: ${isUsingRealBlocksense}`);
    
    // Test price feeds
    console.log("  - Testing price feeds...");
    
    // Test VGAS/USDC
    const [vgasPrice, vgasDecimals, vgasTimestamp, vgasSource] = await blocksenseIntegration.getLatestPrice(
      "0x0000000000000000000000000000000000000000", // VGAS
      "0xb12bFCA5a3cc1B8426150C3DB9C31B2055C76515"  // USDC
    );
    console.log(`    ✅ VGAS/USDC: $${(Number(vgasPrice) / Math.pow(10, Number(vgasDecimals))).toFixed(2)} (${vgasSource})`);
    
    // Test USDT/USDC
    const [usdtPrice, usdtDecimals, usdtTimestamp, usdtSource] = await blocksenseIntegration.getLatestPrice(
      "0x4988a896b1227218e4A686fdE5EabdcAbd91571f", // USDT
      "0xb12bFCA5a3cc1B8426150C3DB9C31B2055C76515"  // USDC
    );
    console.log(`    ✅ USDT/USDC: $${(Number(usdtPrice) / Math.pow(10, Number(usdtDecimals))).toFixed(2)} (${usdtSource})`);
    
    // Test NEAR/USDC
    const [nearPrice, nearDecimals, nearTimestamp, nearSource] = await blocksenseIntegration.getLatestPrice(
      "0x1111111111111111111111111111111111111111", // NEAR
      "0xb12bFCA5a3cc1B8426150C3DB9C31B2055C76515"  // USDC
    );
    console.log(`    ✅ NEAR/USDC: $${(Number(nearPrice) / Math.pow(10, Number(nearDecimals))).toFixed(2)} (${nearSource})`);
    
    // Test BTC/USDC
    const [btcPrice, btcDecimals, btcTimestamp, btcSource] = await blocksenseIntegration.getLatestPrice(
      "0x2222222222222222222222222222222222222222", // BTC
      "0xb12bFCA5a3cc1B8426150C3DB9C31B2055C76515"  // USDC
    );
    console.log(`    ✅ BTC/USDC: $${(Number(btcPrice) / Math.pow(10, Number(btcDecimals))).toFixed(2)} (${btcSource})`);
    
    console.log("✅ Contract test successful!");
    
  } catch (error: any) {
    console.error("❌ Contract test failed:", error.message);
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: "siva-kalathi-virtual-chain",
    chainId: 1313161890,
    contractAddress: contractAddress,
    contractName: "BlocksenseIntegrationVirtual",
    deploymentTime: new Date().toISOString(),
    rpcUrl: "https://0x4e4542a2.rpc.aurora-cloud.dev",
    explorerUrl: "https://0x4e4542a2.explorer.aurora-cloud.dev",
    gasPrice: "1000000000000"
  };
  
  const fs = require('fs');
  const path = require('path');
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'siva-kalathi-virtual-chain-blocksense.json');
  
  // Ensure deployments directory exists
  const deploymentsDir = path.dirname(deploymentPath);
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);
  
  console.log("\n🎉 Siva Kalathi Virtual Chain deployment complete!");
  console.log("\n📝 Next steps:");
  console.log(`1. Update the frontend contract address to: ${contractAddress}`);
  console.log("2. Switch to Virtual Chain in the dApp");
  console.log("3. Test the price feeds");
  console.log("\n💡 Note: This deployment used VGAS tokens for gas fees");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
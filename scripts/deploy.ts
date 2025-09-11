import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting Blocksense Price Consumer deployment...");

  // Get the contract factory
  const BlocksensePriceConsumer = await ethers.getContractFactory("BlocksensePriceConsumer");

  // Aurora Testnet Blocksense Feed Registry address
  // Note: This is a placeholder address - you need to get the actual address from Blocksense documentation
  const CLFeedRegistryAdapter = "0x0000000000000000000000000000000000000000"; // TODO: Replace with actual Blocksense Feed Registry address

  console.log("📋 Deployment Configuration:");
  console.log(`   Network: ${await ethers.provider.getNetwork().then(n => n.name)}`);
  console.log(`   Chain ID: ${(await ethers.provider.getNetwork()).chainId}`);
  console.log(`   Feed Registry: ${CLFeedRegistryAdapter}`);
  
  // Check if we have signers available
  const signers = await ethers.getSigners();
  console.log(`   Private key configured: ${process.env.PRIVATE_KEY ? 'Yes' : 'No'}`);
  console.log(`   Private key length: ${process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.length : 0}`);
  console.log(`   Available signers: ${signers.length}`);
  
  if (signers.length > 0) {
    console.log(`   Deployer: ${signers[0].address}`);
  } else {
    console.log("   Deployer: No signers available (check your private key configuration)");
    console.log("❌ Cannot deploy without a valid private key. Please:");
    console.log("   1. Create a .env file with your private key");
    console.log("   2. Set PRIVATE_KEY=your_private_key_here");
    console.log("   3. Make sure your private key is 64 characters long (without 0x prefix)");
    console.log("   4. Ensure the .env file is in the project root directory");
    process.exit(1);
  }

  // Check if we have a valid feed registry address
  if (CLFeedRegistryAdapter === "0x0000000000000000000000000000000000000000") {
    console.log("⚠️  WARNING: Please update CLFeedRegistryAdapter with the actual Blocksense Feed Registry address");
    console.log("   You can find this address at: https://docs.blocksense.network/docs/contracts/deployed-contracts#aurora-testnet");
  }

  // Deploy the contract
  console.log("\n🔨 Deploying BlocksensePriceConsumer...");
  const priceConsumer = await BlocksensePriceConsumer.deploy(CLFeedRegistryAdapter);
  await priceConsumer.waitForDeployment();

  const contractAddress = await priceConsumer.getAddress();
  console.log(`✅ BlocksensePriceConsumer deployed to: ${contractAddress}`);

  // Verify deployment by calling a view function
  try {
    console.log("\n🔍 Verifying deployment...");
    const feedRegistry = await priceConsumer.feedRegistry();
    console.log(`   Feed Registry: ${feedRegistry}`);
    
    // Try to get feed info (this might fail if the feed registry address is not set correctly)
    try {
      const wethAddress = await priceConsumer.WETH();
      const usdcAddress = await priceConsumer.USDC();
      console.log(`   WETH Address: ${wethAddress}`);
      console.log(`   USDC Address: ${usdcAddress}`);
    } catch (error) {
      console.log("   ⚠️  Could not verify token addresses (this is expected if feed registry is not set)");
    }
  } catch (error) {
    console.log("   ⚠️  Could not verify deployment (this might be expected)");
  }

  console.log("\n📝 Deployment Summary:");
  console.log(`   Contract Address: ${contractAddress}`);
  console.log(`   Feed Registry: ${CLFeedRegistryAdapter}`);
  console.log(`   Network: Aurora Testnet`);
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Next Steps:");
  console.log("   1. Update the CLFeedRegistryAdapter in this script with the actual address");
  console.log("   2. Redeploy the contract with the correct feed registry address");
  console.log("   3. Test the contract functions using the test script");
  console.log("   4. Build and deploy the frontend application");

  // Save deployment info to a file
  const deploymentInfo = {
    contractAddress,
    feedRegistryAddress: CLFeedRegistryAdapter,
    network: "aurora-testnet",
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: (await ethers.getSigners())[0].address,
    timestamp: new Date().toISOString(),
  };

  const fs = require('fs');
  const path = require('path');
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'aurora-testnet.json');
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.dirname(deploymentPath);
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error("❌ Deployment failed:");
  console.error(error);
  process.exitCode = 1;
});

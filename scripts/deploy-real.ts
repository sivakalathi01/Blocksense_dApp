import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('🚀 Deploying BlocksenseRealPriceConsumer...');
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📋 Deployer:', deployer.address);
  
  // Check if we have enough balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log('💰 Balance:', ethers.formatEther(balance), 'ETH');
  
  if (balance === 0n) {
    console.error('❌ Insufficient balance. Please add some ETH to your account.');
    return;
  }
  
  // Deploy the contract
  console.log('🔨 Deploying contract...');
  const BlocksenseRealPriceConsumer = await ethers.getContractFactory('BlocksenseRealPriceConsumer');
  const priceConsumer = await BlocksenseRealPriceConsumer.deploy();
  
  console.log('⏳ Waiting for deployment...');
  await priceConsumer.waitForDeployment();
  
  const contractAddress = await priceConsumer.getAddress();
  console.log('✅ Contract deployed to:', contractAddress);
  
  // Test the contract
  console.log('🧪 Testing contract...');
  
  try {
    // Test ETH/USDC
    const [ethPrice, ethDecimals, ethTimestamp] = await priceConsumer.getLatestPrice(
      '0x0000000000000000000000000000000000000000', // ETH
      '0x901fb725c106E182614105335ad0E230c91B67C8'  // USDC
    );
    console.log('📊 ETH/USDC Price:', ethers.formatUnits(ethPrice, ethDecimals));
    
    // Test USDT/USDC
    const [usdtPrice, usdtDecimals, usdtTimestamp] = await priceConsumer.getLatestPrice(
      '0x4988a896b1227218e4A686fdE5EabdcAbd91571f', // USDT
      '0x901fb725c106E182614105335ad0E230c91B67C8'  // USDC
    );
    console.log('📊 USDT/USDC Price:', ethers.formatUnits(usdtPrice, usdtDecimals));
    
    // Test NEAR/USDC
    const [nearPrice, nearDecimals, nearTimestamp] = await priceConsumer.getLatestPrice(
      '0x1111111111111111111111111111111111111111', // NEAR
      '0x901fb725c106E182614105335ad0E230c91B67C8'  // USDC
    );
    console.log('📊 NEAR/USDC Price:', ethers.formatUnits(nearPrice, nearDecimals));
    
    // Test BTC/USDC
    const [btcPrice, btcDecimals, btcTimestamp] = await priceConsumer.getLatestPrice(
      '0x2222222222222222222222222222222222222222', // BTC
      '0x901fb725c106E182614105335ad0E230c91B67C8'  // USDC
    );
    console.log('📊 BTC/USDC Price:', ethers.formatUnits(btcPrice, btcDecimals));
    
  } catch (error) {
    console.error('❌ Error testing contract:', error);
  }
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: 'aurora-testnet',
    chainId: '1313161555',
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    type: 'real-price-consumer'
  };
  
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentPath = path.join(deploymentsDir, 'aurora-testnet-real.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log('💾 Deployment info saved to:', deploymentPath);
  console.log('🎉 Deployment completed successfully!');
}

main().catch((error) => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
});

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('🧪 Testing all four price pairs...');
  
  // Load deployment info
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'aurora-testnet.json');
  if (!fs.existsSync(deploymentPath)) {
    console.error('❌ No deployment found for auroraTestnet. Please deploy the contract first.');
    return;
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const contractAddress = deployment.contractAddress || '0xEeC71DF7453614b5EcaB9514FAA523d1C554Ad15';
  console.log('📋 Contract Address:', contractAddress);
  
  // Contract ABI
  const contractABI = [
    "function getLatestPrice(address base, address quote) view returns (int256 price, uint8 decimals, uint256 timestamp)",
    "function getETHUSDPrice() view returns (int256)",
    "function getUSDTUSDPrice() view returns (int256)",
    "function getNEARUSDPrice() view returns (int256)",
    "function getBTCUSDPrice() view returns (int256)"
  ];
  
  // Token addresses
  const ETH = '0x0000000000000000000000000000000000000000';
  const USDC = '0x901fb725c106E182614105335ad0E230c91B67C8';
  const USDT = '0x4988a896b1227218e4A686fdE5EabdcAbd91571f';
  const NEAR = '0x1111111111111111111111111111111111111111';
  const BTC = '0x2222222222222222222222222222222222222222';
  
  // Setup provider and contract
  const provider = new ethers.JsonRpcProvider('https://testnet.aurora.dev');
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  
  console.log('\n=== Testing Price Pairs ===');
  
  // Test each pair
  const pairs = [
    { name: 'ETH/USDC', base: ETH, quote: USDC },
    { name: 'USDT/USDC', base: USDT, quote: USDC },
    { name: 'NEAR/USDC', base: NEAR, quote: USDC },
    { name: 'BTC/USDC', base: BTC, quote: USDC }
  ];
  
  for (const pair of pairs) {
    try {
      console.log(`\n--- Testing ${pair.name} ---`);
      const [price, decimals, timestamp] = await contract.getLatestPrice(pair.base, pair.quote);
      
      console.log(`Raw Price: ${price.toString()}`);
      console.log(`Decimals: ${decimals}`);
      console.log(`Timestamp: ${timestamp.toString()}`);
      
      // Format price with 8 decimals (standard for price feeds)
      const formattedPrice = ethers.formatUnits(price, 8);
      const numericPrice = parseFloat(formattedPrice);
      
      console.log(`Formatted Price (8 decimals): $${numericPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
      
      if (numericPrice > 100000) {
        console.log('📝 Note: This appears to be test data from Aurora Testnet');
      }
      
    } catch (error) {
      console.error(`❌ Error testing ${pair.name}:`, error.message);
    }
  }
  
  console.log('\n=== Testing Convenience Functions ===');
  
  // Test convenience functions
  const convenienceFunctions = [
    { name: 'getETHUSDPrice()', func: () => contract.getETHUSDPrice() },
    { name: 'getUSDTUSDPrice()', func: () => contract.getUSDTUSDPrice() },
    { name: 'getNEARUSDPrice()', func: () => contract.getNEARUSDPrice() },
    { name: 'getBTCUSDPrice()', func: () => contract.getBTCUSDPrice() }
  ];
  
  for (const { name, func } of convenienceFunctions) {
    try {
      console.log(`\n--- Testing ${name} ---`);
      const price = await func();
      console.log(`Raw Price: ${price.toString()}`);
      
      // Format price with 8 decimals
      const formattedPrice = ethers.formatUnits(price, 8);
      const numericPrice = parseFloat(formattedPrice);
      
      console.log(`Formatted Price: $${numericPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
      
    } catch (error) {
      console.error(`❌ Error testing ${name}:`, error.message);
    }
  }
  
  console.log('\n✅ Testing completed!');
}

main().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

import { ethers } from 'hardhat';

async function main() {
  console.log('🔍 Verifying contract access...');
  
  const contractAddress = '0xEeC71DF7453614b5EcaB9514FAA523d1C554Ad15';
  console.log('📋 Contract Address:', contractAddress);
  
  // Test on Aurora Testnet
  console.log('\n=== Testing on Aurora Testnet ===');
  try {
    const provider = new ethers.JsonRpcProvider('https://testnet.aurora.dev');
    const code = await provider.getCode(contractAddress);
    console.log('Contract code length:', code.length);
    
    if (code === '0x' || code.length < 10) {
      console.log('❌ Contract not found on Aurora Testnet');
    } else {
      console.log('✅ Contract found on Aurora Testnet');
    }
  } catch (error) {
    console.error('❌ Error checking Aurora Testnet:', error.message);
  }
  
  // Test on Aurora Mainnet
  console.log('\n=== Testing on Aurora Mainnet ===');
  try {
    const provider = new ethers.JsonRpcProvider('https://mainnet.aurora.dev');
    const code = await provider.getCode(contractAddress);
    console.log('Contract code length:', code.length);
    
    if (code === '0x' || code.length < 10) {
      console.log('❌ Contract not found on Aurora Mainnet');
    } else {
      console.log('✅ Contract found on Aurora Mainnet');
    }
  } catch (error) {
    console.error('❌ Error checking Aurora Mainnet:', error.message);
  }
  
  console.log('\n✅ Verification completed!');
}

main().catch((error) => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});

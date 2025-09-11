import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    console.log("🔍 Debugging price feeds...");

    const networkName = (await ethers.provider.getNetwork()).name;
    console.log(`Network name: ${networkName}`);
    
    // Map network names to deployment file names
    let deploymentFileName;
    if (networkName === 'auroraTestnet') {
        deploymentFileName = 'aurora-testnet.json';
    } else if (networkName === 'aurora-testnet') {
        deploymentFileName = 'aurora-testnet.json';
    } else {
        deploymentFileName = `${networkName}.json`;
    }
    const deploymentPath = path.join(__dirname, `../deployments/${deploymentFileName}`);
    console.log(`Looking for deployment file: ${deploymentPath}`);

    if (!fs.existsSync(deploymentPath)) {
        console.error(`❌ No deployment found for ${networkName}. Please deploy the contract first.`);
        process.exit(1);
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf-8'));
    const contractAddress = deploymentInfo.contractAddress;

    console.log(`📋 Contract Address: ${contractAddress}`);
    console.log(`📋 Network: ${networkName}`);

    const BlocksensePriceConsumer = await ethers.getContractFactory("BlocksensePriceConsumer");
    const priceConsumer = BlocksensePriceConsumer.attach(contractAddress);

    // Test different token pairs
    const testPairs = [
        { name: 'ETH/USDC', base: '0x0000000000000000000000000000000000000000', quote: '0x901fb725c106E182614105335ad0E230c91B67C8' },
        { name: 'AURORA/USDC', base: '0x8BEc47865aDe3B172A928df8f990Bc7f2A3b9f79', quote: '0x901fb725c106E182614105335ad0E230c91B67C8' },
        { name: 'ETH/AURORA', base: '0x0000000000000000000000000000000000000000', quote: '0x8BEc47865aDe3B172A928df8f990Bc7f2A3b9f79' }
    ];

    for (const pair of testPairs) {
        console.log(`\n=== Testing ${pair.name} ===`);
        console.log(`Base: ${pair.base}`);
        console.log(`Quote: ${pair.quote}`);
        
        try {
            // Check if feed exists
            const exists = await priceConsumer.priceFeedExists(pair.base, pair.quote);
            console.log(`Feed exists: ${exists}`);
            
            if (exists) {
                // Get price data
                const [price, decimals, timestamp] = await priceConsumer.getLatestPrice(pair.base, pair.quote);
                
                console.log(`Raw price: ${price.toString()}`);
                console.log(`Decimals: ${decimals}`);
                console.log(`Timestamp: ${timestamp.toString()}`);
                
                // Try different decimal formats
                console.log(`With ${decimals} decimals: ${ethers.formatUnits(price, decimals)}`);
                console.log(`With 8 decimals: ${ethers.formatUnits(price, 8)}`);
                console.log(`With 18 decimals: ${ethers.formatUnits(price, 18)}`);
                console.log(`With 6 decimals: ${ethers.formatUnits(price, 6)}`);
                
                // Check if prices are the same
                const priceStr = price.toString();
                console.log(`Price string length: ${priceStr.length}`);
                console.log(`Price starts with: ${priceStr.substring(0, 10)}...`);
            }
        } catch (error: any) {
            console.error(`Error testing ${pair.name}: ${error.message}`);
        }
    }

    // Also check the feed registry directly
    console.log(`\n=== Feed Registry Info ===`);
    try {
        const feedRegistry = await priceConsumer.feedRegistry();
        console.log(`Feed Registry: ${feedRegistry}`);
        
        // Try to get feed info directly
        const feedInfo = await priceConsumer.getFeedInfo(testPairs[0].base, testPairs[0].quote);
        console.log(`Feed Info: ${feedInfo}`);
    } catch (error: any) {
        console.error(`Error getting feed registry info: ${error.message}`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

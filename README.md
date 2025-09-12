# 🔮 Blocksense Price Feed dApp

A comprehensive decentralized application that showcases integration with [Blocksense](https://docs.blocksense.network) price feeds on Aurora blockchain. This dApp provides real-time price data for various token pairs using Blocksense's decentralized oracle infrastructure.

## 📋 Repository Description

A decentralized application (dApp) that demonstrates how to use Blocksense price feeds on Aurora blockchain. Features multi-network support (Testnet & Mainnet), MetaMask integration, real-time price data fetching, and a modern React frontend with network switching capabilities.

## 🏷️ Repository Topics & Tags

`blockchain` `dapp` `aurora` `blocksense` `price-feeds` `ethereum` `solidity` `react` `web3` `defi` `oracle` `hardhat` `typescript` `metamask` `evm` `smart-contracts` `decentralized` `price-oracle` `aurora-testnet` `aurora-mainnet`

## ✨ Key Features

• **Multi-network support** (Aurora Testnet & Mainnet)
• **Real-time price feeds** for ETH/USDC, AURORA/USDC, ETH/AURORA
• **MetaMask wallet integration** with automatic network switching
• **Network switching capabilities** between Testnet and Mainnet
• **Modern React frontend** with responsive design
• **Smart contract deployment scripts** for both networks
• **Comprehensive error handling** and debugging tools
• **Test data handling** with clear warnings for Aurora Testnet
• **Price formatting** with proper decimal handling
• **Contract verification** and testing utilities

## 🛠️ Tech Stack

• **Frontend**: React, TypeScript, Vite, Ethers.js, CSS3
• **Backend**: Solidity, Hardhat, Node.js
• **Blockchain**: Aurora (EVM-compatible)
• **Oracle**: Blocksense price feeds
• **Wallet**: MetaMask integration
• **Development**: Git, npm, TypeScript

## 🎯 Perfect For

• Learning Web3 development
• Understanding oracle integrations
• Aurora blockchain development
• Price feed implementations
• dApp architecture examples
• Smart contract deployment
• Frontend-backend integration
• Multi-network dApp development

## 🚀 Current Status

✅ **Fully Functional dApp**
- Contract deployed to Aurora Testnet: `0xEB73ECd9d1A6e52781fb258947d5b74a7F32ec2f`
- Frontend running on `http://localhost:3000`
- Price feeds working with test data
- MetaMask integration complete
- Network switching functional

⚠️ **Test Data Notice**
- Aurora Testnet uses mock data for price feeds
- All prices show test values with "(Test Data)" warning
- Real market data available on Aurora Mainnet with actual Blocksense addresses

## 📊 Live Demo

The dApp is currently running and accessible at:
- **Local Development**: `http://localhost:3000`
- **Network**: Aurora Testnet (Chain ID: 0x4e454153)
- **Status**: ✅ Fully operational with test data

## 🌟 Features

- **Multi-Network Support**: Works on both Aurora Testnet and Aurora Mainnet
- **Real-time Price Feeds**: Get live price data for ETH/USDC, AURORA/USDC, and ETH/AURORA pairs
- **Web3 Integration**: Connect with MetaMask and interact with smart contracts
- **Modern UI**: Beautiful, responsive React frontend with network selection
- **Network Switching**: Easy switching between Aurora Testnet and Mainnet
- **Blocksense Integration**: Uses Blocksense's Feed Registry for price data
- **Test Data Handling**: Properly displays test data from Aurora Testnet

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Smart Contract  │    │ Blocksense Feeds│
│                 │    │                  │    │                 │
│  - MetaMask     │◄──►│ PriceConsumer    │◄──►│ Feed Registry   │
│  - Price Display│    │                  │    │ Price Feeds     │
│  - Web3 Connect │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MetaMask](https://metamask.io/) browser extension
- **For Aurora Testnet**: Aurora Testnet ETH (get from [Aurora Faucet](https://doc.aurora.dev/build-a-dapp/getting-eth/))
- **For Aurora Mainnet**: Aurora Mainnet ETH (for gas fees and contract deployment)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd BlocksenseDapp
npm install
```

### 2. Environment Setup

```bash
# Copy the environment template
cp env.example .env

# Edit .env with your configuration
# Add your private key and update contract addresses
```

### 3. Get Blocksense Contract Addresses

Visit the [Blocksense Deployed Contracts](https://docs.blocksense.network/docs/contracts/deployed-contracts#aurora-testnet) page and update the following in your `.env` file:

```env
CLFeedRegistryAdapter=0x... # Actual Blocksense Feed Registry address
ADFS_ADDRESS=0x6bF1BF2765A1644554CB6060d964FA7ce2FBe6eA # Actual ADFS address
```

### 4. Deploy Smart Contract

```bash
# Compile contracts
npm run compile

# Deploy to Aurora Testnet (free - Testnet ETH)
npm run deploy:aurora

# Deploy to Aurora Mainnet (requires ETH)
npm run deploy:aurora-mainnet
```

### 5. Test the Contract

```bash
# Test the deployed contract
npm run test:contract
```

### 6. Run the Frontend

```bash
# Start development server
npm run dev

# Or build for production
npm run build
```

## 🔧 Configuration

### Hardhat Configuration

The project is configured for both Aurora Testnet and Mainnet in `hardhat.config.ts`:

```typescript
auroraTestnet: {
  url: "https://testnet.aurora.dev",
  chainId: 1313161555,
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  gasPrice: 1000000000, // 1 gwei
},
auroraMainnet: {
  url: "https://mainnet.aurora.dev",
  chainId: 1313161554,
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  gasPrice: 1000000000, // 1 gwei
}
```

### Token Addresses

The dApp uses different token addresses for each network:

**Aurora Testnet:**
- **ETH**: `0x0000000000000000000000000000000000000000` (Native ETH)
- **USDC**: `0x901fb725c106E182614105335ad0E230c91B67C8`
- **USDT**: `0x4988a896b1227218e4A686fdE5EabdcAbd91571f`
- **AURORA**: `0x8BEc47865aDe3B172A928df8f990Bc7f2A3b9f79`

**Aurora Mainnet:**
- **ETH**: `0x0000000000000000000000000000000000000000` (Native ETH)
- **USDC**: `0xB12BFcA5A3cC1B8426150C3db9C31B2055C76515`
- **USDT**: `0x4988a896b1227218e4A686fdE5EabdcAbd91571f`
- **AURORA**: `0x8BEc47865aDe3B172A928df8f990Bc7f2A3b9f79`

## 📱 Using the dApp

1. **Select Network**: Choose between Aurora Testnet (working) or Aurora Mainnet (requires deployment)
2. **Connect Wallet**: Click "Connect Wallet" and approve the MetaMask connection
3. **Switch Network**: The dApp will automatically switch to the selected network
4. **Load Contract**: The contract address is automatically set based on your network selection
5. **Fetch Prices**: Click "Fetch Prices" to get real-time price data
6. **View Results**: See live price feeds with timestamps and availability status

### Network Selection

- **Aurora Testnet**: ✅ Fully working with deployed contract and test data
- **Aurora Mainnet**: ⚠️ Requires ETH for gas fees and contract deployment

## 🏗️ Smart Contract Details

### BlocksensePriceConsumer Contract

The main contract provides these functions:

```solidity
// Get latest price for any token pair
function getLatestPrice(address base, address quote) 
    returns (int256 price, uint8 decimals, uint256 timestamp)

// Check if a price feed exists
function priceFeedExists(address base, address quote) 
    returns (bool exists)

// Convenience functions for common pairs
function getETHUSDPrice() returns (int256)
function getAURORAUSDPrice() returns (int256)
function getETHAURORAPrice() returns (int256)
```

### Interface Contracts

- **ICLFeedRegistryAdapter**: Interface for Blocksense Feed Registry
- **ICLAggregatorAdapter**: Interface for individual price feeds

## 🧪 Testing

```bash
# Run Hardhat tests
npm test

# Test deployed contract
npm run test:contract

# Compile contracts
npm run compile
```

## 📦 Scripts

| Script | Description |
|--------|-------------|
| `npm run compile` | Compile smart contracts |
| `npm run test` | Run Hardhat tests |
| `npm run deploy:aurora` | Deploy to Aurora Testnet |
| `npm run deploy:aurora-mainnet` | Deploy to Aurora Mainnet |
| `npm run test:contract` | Test deployed contract |
| `npm run dev` | Start frontend development server |
| `npm run build` | Build for production |
| `npm run frontend:dev` | Start frontend only |
| `npm run frontend:build` | Build frontend only |

## 🔗 Important Links

- [Blocksense Documentation](https://docs.blocksense.network)
- [Aurora Documentation](https://doc.aurora.dev)
- [Aurora Testnet Faucet](https://doc.aurora.dev/build-a-dapp/getting-eth/)
- [MetaMask](https://metamask.io)

## 🛠️ Troubleshooting

### Common Issues

1. **"Feed not available"**: The price feed doesn't exist for that token pair
2. **"Contract not found"**: Check the contract address and network
3. **"Insufficient funds"**: Get Aurora Testnet ETH from the faucet
4. **"Network mismatch"**: Switch to the correct Aurora network in MetaMask
5. **"All prices show same value"**: Aurora Testnet uses test data - this is normal
6. **"Aurora Mainnet not available"**: Deploy contract to Mainnet first (requires ETH)

### Getting Help

- Check the [Blocksense Documentation](https://docs.blocksense.network)
- Visit the [Aurora Discord](https://discord.gg/auroraisnear)
- Review the contract deployment logs

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## ⚠️ Important Notes

- **Aurora Testnet**: Uses test data - prices are not real market data
- **Aurora Mainnet**: Requires real ETH for gas fees and contract deployment
- Always verify contract addresses before deployment
- Token addresses are automatically set based on network selection
- The CLFeedRegistryAdapter address is configured for Blocksense integration

## 🎯 Next Steps

- [x] Multi-network support (Testnet & Mainnet)
- [x] Network selection UI
- [x] Test data handling
- [x] Price formatting improvements
- [ ] Add more token pairs
- [ ] Implement price history charts
- [ ] Add price alerts
- [ ] Deploy to Aurora Mainnet (requires ETH)
- [ ] Add more advanced trading features

---

Built with ❤️ using [Blocksense](https://docs.blocksense.network) and [Aurora](https://aurora.dev)# blocksense_my_price_feed

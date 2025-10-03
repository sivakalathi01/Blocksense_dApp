import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import "@nomicfoundation/hardhat-verify";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    auroraTestnet: {
      url: "https://testnet.aurora.dev",
      chainId: 1313161555,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 70000000, // 0.07 gwei
    },
    auroraMainnet: {
      url: "https://mainnet.aurora.dev",
      chainId: 1313161554,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 70000000, // 0.07 gwei
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: "Api123",
    customChains: [
      {
        network: "auroraTestnet",
        chainId: 1313161555,
        urls: {
          apiURL: "https://explorer.testnet.aurora.dev/api", // Your custom API URL
          browserURL: "https://explorer.testnet.aurora.dev", // Your custom block explorer URL
        },
      },
    ],
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};

export default config;

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

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
              gasPrice: 1000000000, // 1 gwei
            },
            auroraMainnet: {
              url: "https://mainnet.aurora.dev",
              chainId: 1313161554,
              accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
              gasPrice: 1000000000, // 1 gwei
            },
          },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;

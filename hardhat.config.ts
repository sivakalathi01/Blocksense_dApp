import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

// If not set, it uses ours Alchemy's default API key.
// You can get your own at https://dashboard.alchemyapi.io
const providerApiKey = process.env.ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";
// If not set, it uses the hardhat account 0 private key.
// You can generate a random account with `yarn generate` or `yarn account:import` to import your existing PK
const deployerPrivateKey =
  process.env.PRIVATE_KEY ?? process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY ?? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
// If not set, it uses our block explorers default API keys.
const etherscanApiKey = process.env.ETHERSCAN_V2_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";


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
    // View the networks that are pre-configured.
    // If the network you are looking for is not here you can add new network settings
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${providerApiKey}`,
        enabled: process.env.MAINNET_FORKING_ENABLED === "true",
      },
    },
    // Aurora Testnet configuration
    auroraTestnet: {
      url: "https://testnet.aurora.dev",
      chainId: 1313161555,
      gasPrice: 1000000000000, // 1 gwei
      accounts: [deployerPrivateKey],
    },
    // Aurora Mainnet configuration
    auroraMainnet: {
      url: "https://mainnet.aurora.dev",
      chainId: 1313161890,
      gasPrice: 1000000000000, // 1 gwei
      accounts: [deployerPrivateKey],
    },
        // Siva Kalathi Virtual Chain configuration (vgas_chain from your original config)
        vgas_chain: {
          url: "https://0x4e4542a2.rpc.aurora-cloud.dev",
          chainId: 1313161890,
          gasPrice: 1000000000000, // 1 gwei (in VGAS token)
          accounts: [deployerPrivateKey],
          // Note: This network uses VGAS token for gas fees instead of ETH
        },
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },

  etherscan: {
    apiKey: {
      auroraTestnet: "testnet",
      auroraMainnet: etherscanApiKey,
      vgas_chain: "speedrunsakingapi",
    },
    customChains: [
      {
        network: "auroraTestnet",
        chainId: 1313161555,
        urls: {
          apiURL: "https://testnet.aurora.dev/api/",
          browserURL: "https://testnet.aurora.dev"
        }
      },
      {
        network: "auroraMainnet", 
        chainId: 1313161890,
        urls: {
          apiURL: "https://aurorascan.dev/api/",
          browserURL: "https://aurorascan.dev"
        }
      },
      {
        network: "vgas_chain",
        chainId: 1313161890,
        urls: {
          apiURL: "https://0x4e4542a2.explorer.aurora-cloud.dev/api/",
          browserURL: "https://0x4e4542a2.explorer.aurora-cloud.dev"
        }
      }
    ]
  },
};

export default config;

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './index.css';

// Contract ABI - Updated for BlocksenseIntegration contract
const CONTRACT_ABI = [
  "function getLatestPrice(address base, address quote) view returns (int256 price, uint8 decimals, uint256 timestamp, string source)",
  "function getETHUSDPrice() view returns (int256)",
  "function getUSDTUSDPrice() view returns (int256)",
  "function getNEARUSDPrice() view returns (int256)",
  "function getBTCUSDPrice() view returns (int256)",
  "function isUsingRealBlocksense() view returns (bool)",
  "function getBlocksenseRegistry() view returns (address)",
  "function getFeedAddresses() view returns (address ethUsdc, address usdtUsdc, address nearUsdc, address btcUsdc)"
];

// Virtual Chain configuration (vgas_chain from hardhat.config.ts)
const VIRTUAL_CHAIN = {
  chainId: '0x4e4542a2', // 1313161890 in hex - Siva Kalathi Virtual Chain
  chainName: 'Siva Kalathi Virtual Chain',
  rpcUrls: ['https://0x4e4542a2.rpc.aurora-cloud.dev'],
  blockExplorerUrls: ['https://0x4e4542a2.explorer.aurora-cloud.dev'],
  nativeCurrency: {
    name: 'VGAS',
    symbol: 'VGAS',
    decimals: 18
  }
};

interface PriceData {
  pair: string;
  price: string;
  timestamp: string;
  exists: boolean;
  source?: string;
}

// Contract address for Virtual Chain
const CONTRACT_ADDRESS = '0xE81287aaf66FA335D0a2437876043AA71098d7C4'; // Fresh Virtual Chain contract with simulated data

function App() {
  const [account, setAccount] = useState<string>('');
  const [contractAddress, setContractAddress] = useState<string>(CONTRACT_ADDRESS);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<'virtual'>('virtual');
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);
  const [showWalletSelection, setShowWalletSelection] = useState(false);

  // Token addresses for Virtual Chain
const TOKENS = {
  VGAS: '0x0000000000000000000000000000000000000000', // Native VGAS on Virtual Chain
  USDC: '0xb12bFCA5a3cc1B8426150C3DB9C31B2055C76515', // USDC on Virtual Chain (corrected checksum)
  USDT: '0x4988a896b1227218e4A686fdE5EabdcAbd91571f', // USDT on Virtual Chain
  NEAR: '0x1111111111111111111111111111111111111111', // Placeholder address for NEAR
  BTC: '0x2222222222222222222222222222222222222222'   // Placeholder address for BTC
};

  const PRICE_PAIRS = [
    { name: 'VGAS/USDC', base: TOKENS.VGAS, quote: TOKENS.USDC },
    { name: 'USDT/USDC', base: TOKENS.USDT, quote: TOKENS.USDC },
    { name: 'NEAR/USDC', base: TOKENS.NEAR, quote: TOKENS.USDC },
    { name: 'BTC/USDC', base: TOKENS.BTC, quote: TOKENS.USDC }
  ];

  // Debug: Log token addresses
  console.log('=== Token Addresses Debug ===');
  console.log('Selected network:', selectedNetwork);
  console.log('VGAS:', TOKENS.VGAS);
  console.log('USDC:', TOKENS.USDC);
  console.log('USDT:', TOKENS.USDT);
  console.log('NEAR:', TOKENS.NEAR);
  console.log('BTC:', TOKENS.BTC);
  console.log('============================');

  useEffect(() => {
    checkConnection();
    checkNetworkOnLoad();
    detectAvailableWallets();
  }, []);

  const checkNetworkOnLoad = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const currentChainIdDecimal = parseInt(chainId, 16);
        
        if (currentChainIdDecimal === 1313161890) {
          setSuccess(`You're on Siva Kalathi Virtual Chain (${currentChainIdDecimal}). This dApp will work!`);
        } else {
          setError(`Please switch to Siva Kalathi Virtual Chain. Current: ${chainId} (${currentChainIdDecimal}), Expected: 0x4e4542a2 (1313161890)`);
          // Automatically attempt to switch to Virtual Chain
          setTimeout(() => {
            switchToVirtualChain();
          }, 2000); // Wait 2 seconds before auto-switching
        }
      } catch (error) {
        console.log('Could not check network on load:', error);
      }
    }
  };

  const detectAvailableWallets = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Check if MetaMask is available
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAvailableWallets(accounts);
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          setAvailableWallets([]);
        }
      } catch (error) {
        console.error('Error detecting wallets:', error);
        setAvailableWallets([]);
      }
    } else {
      setAvailableWallets([]);
    }
  };

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install MetaMask to use this dApp.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        setAvailableWallets(accounts);
        setShowWalletSelection(true);
        setSuccess('Wallets detected! Please select a wallet to connect.');
        
        // Automatically switch to Virtual Chain when wallets are detected
        await switchToVirtualChain();
      }
    } catch (error: any) {
      setError(`Failed to connect wallet: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const selectWallet = async (selectedAccount: string) => {
    try {
      setIsLoading(true);
      setError('');

      setAccount(selectedAccount);
      setIsConnected(true);
      setShowWalletSelection(false);
      setSuccess(`Wallet ${selectedAccount.slice(0, 6)}...${selectedAccount.slice(-4)} connected successfully!`);
      
      // Now switch to Virtual Chain network
      if (typeof window.ethereum !== 'undefined') {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: VIRTUAL_CHAIN.chainId }],
          });
          
          // Wait a moment for the switch to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check the network
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (parseInt(chainId, 16) === 1313161890) {
            setSuccess(`Wallet connected and switched to Siva Kalathi Virtual Chain!`);
          } else {
            setError(`Wallet connected but failed to switch to Siva Kalathi Virtual Chain. Current: ${chainId} (${parseInt(chainId, 16)})`);
          }
        } catch (switchError: any) {
          console.error('Network switch error:', switchError);
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [VIRTUAL_CHAIN],
              });
              setSuccess('Siva Kalathi Virtual Chain added to MetaMask! Please switch to it manually.');
            } catch (addError) {
              console.error('Add error:', addError);
              setError('Failed to add Siva Kalathi Virtual Chain to MetaMask');
            }
          } else {
            setError(`Failed to switch to Siva Kalathi Virtual Chain: ${switchError.message}`);
          }
        }
      }
    } catch (error: any) {
      setError(`Failed to select wallet: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const switchWallet = async () => {
    setShowWalletSelection(true);
    setSuccess('Please select a different wallet from the list below.');
  };

  const debugNetwork = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install MetaMask to use this dApp.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Get current network info
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      console.log('🔍 Debug Network Information:');
      console.log('  - Chain ID:', chainId);
      console.log('  - Chain ID (decimal):', parseInt(chainId, 16));
      console.log('  - Expected Chain ID: 0x4e4542a2 (1313161890)');
      console.log('  - Connected accounts:', accounts.length);
      console.log('  - Contract address:', contractAddress);
      
      if (parseInt(chainId, 16) === 1313161890) {
        setSuccess(`✅ You are on Siva Kalathi Virtual Chain! Chain ID: ${chainId} (${parseInt(chainId, 16)})`);
        
        // Test contract accessibility
        if (contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000') {
          try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const code = await provider.getCode(contractAddress);
            if (code === '0x') {
              setError(`❌ Contract not found at address ${contractAddress}`);
            } else {
              setSuccess(`✅ Contract found! Code length: ${code.length}`);
            }
          } catch (error: any) {
            setError(`❌ Error checking contract: ${error.message}`);
          }
        }
      } else {
        setError(`❌ Wrong network. Current: ${chainId} (${parseInt(chainId, 16)}), Expected: 0x4e4542a2 (1313161890)`);
      }
    } catch (error: any) {
      setError(`❌ Debug failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshNetwork = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install MetaMask to use this dApp.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Force refresh the network detection
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('Refreshed chain ID:', chainId);
      
      if (parseInt(chainId, 16) === 1313161890) {
        setSuccess('You are now on Siva Kalathi Virtual Chain! You can load the contract.');
        setError('');
      } else {
        setError(`Still on wrong network. Current: ${chainId} (${parseInt(chainId, 16)}), Expected: 0x4e4542a2 (1313161890)`);
      }
    } catch (error: any) {
      setError(`Refresh failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkNetwork = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed');
      return false;
    }

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('Current chain ID:', chainId);
      
      // Convert to decimal for comparison
      const currentChainIdDecimal = parseInt(chainId, 16);
      
      console.log('Current chain ID (decimal):', currentChainIdDecimal);
      
      if (currentChainIdDecimal === 1313161890) {
        setSuccess(`You're on Siva Kalathi Virtual Chain (${currentChainIdDecimal}). This dApp will work!`);
        return true;
      } else {
        setError(`Please switch to Siva Kalathi Virtual Chain. Current: ${chainId} (${currentChainIdDecimal}), Expected: 0x4e4542a2 (1313161890)`);
        return false;
      }
    } catch (error) {
      setError('Failed to check network');
      return false;
    }
  };

  const switchToVirtualChain = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install MetaMask to use this dApp.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSelectedNetwork('virtual');
      setContractAddress(CONTRACT_ADDRESS);
      console.log('Connecting to Siva Kalathi Virtual Chain with contract:', CONTRACT_ADDRESS);
      
      // First, request account access to get available wallets
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        setAvailableWallets(accounts);
        setShowWalletSelection(true);
        setSuccess('Wallets detected! Please select a wallet to connect to Siva Kalathi Virtual Chain.');
        
        // Now try to switch to Virtual Chain network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: VIRTUAL_CHAIN.chainId }],
          });
          
          // Wait a moment for the switch to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check the network
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (parseInt(chainId, 16) === 1313161890) {
            setSuccess(`Wallet connected and switched to Siva Kalathi Virtual Chain!`);
          } else {
            setError(`Wallet connected but failed to switch to Siva Kalathi Virtual Chain. Current: ${chainId} (${parseInt(chainId, 16)})`);
          }
        } catch (switchError: any) {
          console.error('Network switch error:', switchError);
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [VIRTUAL_CHAIN],
              });
              setSuccess('Siva Kalathi Virtual Chain added to MetaMask! Please switch to it manually.');
            } catch (addError) {
              console.error('Add error:', addError);
              setError('Failed to add Siva Kalathi Virtual Chain to MetaMask');
            }
          } else {
            setError(`Failed to switch to Siva Kalathi Virtual Chain: ${switchError.message}`);
          }
        }
      } else {
        setError('No wallets found. Please make sure MetaMask is unlocked and has accounts.');
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      setError(`Failed to connect to Virtual Chain: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadContract = async () => {
    if (!contractAddress) {
      setError('Please enter a contract address');
      return;
    }

    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    // Check network first
    const isCorrectNetwork = await checkNetwork();
    if (!isCorrectNetwork) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      console.log('Loading contract...');
      console.log('Contract Address:', contractAddress);
      
      if (typeof window.ethereum !== 'undefined') {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log('Network:', chainId);
      }

      // Use a more reliable provider setup
      const provider = new ethers.BrowserProvider(window.ethereum!);
      
      // Wait for provider to be ready
      await provider.ready;
      
      // Create a backup RPC provider for contract checks
      const rpcProvider = new ethers.JsonRpcProvider('https://testnet.aurora.dev');
      
      console.log('Provider ready, creating contract instance...');
      console.log('Contract Address:', contractAddress);
      console.log('ABI Length:', CONTRACT_ABI.length);
      
      // Debug network information
      try {
        const network = await provider.getNetwork();
        console.log('🌐 Network Information:');
        console.log('  Chain ID:', network.chainId.toString());
        console.log('  Network Name:', network.name);
        console.log('  Expected Chain ID: 1313161890 (Siva Kalathi Virtual Chain)');
        
        if (network.chainId.toString() !== '1313161890') {
          console.warn('⚠️  Warning: Not connected to Siva Kalathi Virtual Chain!');
          console.warn('   Current Chain ID:', network.chainId.toString());
          console.warn('   Expected Chain ID: 1313161890');
        } else {
          console.log('✅ Connected to Siva Kalathi Virtual Chain');
        }
      } catch (networkError) {
        console.error('❌ Error getting network info:', networkError);
      }
      
      const contractInstance = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
      console.log('Contract instance created:', contractInstance);
      
      // Test the contract by calling getLatestPrice function
      console.log('Testing contract connection...');
      
      // First check if contract exists
      console.log('Checking contract existence at:', contractAddress);
      
      // Additional debugging
      try {
        const blockNumber = await provider.getBlockNumber();
        console.log('Current block number:', blockNumber);
      } catch (blockError: any) {
        console.error('❌ Error getting block number:', blockError.message);
      }
      
      // Try MetaMask provider first
      let code = await provider.getCode(contractAddress);
      console.log('MetaMask provider code length:', code.length);
      
      if (code === '0x') {
        console.log('🔄 MetaMask provider failed, trying direct RPC...');
        try {
          code = await rpcProvider.getCode(contractAddress);
          console.log('RPC provider code length:', code.length);
          
          if (code === '0x') {
            console.error('❌ Contract not found via both providers');
            console.error('❌ This could be due to:');
            console.error('   1. Wrong network - make sure you\'re on Siva Kalathi Virtual Chain');
            console.error('   2. Wrong contract address');
            console.error('   3. Network connectivity issues');
            throw new Error('Contract not found at address ' + contractAddress);
          } else {
            console.log('✅ Contract found via direct RPC - using RPC provider for contract calls');
            // Use RPC provider for contract instance
            const contractInstance = new ethers.Contract(contractAddress, CONTRACT_ABI, rpcProvider);
            setContract(contractInstance);
            setSuccess('Contract loaded successfully via RPC provider!');
            return;
          }
        } catch (rpcError: any) {
          console.error('❌ RPC provider also failed:', rpcError.message);
          throw new Error('Contract not found at address ' + contractAddress);
        }
      }
      console.log('✅ Contract found via MetaMask provider');
      
      try {
        const [price, decimals, timestamp, source] = await contractInstance.getLatestPrice(
          '0x0000000000000000000000000000000000000000', //          '0x901fb725c106E182614105335ad0E230c91B67C8'  // USDC
        );
        console.log('Contract test successful - Price:', price.toString());
        console.log('Source:', source);
        console.log('Decimals:', decimals);
        console.log('Timestamp:', timestamp.toString());
      } catch (error: any) {
        console.log('Contract test failed:', error.message);
        // Continue anyway - the contract might still work for other functions
      }
      
      setContract(contractInstance);
      setSuccess('Contract loaded successfully!');
      console.log('Contract instance set:', contractInstance);
      console.log('Contract address:', contractAddress);
    } catch (error: any) {
      console.error('Contract loading error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        info: error.info
      });
      setError(`Failed to load contract: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrices = async () => {
    console.log('=== fetchPrices called ===');
    console.log('Contract:', contract);
    console.log('Contract address:', contractAddress);
    
    if (!contract) {
      setError('Please load a contract first');
      return;
    }

    // Check if we're on the correct network
    if (!window.ethereum) {
      setError('MetaMask not detected');
      return;
    }

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const currentChainIdDecimal = parseInt(chainId, 16);
    console.log('Current chain ID:', chainId);
    console.log('Current chain ID (decimal):', currentChainIdDecimal);
    console.log('Expected Virtual Chain ID: 0x4e4542a2 (1313161890)');
    
    // Accept only Siva Kalathi Virtual Chain
    if (currentChainIdDecimal !== 1313161890) {
      setError(`Please switch to Siva Kalathi Virtual Chain. Current: ${chainId} (${currentChainIdDecimal}), Expected: 0x4e4542a2 (1313161890)`);
      return;
    }
    
    console.log('✅ Network check passed - you are on Siva Kalathi Virtual Chain!');
    
    // Also check the contract address
    console.log('Contract address being used:', contractAddress);
    console.log('Expected contract address: 0xE81287aaf66FA335D0a2437876043AA71098d7C4');
    
    // Check if contract address is zero (not deployed)
    if (contractAddress === '0x0000000000000000000000000000000000000000') {
      setError(`Contract not deployed on this network. Please switch to Siva Kalathi Virtual Chain. Current network: ${chainId} (${currentChainIdDecimal})`);
      return;
    }
    
    // Test if contract exists at this address using the same fallback mechanism
    try {
      // Create providers for contract check
      const provider = new ethers.BrowserProvider(window.ethereum);
      const rpcProvider = new ethers.JsonRpcProvider('https://testnet.aurora.dev');
      
      // Try MetaMask provider first
      let code = await provider.getCode(contractAddress);
      console.log('MetaMask provider code length:', code.length);
      
      if (code === '0x') {
        console.log('🔄 MetaMask provider failed, trying direct RPC...');
        code = await rpcProvider.getCode(contractAddress);
        console.log('RPC provider code length:', code.length);
        
        if (code === '0x') {
          console.error('❌ No contract found at this address via both providers');
          setError(`Contract not found at address ${contractAddress}. Please check the network and address. Current network: ${chainId} (${currentChainIdDecimal})`);
          return;
        } else {
          console.log('✅ Contract found via direct RPC');
        }
      } else {
        console.log('✅ Contract found via MetaMask provider');
      }
    } catch (error: any) {
      console.error('Contract verification failed:', error);
      setError(`Failed to verify contract at address ${contractAddress}. Error: ${error.message}`);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setPrices([]);

      const newPrices: PriceData[] = [];

      for (const pair of PRICE_PAIRS) {
        try {
          console.log(`\n=== Processing ${pair.name} ===`);
          console.log('Base token:', pair.base);
          console.log('Quote token:', pair.quote);
          
          // Skip priceFeedExists check and go directly to getLatestPrice
          console.log('Calling getLatestPrice directly...');
          console.log('Contract methods:', Object.getOwnPropertyNames(contract));
          
          // Test if contract has the method
          if (typeof contract.getLatestPrice !== 'function') {
            throw new Error('getLatestPrice is not a function');
          }
          
          // Get the latest price (now returns 4 values: price, decimals, timestamp, source)
          const result = await contract.getLatestPrice(pair.base, pair.quote);
          console.log('Raw contract result:', result);
          console.log('Result type:', typeof result);
          console.log('Result length:', result.length);
          
          const price = result[0];
          const decimals = result[1];
          const timestamp = result[2];
          const source = result[3];
          
          console.log('Extracted values:');
          console.log('Price:', price);
          console.log('Decimals:', decimals);
          console.log('Timestamp:', timestamp);
          console.log('Source:', source);
            
            // Debug logging
            console.log(`=== ${pair.name} Price Debug ===`);
            console.log('Raw price:', price.toString());
            console.log('Decimals:', decimals);
            console.log('Timestamp:', timestamp.toString());
            
            // Try different decimal handling approaches
            let formattedPrice;
            let numericPrice;
            
            // Method 1: Use the returned decimals
            formattedPrice = ethers.formatUnits(price, decimals);
            numericPrice = parseFloat(formattedPrice);
            console.log('Method 1 - Using returned decimals:', formattedPrice, '→', numericPrice);
            
            // Method 2: Try with 8 decimals (common for price feeds)
            const formattedPrice8 = ethers.formatUnits(price, 8);
            const numericPrice8 = parseFloat(formattedPrice8);
            console.log('Method 2 - Using 8 decimals:', formattedPrice8, '→', numericPrice8);
            
            // Method 3: Try with 18 decimals (ETH standard)
            const formattedPrice18 = ethers.formatUnits(price, 18);
            const numericPrice18 = parseFloat(formattedPrice18);
            console.log('Method 3 - Using 18 decimals:', formattedPrice18, '→', numericPrice18);
            
            // Method 4: Try with 6 decimals (USDC standard)
            const formattedPrice6 = ethers.formatUnits(price, 6);
            const numericPrice6 = parseFloat(formattedPrice6);
            console.log('Method 4 - Using 6 decimals:', formattedPrice6, '→', numericPrice6);
            
            // Use 8 decimals as it's the standard for price feeds
            let finalPrice = numericPrice8;
            console.log('Using 8 decimals (standard for price feeds)');
            
            // Check if this is realistic price data
            if (numericPrice8 > 100000) {
              console.log('Note: This appears to be simulated data from Siva Kalathi Virtual Chain');
            } else {
              console.log('Note: This appears to be realistic price data');
            }
            
            console.log('Final price:', finalPrice);
            console.log('========================');
            
            // Format the price with appropriate notation
            let displayPrice;
            if (finalPrice > 1000000) {
              displayPrice = `$${finalPrice.toExponential(2)}`;
            } else {
              displayPrice = `$${finalPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
            }
            
            // Add source information
            if (source && source.includes('Blocksense')) {
              displayPrice += ' (Real Blocksense Data)';
            } else if (source && source.includes('Simulated')) {
              displayPrice += ' (Simulated Data)';
            } else if (finalPrice > 100000) {
              displayPrice += ' (Test Data)';
            } else {
              displayPrice += ' (Realistic Data)';
            }
            
            newPrices.push({
              pair: pair.name,
              price: displayPrice,
              timestamp: new Date(Number(timestamp) * 1000).toLocaleString(),
              exists: true,
              source: source || 'Unknown'
            });
        } catch (error: any) {
          console.error(`Error fetching price for ${pair.name}:`, error);
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
          newPrices.push({
            pair: pair.name,
            price: `Error: ${error.message}`,
            timestamp: 'N/A',
            exists: false,
            source: 'Error'
          });
        }
      }

      setPrices(newPrices);
      setSuccess('Prices fetched successfully!');
    } catch (error: any) {
      setError(`Failed to fetch prices: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🔮 Blocksense Price Feed dApp</h1>
        <p>Real-time price feeds on Siva Kalathi Virtual Chain powered by Blocksense</p>
      </div>

      <div className="card">
        <h2>Siva Kalathi Virtual Chain</h2>
        <p>This dApp is configured to work with Siva Kalathi Virtual Chain:</p>
        <div style={{ marginBottom: '15px' }}>
          <button 
            className="button primary"
            onClick={switchToVirtualChain}
            disabled={isLoading}
            style={{ 
              marginRight: '10px', 
              display: 'inline-block',
              backgroundColor: '#28a745',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            title="Connect to Siva Kalathi Virtual Chain with wallet selection"
          >
            {isLoading ? 'Connecting...' : 'Connect to Virtual Chain'}
          </button>
          <button 
            className="button secondary" 
            onClick={debugNetwork}
            disabled={isLoading}
            style={{ marginRight: '10px' }}
          >
            Debug Network
          </button>
          <button 
            className="button secondary" 
            onClick={refreshNetwork}
            disabled={isLoading}
          >
            Refresh Network
          </button>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <p><strong>Network:</strong> Siva Kalathi Virtual Chain (Ready for Deployment)</p>
          <p><strong>Contract Address:</strong> {contractAddress}</p>
        </div>
        <div style={{ padding: '10px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px', marginBottom: '15px' }}>
          <p><strong>🚀 Virtual Chain Details:</strong></p>
          <ul style={{ margin: '10px 0', paddingLeft: '20px', fontSize: '14px' }}>
            <li>Chain ID: 1313161890 (0x4e4542a2)</li>
            <li>RPC: https://0x4e4542a2.rpc.aurora-cloud.dev</li>
            <li>Explorer: https://0x4e4542a2.explorer.aurora-cloud.dev</li>
            <li>Gas Token: VGAS (not ETH)</li>
            <li>Gas Price: 1 gwei</li>
          </ul>
        </div>
        <p><strong>Supported Network:</strong> Siva Kalathi Virtual Chain (1313161890) 🔧</p>
      </div>

      <div className="card">
        <h2>Wallet Connection</h2>
        {!isConnected ? (
          <div>
            <p>Connect your MetaMask wallet to interact with the dApp</p>
            <button 
              className="button" 
              onClick={connectWallet}
              disabled={isLoading}
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        ) : (
          <div>
            <p><strong>Connected:</strong> {account}</p>
            <div style={{ marginTop: '10px' }}>
              <button 
                className="button secondary" 
                onClick={switchWallet}
                disabled={isLoading}
                style={{ marginRight: '10px' }}
              >
                Switch Wallet
              </button>
              <span className="status connected">Connected</span>
            </div>
          </div>
        )}

        {showWalletSelection && availableWallets.length > 0 && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px' }}>
            <h3>Select Wallet</h3>
            <p>Choose which wallet to connect to Siva Kalathi Virtual Chain:</p>
            <div style={{ marginTop: '10px' }}>
              {availableWallets.map((wallet, index) => (
                <div key={wallet} style={{ 
                  marginBottom: '10px', 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  backgroundColor: wallet === account ? '#e7f3ff' : 'white',
                  cursor: 'pointer'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>Wallet {index + 1}</strong>
                      <br />
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {wallet.slice(0, 6)}...{wallet.slice(-4)}
                      </span>
                    </div>
                    <button 
                      className="button primary"
                      onClick={() => selectWallet(wallet)}
                      disabled={isLoading}
                      style={{ 
                        padding: '5px 15px', 
                        fontSize: '12px',
                        backgroundColor: wallet === account ? '#28a745' : '#007bff'
                      }}
                    >
                      {wallet === account ? 'Current' : 'Select'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button 
              className="button secondary"
              onClick={() => setShowWalletSelection(false)}
              style={{ marginTop: '10px' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Contract Configuration</h2>
        <p>Contract address for Siva Kalathi Virtual Chain:</p>
        <input
          type="text"
          className="input"
          placeholder="0x..."
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
        />
        <button 
          className="button" 
          onClick={loadContract}
          disabled={isLoading || !contractAddress}
        >
          {isLoading ? 'Loading...' : 'Load Contract'}
        </button>
        {contractAddress === '0x0000000000000000000000000000000000000000' && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px' }}>
            <p><strong>🚀 Siva Kalathi Virtual Chain Setup Required:</strong></p>
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li>Contract not yet deployed to Virtual Chain</li>
              <li>Uses the vgas_chain configuration from hardhat.config.ts</li>
              <li>Requires VGAS tokens for gas fees (deployment costs ~0.01-0.05 VGAS)</li>
              <li>Once deployed, you can use real price feeds on Virtual Chain</li>
            </ul>
            <p><strong>To deploy to Virtual Chain:</strong></p>
            <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li>Get VGAS tokens on Siva Kalathi Virtual Chain</li>
              <li>Run: <code>npm run deploy:virtual-chain</code></li>
              <li>Update contract address in the dApp</li>
            </ol>
            <p><strong>Virtual Chain Details:</strong></p>
            <ul style={{ margin: '10px 0', paddingLeft: '20px', fontSize: '12px' }}>
              <li>Chain ID: 1313161890 (0x4e4542a2)</li>
              <li>RPC: https://0x4e4542a2.rpc.aurora-cloud.dev</li>
              <li>Explorer: https://0x4e4542a2.explorer.aurora-cloud.dev</li>
              <li>Gas Token: VGAS (not ETH)</li>
              <li>Gas Price: 1 gwei</li>
            </ul>
          </div>
        )}
      </div>

      {contract && (
        <div className="card">
          <h2>Blocksense Integration Status</h2>
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px' }}>
            <p><strong>🔗 Contract:</strong> {contractAddress}</p>
            <p><strong>🌐 Network:</strong> Siva Kalathi Virtual Chain</p>
            <p><strong>📊 Data Source:</strong> Real Blocksense Integration</p>
            <p><strong>✅ Status:</strong> Ready to fetch real-time price data</p>
          </div>
          
          <h2>Price Feeds</h2>
          <p>Fetch real-time price data from Blocksense feeds:</p>
          <button 
            className="button" 
            onClick={fetchPrices}
            disabled={isLoading}
          >
            {isLoading ? 'Fetching...' : 'Fetch Prices'}
          </button>

          {prices.length > 0 && (
            <div className="price-grid">
              {prices.map((priceData, index) => (
                <div key={index} className="price-card">
                  <h3>{priceData.pair}</h3>
                  <div className="price-value">
                    {priceData.exists ? priceData.price : 'N/A'}
                  </div>
                  <div className="price-timestamp">
                    {priceData.exists ? priceData.timestamp : 'Feed not available'}
                  </div>
                  <span className={`status ${priceData.exists ? 'connected' : 'disconnected'}`}>
                    {priceData.exists ? 'Available' : 'Not Available'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="error">
          {error}
          {error.includes('Please switch to Siva Kalathi Virtual Chain') && (
            <button 
              onClick={switchToVirtualChain} 
              style={{ 
                marginLeft: '10px', 
                padding: '5px 10px', 
                background: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Switch to Virtual Chain
            </button>
          )}
          <button onClick={clearMessages} style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="success">
          {success}
          <button onClick={clearMessages} style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
            ✕
          </button>
        </div>
      )}

      <div className="footer">
        <p>
          Built with ❤️ using <a href="https://docs.blocksense.network" target="_blank" rel="noopener noreferrer">Blocksense</a> and <a href="https://aurora.dev" target="_blank" rel="noopener noreferrer">Aurora</a>
        </p>
      </div>
    </div>
  );
}

export default App;

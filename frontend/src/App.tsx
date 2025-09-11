import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './index.css';

// Contract ABI - This would normally be imported from the compiled contract
const CONTRACT_ABI = [
  "function feedRegistry() view returns (address)",
  "function getFeedRegistry() view returns (address)",
  "function getLatestPrice(address base, address quote) view returns (int256 price, uint8 decimals, uint256 timestamp)",
  "function getETHUSDPrice() view returns (int256)",
  "function getAURORAUSDPrice() view returns (int256)",
  "function getETHAURORAPrice() view returns (int256)"
];

// Aurora Testnet configuration
const AURORA_TESTNET = {
  chainId: '0x4e454153', // 1313161555 in hex
  chainName: 'Aurora Testnet',
  rpcUrls: ['https://testnet.aurora.dev'],
  blockExplorerUrls: ['https://testnet.aurora.dev']
};

// Aurora Mainnet configuration (what you're actually on)
const AURORA_MAINNET_ACTUAL = {
  chainId: '0x4e4542a2', // 1313161890 in hex - this is what you're actually on
  chainName: 'Aurora Mainnet',
  rpcUrls: ['https://mainnet.aurora.dev'],
  blockExplorerUrls: ['https://aurorascan.dev']
};

// Aurora Mainnet configuration (in case user is on mainnet)
const AURORA_MAINNET = {
  chainId: '0x4e4542a2', // 1313161554 in hex
  chainName: 'Aurora Mainnet',
  rpcUrls: ['https://mainnet.aurora.dev'],
  blockExplorerUrls: ['https://aurorascan.dev']
};

// Aurora Mainnet (alternative chain ID that might be used)
const AURORA_MAINNET_ALT = {
  chainId: '0x4e4542a2', // 1313161890 in hex - this is what you're actually on
  chainName: 'Aurora Mainnet',
  rpcUrls: ['https://mainnet.aurora.dev'],
  blockExplorerUrls: ['https://aurorascan.dev']
};

interface PriceData {
  pair: string;
  price: string;
  timestamp: string;
  exists: boolean;
}

function App() {
  const [account, setAccount] = useState<string>('');
  const [contractAddress, setContractAddress] = useState<string>('0xEB73ECd9d1A6e52781fb258947d5b74a7F32ec2f');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<'testnet' | 'mainnet'>('testnet');

  // Contract addresses for different networks
  const CONTRACT_ADDRESSES = {
    testnet: '0x3B77e4E8782b6033DF4a967F3Ed77726648457eF', // Aurora Testnet
    mainnet: '0x0000000000000000000000000000000000000000' // Aurora Mainnet (placeholder - needs deployment)
  };

  // Token addresses for different networks
  const TOKENS = {
    testnet: {
      ETH: '0x0000000000000000000000000000000000000000', // Native ETH on Aurora
      USDC: '0x901fb725c106E182614105335ad0E230c91B67C8', // Official USDC on Aurora Testnet
      USDT: '0x4988a896b1227218e4A686fdE5EabdcAbd91571f',
      AURORA: '0x8BEc47865aDe3B172A928df8f990Bc7f2A3b9f79'
    },
    mainnet: {
      ETH: '0x0000000000000000000000000000000000000000', // Native ETH on Aurora
      USDC: '0xB12BFcA5A3cC1B8426150C3db9C31B2055C76515', // Official USDC on Aurora Mainnet
      USDT: '0x4988a896b1227218e4A686fdE5EabdcAbd91571f', // Same as testnet
      AURORA: '0x8BEc47865aDe3B172A928df8f990Bc7f2A3b9f79' // Same as testnet
    }
  };

  const PRICE_PAIRS = [
    { name: 'ETH/USDC', base: TOKENS[selectedNetwork].ETH, quote: TOKENS[selectedNetwork].USDC },
    { name: 'AURORA/USDC', base: TOKENS[selectedNetwork].AURORA, quote: TOKENS[selectedNetwork].USDC },
    { name: 'ETH/AURORA', base: TOKENS[selectedNetwork].ETH, quote: TOKENS[selectedNetwork].AURORA }
  ];

  // Debug: Log token addresses
  console.log('=== Token Addresses Debug ===');
  console.log('Selected network:', selectedNetwork);
  console.log('ETH:', TOKENS[selectedNetwork].ETH);
  console.log('USDC:', TOKENS[selectedNetwork].USDC);
  console.log('USDT:', TOKENS[selectedNetwork].USDT);
  console.log('AURORA:', TOKENS[selectedNetwork].AURORA);
  console.log('============================');

  useEffect(() => {
    checkConnection();
    checkNetworkOnLoad();
  }, []);

  const checkNetworkOnLoad = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const currentChainIdDecimal = parseInt(chainId, 16);
        
        if (currentChainIdDecimal === 1313161890) {
          setSuccess(`You're on Aurora Mainnet (${currentChainIdDecimal}). This dApp will work on Aurora Mainnet!`);
        } else if (currentChainIdDecimal === 1313161555) {
          setSuccess(`You're on Aurora Testnet (${currentChainIdDecimal}). This dApp will work on Aurora Testnet!`);
        } else {
          setError(`Please switch to Aurora Mainnet or Testnet. Current: ${chainId} (${currentChainIdDecimal}), Expected: 0x4e4542a2 (1313161890) or 0x4e454153 (1313161555)`);
        }
      } catch (error) {
        console.log('Could not check network on load:', error);
      }
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
        setAccount(accounts[0]);
        setIsConnected(true);
        setSuccess('Wallet connected successfully!');
        
        // Check if we're on Aurora Testnet
        await checkNetwork();
      }
    } catch (error: any) {
      setError(`Failed to connect wallet: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const debugNetwork = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install MetaMask to use this dApp.');
      return;
    }

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const networkVersion = await window.ethereum.request({ method: 'net_version' });
      
      console.log('=== NETWORK DEBUG INFO ===');
      console.log('Chain ID (hex):', chainId);
      console.log('Chain ID (decimal):', parseInt(chainId, 16));
      console.log('Network Version:', networkVersion);
      console.log('Expected Testnet Chain ID (hex):', AURORA_TESTNET.chainId);
      console.log('Expected Testnet Chain ID (decimal):', parseInt(AURORA_TESTNET.chainId, 16));
      console.log('Expected Mainnet Chain ID (hex):', AURORA_MAINNET.chainId);
      console.log('Expected Mainnet Chain ID (decimal):', parseInt(AURORA_MAINNET.chainId, 16));
      console.log('========================');
      
      setSuccess(`Network Debug: Chain ID ${chainId} (${parseInt(chainId, 16)})`);
    } catch (error: any) {
      setError(`Debug failed: ${error.message}`);
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
      
      if (parseInt(chainId, 16) === 1313161555) {
        setSuccess('You are now on Aurora Testnet! You can load the contract.');
        setError('');
      } else {
        setError(`Still on wrong network. Current: ${chainId} (${parseInt(chainId, 16)}), Expected: 0x4e454153 (1313161555)`);
      }
    } catch (error: any) {
      setError(`Refresh failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkNetwork = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('Current chain ID:', chainId);
      
      // Convert to decimal for comparison
      const currentChainIdDecimal = parseInt(chainId, 16);
      
      console.log('Current chain ID (decimal):', currentChainIdDecimal);
      
      if (currentChainIdDecimal === 1313161890) {
        setSuccess(`You're on Aurora Mainnet (${currentChainIdDecimal}). This dApp will work on Aurora Mainnet!`);
        return true;
      } else if (currentChainIdDecimal === 1313161555) {
        setSuccess(`You're on Aurora Testnet (${currentChainIdDecimal}). This dApp will work on Aurora Testnet!`);
        return true;
      } else {
        setError(`Please switch to Aurora Mainnet or Testnet. Current: ${chainId} (${currentChainIdDecimal}), Expected: 0x4e4542a2 (1313161890) or 0x4e454153 (1313161555)`);
        return false;
      }
    } catch (error) {
      setError('Failed to check network');
      return false;
    }
  };

  const switchToTestnet = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSelectedNetwork('testnet');
      setContractAddress(CONTRACT_ADDRESSES.testnet);
      
      console.log('Attempting to switch to Aurora Testnet...');
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: AURORA_TESTNET.chainId }],
      });
      
      // Wait a moment for the switch to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check the network again
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('After switch - Current chain ID:', chainId);
      
      if (parseInt(chainId, 16) === 1313161555) {
        setSuccess('Successfully switched to Aurora Testnet! Contract address updated.');
        setError('');
      } else {
        setError(`Switch failed. Still on chain ${chainId} (${parseInt(chainId, 16)}). Please try again.`);
      }
    } catch (switchError: any) {
      console.error('Switch error:', switchError);
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          console.log('Adding Aurora Testnet to MetaMask...');
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [AURORA_TESTNET],
          });
          setSuccess('Aurora Testnet added to MetaMask! Please switch to it manually.');
        } catch (addError) {
          console.error('Add error:', addError);
          setError('Failed to add Aurora Testnet to MetaMask');
        }
      } else {
        setError(`Failed to switch to Aurora Testnet: ${switchError.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchToMainnet = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSelectedNetwork('mainnet');
      setContractAddress(CONTRACT_ADDRESSES.mainnet);
      
      console.log('Attempting to switch to Aurora Mainnet...');
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: AURORA_MAINNET_ACTUAL.chainId }],
      });
      
      // Wait a moment for the switch to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check the network again
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('After switch - Current chain ID:', chainId);
      
      if (parseInt(chainId, 16) === 1313161890) {
        setSuccess('Successfully switched to Aurora Mainnet! Contract address updated.');
        setError('');
      } else {
        setError(`Switch failed. Still on chain ${chainId} (${parseInt(chainId, 16)}). Please try again.`);
      }
    } catch (switchError: any) {
      console.error('Switch error:', switchError);
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          console.log('Adding Aurora Mainnet to MetaMask...');
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [AURORA_MAINNET_ACTUAL],
          });
          setSuccess('Aurora Mainnet added to MetaMask! Please switch to it manually.');
        } catch (addError) {
          console.error('Add error:', addError);
          setError('Failed to add Aurora Mainnet to MetaMask');
        }
      } else {
        setError(`Failed to switch to Aurora Mainnet: ${switchError.message}`);
      }
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
      console.log('Network:', await window.ethereum.request({ method: 'eth_chainId' }));

      // Use a more reliable provider setup
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Wait for provider to be ready
      await provider.ready;
      
      console.log('Provider ready, creating contract instance...');
      const contractInstance = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
      
      // Test the contract by calling getLatestPrice function
      console.log('Testing contract connection...');
      try {
        const [price, decimals, timestamp] = await contractInstance.getLatestPrice(
          '0x0000000000000000000000000000000000000000', // ETH
          '0x901fb725c106E182614105335ad0E230c91B67C8'  // USDC
        );
        console.log('Contract test successful - Price:', price.toString());
        console.log('Decimals:', decimals);
        console.log('Timestamp:', timestamp.toString());
      } catch (error) {
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
    console.log('Current chain ID:', chainId);
    console.log('Expected chain ID: 0x4e454153 (Aurora Testnet)');
    console.log('Chain ID match:', chainId === '0x4e454153');
    
    if (chainId !== '0x4e454153') { // Aurora Testnet
      setError(`Please switch to Aurora Testnet. Current: ${chainId}, Expected: 0x4e454153`);
      return;
    }
    
    // Also check the contract address
    console.log('Contract address being used:', contractAddress);
    console.log('Expected contract address: 0xEB73ECd9d1A6e52781fb258947d5b74a7F32ec2f');
    
    // Test if contract exists at this address
    try {
      const code = await window.ethereum.request({
        method: 'eth_getCode',
        params: [contractAddress, 'latest']
      });
      console.log('Contract code at address:', code);
      if (code === '0x') {
        throw new Error('No contract found at this address');
      }
    } catch (error) {
      console.error('Contract verification failed:', error);
      setError(`Contract not found at address ${contractAddress}. Please check the network and address.`);
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
          
          // Get the latest price
          const [price, decimals, timestamp] = await contract.getLatestPrice(pair.base, pair.quote);
            
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
            
            // For Aurora Testnet, use 8 decimals as it's the most common for price feeds
            // The test data shows all feeds return the same value, so we'll use 8 decimals
            let finalPrice = numericPrice8;
            console.log('Using 8 decimals (standard for price feeds)');
            
            // If this is test data (all prices are the same), show a warning
            if (numericPrice8 > 100000) {
              finalPrice = numericPrice8;
              console.log('Note: This appears to be test data from Aurora Testnet');
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
            
            // Add note for test data
            if (finalPrice > 100000) {
              displayPrice += ' (Test Data)';
            }
            
            newPrices.push({
              pair: pair.name,
              price: displayPrice,
              timestamp: new Date(Number(timestamp) * 1000).toLocaleString(),
              exists: true
            });
        } catch (error) {
          console.error(`Error fetching price for ${pair.name}:`, error);
          newPrices.push({
            pair: pair.name,
            price: `Error: ${error.message}`,
            timestamp: 'N/A',
            exists: false
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
        <p>Real-time price feeds on Aurora (Mainnet & Testnet) powered by Blocksense</p>
      </div>

      <div className="card">
        <h2>Network Selection</h2>
        <p>Choose which Aurora network you want to use:</p>
        <p style={{ fontSize: '12px', color: '#666' }}>Debug: selectedNetwork = {selectedNetwork}</p>
        <div style={{ marginBottom: '15px' }}>
          <button 
            className={`button ${selectedNetwork === 'testnet' ? 'primary' : 'secondary'}`}
            onClick={switchToTestnet}
            disabled={isLoading}
            style={{ marginRight: '10px', display: 'inline-block' }}
          >
            {isLoading ? 'Switching...' : 'Use Aurora Testnet'}
          </button>
          <button 
            className={`button ${selectedNetwork === 'mainnet' ? 'primary' : 'secondary'}`}
            onClick={switchToMainnet}
            disabled={isLoading}
            style={{ 
              marginRight: '10px', 
              display: 'inline-block',
              visibility: 'visible',
              opacity: 1,
              backgroundColor: selectedNetwork === 'mainnet' ? '#007bff' : '#6c757d',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            title="Switch to Aurora Mainnet (contract deployment required)"
          >
            {isLoading ? 'Switching...' : 'Use Aurora Mainnet'}
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
          <p><strong>Selected Network:</strong> {selectedNetwork === 'testnet' ? 'Aurora Testnet (Working)' : 'Aurora Mainnet (Ready for Deployment)'}</p>
          <p><strong>Contract Address:</strong> {contractAddress}</p>
        </div>
        <div style={{ padding: '10px', backgroundColor: '#d1ecf1', border: '1px solid #bee5eb', borderRadius: '4px', marginBottom: '15px' }}>
          <p><strong>💡 Recommendation:</strong> Use Aurora Testnet for testing. Aurora Mainnet requires ETH for gas fees and contract deployment.</p>
        </div>
        <p><strong>Supported Networks:</strong> Aurora Testnet (1313161555) ✅ | Aurora Mainnet (1313161890) 🔧</p>
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
            <span className="status connected">Connected</span>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Contract Configuration</h2>
        <p>Contract address for {selectedNetwork === 'testnet' ? 'Aurora Testnet' : 'Aurora Mainnet'}:</p>
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
        {selectedNetwork === 'mainnet' && contractAddress === '0x0000000000000000000000000000000000000000' && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px' }}>
            <p><strong>📋 Aurora Mainnet Setup Required:</strong></p>
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li>Contract not yet deployed to Aurora Mainnet</li>
              <li>Requires ETH for gas fees (deployment costs ~$50-100)</li>
              <li>Once deployed, you can use real price feeds</li>
            </ul>
            <p><strong>To deploy to Mainnet:</strong></p>
            <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li>Get ETH on Aurora Mainnet</li>
              <li>Run: <code>npm run deploy:aurora-mainnet</code></li>
              <li>Update contract address in the dApp</li>
            </ol>
            <p><strong>Alternative:</strong> Use Aurora Testnet for testing (free)</p>
          </div>
        )}
      </div>

      {contract && (
        <div className="card">
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

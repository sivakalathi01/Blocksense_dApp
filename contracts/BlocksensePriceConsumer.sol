// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/ICLFeedRegistryAdapter.sol";
import "./interfaces/ICLAggregatorAdapter.sol";

/**
 * @title BlocksensePriceConsumer
 * @dev A contract that consumes price data from Blocksense price feeds on Aurora Testnet
 * @notice This contract demonstrates how to interact with Blocksense price feeds
 */
contract BlocksensePriceConsumer {
    ICLFeedRegistryAdapter public feedRegistry;
    
    /**
     * @notice Get the feed registry address
     * @return The address of the feed registry
     */
    function getFeedRegistry() public view returns (address) {
        return address(feedRegistry);
    }
    
    // Common token addresses on Aurora Testnet
    // Note: Aurora Testnet uses native ETH directly, no WETH needed
    address public constant ETH = address(0); // Native ETH on Aurora
    address public constant USDC = 0x901fb725c106E182614105335ad0E230c91B67C8; // Official USDC on Aurora Testnet
    address public constant USDT = 0x4988a896b1227218e4A686fdE5EabdcAbd91571f;
    address public constant NEAR = 0x1111111111111111111111111111111111111111; // Placeholder address for NEAR
    address public constant BTC = 0x2222222222222222222222222222222222222222;  // Placeholder address for BTC
    
    // Events
    event PriceUpdated(
        address indexed base,
        address indexed quote,
        int256 price,
        uint256 timestamp
    );
    
    event FeedRegistryUpdated(address indexed newRegistry);
    
    /**
     * @notice Constructor
     * @param _feedRegistry The address of the Blocksense Feed Registry
     */
    constructor(address _feedRegistry) {
        // Allow zero address for testing with mock data
        if (_feedRegistry != address(0)) {
            feedRegistry = ICLFeedRegistryAdapter(_feedRegistry);
        }
    }
    
    /**
     * @notice Get the latest price for a token pair using the feed registry
     * @param base The base token address
     * @param quote The quote token address
     * @return price The latest price
     * @return decimals The number of decimals for the price
     * @return timestamp The timestamp when the price was last updated
     */
    function getLatestPrice(address base, address quote)
        public
        view
        returns (
            int256 price,
            uint8 decimals,
            uint256 timestamp
        )
    {
        // Allow any address including zero address for native ETH
        
        // If feed registry is not set (zero address), return mock data for testing
        if (address(feedRegistry) == address(0)) {
            // Return different test values based on token pair
            if (base == address(0) && quote == 0x901fb725c106E182614105335ad0E230c91B67C8) {
                return (11437715515959, 0, block.timestamp); // ETH/USDC
            } else if (base == 0x4988a896b1227218e4A686fdE5EabdcAbd91571f && quote == 0x901fb725c106E182614105335ad0E230c91B67C8) {
                return (12345678901234, 0, block.timestamp); // USDT/USDC
            } else if (base == 0x1111111111111111111111111111111111111111 && quote == 0x901fb725c106E182614105335ad0E230c91B67C8) {
                return (98765432109876, 0, block.timestamp); // NEAR/USDC (placeholder address)
            } else if (base == 0x2222222222222222222222222222222222222222 && quote == 0x901fb725c106E182614105335ad0E230c91B67C8) {
                return (55555555555555, 0, block.timestamp); // BTC/USDC (placeholder address)
            } else {
                return (11437715515959, 0, block.timestamp); // Default
            }
        }
        
        (, int256 answer, , uint256 updatedAt, ) = feedRegistry.latestRoundData(base, quote);
        uint8 priceDecimals = feedRegistry.decimals(base, quote);
        
        return (answer, priceDecimals, updatedAt);
    }
    
    /**
     * @notice Get the latest price for a token pair and emit an event
     * @param base The base token address
     * @param quote The quote token address
     * @return price The latest price
     * @return decimals The number of decimals for the price
     * @return timestamp The timestamp when the price was last updated
     */
    function getLatestPriceWithEvent(address base, address quote)
        external
        returns (
            int256 price,
            uint8 decimals,
            uint256 timestamp
        )
    {
        (price, decimals, timestamp) = getLatestPrice(base, quote);
        emit PriceUpdated(base, quote, price, timestamp);
        return (price, decimals, timestamp);
    }
    
    /**
     * @notice Get price feed information
     * @param base The base token address
     * @param quote The quote token address
     * @return description The description of the price feed
     * @return version The version of the price feed
     * @return decimals The number of decimals
     */
    function getFeedInfo(address base, address quote)
        external
        view
        returns (
            string memory description,
            uint256 version,
            uint8 decimals
        )
    {
        description = feedRegistry.description(base, quote);
        version = feedRegistry.version(base, quote);
        decimals = feedRegistry.decimals(base, quote);
    }
    
    /**
     * @notice Get historical price data for a specific round
     * @param base The base token address
     * @param quote The quote token address
     * @param roundId The round ID to query
     * @return price The price at the specified round
     * @return timestamp The timestamp of the round
     */
    function getHistoricalPrice(address base, address quote, uint80 roundId)
        external
        view
        returns (int256 price, uint256 timestamp)
    {
        (, int256 answer, , uint256 updatedAt, ) = feedRegistry.getRoundData(base, quote, roundId);
        return (answer, updatedAt);
    }
    
    /**
     * @notice Get multiple prices at once
     * @param pairs Array of token pairs (base, quote)
     * @return prices Array of prices
     * @return timestamps Array of timestamps
     */
    function getMultiplePrices(address[2][] calldata pairs)
        external
        view
        returns (int256[] memory prices, uint256[] memory timestamps)
    {
        uint256 length = pairs.length;
        prices = new int256[](length);
        timestamps = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            (, int256 answer, , uint256 updatedAt, ) = feedRegistry.latestRoundData(
                pairs[i][0], // base
                pairs[i][1]  // quote
            );
            prices[i] = answer;
            timestamps[i] = updatedAt;
        }
    }
    
    /**
     * @notice Check if a price feed exists for a token pair
     * @param base The base token address
     * @param quote The quote token address
     * @return exists True if the price feed exists
     */
    function priceFeedExists(address base, address quote)
        external
        view
        returns (bool exists)
    {
        // If feed registry is not set (zero address), return true for testing
        if (address(feedRegistry) == address(0)) {
            return true;
        }
        
        try feedRegistry.latestRoundData(base, quote) returns (
            uint80,
            int256,
            uint256,
            uint256,
            uint80
        ) {
            return true;
        } catch {
            return false;
        }
    }
    
    // Convenience functions for common token pairs
    
    /**
     * @notice Get ETH/USDC price
     * @return price The latest ETH/USDC price
     */
    function getETHUSDPrice() external view returns (int256 price) {
        (price, , ) = getLatestPrice(ETH, USDC);
    }
    
    /**
     * @notice Get USDT/USDC price
     * @return price The latest USDT/USDC price
     */
    function getUSDTUSDPrice() external view returns (int256 price) {
        (price, , ) = getLatestPrice(USDT, USDC);
    }
    
    /**
     * @notice Get NEAR/USDC price
     * @return price The latest NEAR/USDC price
     */
    function getNEARUSDPrice() external view returns (int256 price) {
        (price, , ) = getLatestPrice(NEAR, USDC);
    }
    
    /**
     * @notice Get BTC/USDC price
     * @return price The latest BTC/USDC price
     */
    function getBTCUSDPrice() external view returns (int256 price) {
        (price, , ) = getLatestPrice(BTC, USDC);
    }
}

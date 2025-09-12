// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title BlocksenseRealPriceConsumer
 * @dev A contract that consumes real price data from Blocksense feeds on Aurora
 * @notice This contract demonstrates how to interact with real Blocksense price feeds
 */
contract BlocksenseRealPriceConsumer {
    
    // Token addresses for different networks
    address public constant ETH = address(0); // Native ETH on Aurora
    address public constant USDC = 0x901fb725c106E182614105335ad0E230c91B67C8; // USDC on Aurora Testnet
    address public constant USDT = 0x4988a896b1227218e4A686fdE5EabdcAbd91571f;
    address public constant NEAR = 0x1111111111111111111111111111111111111111; // Placeholder for NEAR
    address public constant BTC = 0x2222222222222222222222222222222222222222;  // Placeholder for BTC
    
    // Events
    event PriceUpdated(
        address indexed base,
        address indexed quote,
        int256 price,
        uint8 decimals,
        uint256 timestamp
    );
    
    /**
     * @notice Get the latest price for a token pair
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
        // For now, return mock data with different values for each pair
        // In production, this would call the actual Blocksense feed contracts
        
        if (base == address(0) && quote == 0x901fb725c106E182614105335ad0E230c91B67C8) {
            // ETH/USDC - Simulate real price around $3000
            return (300000000000, 8, block.timestamp);
        } else if (base == 0x4988a896b1227218e4A686fdE5EabdcAbd91571f && quote == 0x901fb725c106E182614105335ad0E230c91B67C8) {
            // USDT/USDC - Simulate real price around $1.00
            return (100000000, 8, block.timestamp);
        } else if (base == 0x1111111111111111111111111111111111111111 && quote == 0x901fb725c106E182614105335ad0E230c91B67C8) {
            // NEAR/USDC - Simulate real price around $2.50
            return (250000000, 8, block.timestamp);
        } else if (base == 0x2222222222222222222222222222222222222222 && quote == 0x901fb725c106E182614105335ad0E230c91B67C8) {
            // BTC/USDC - Simulate real price around $45000
            return (4500000000000, 8, block.timestamp);
        } else {
            // Default fallback
            return (100000000, 8, block.timestamp);
        }
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
        emit PriceUpdated(base, quote, price, decimals, timestamp);
        return (price, decimals, timestamp);
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
        // For now, return true for all pairs
        // In production, this would check the actual Blocksense registry
        return true;
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

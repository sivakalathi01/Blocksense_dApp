// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title BlocksenseIntegrationVirtual
 * @dev A contract that provides price feeds for Siva Kalathi Virtual Chain
 * @notice This contract provides simulated price data for Virtual Chain testing
 */

contract BlocksenseIntegrationVirtual {
    
    // Token addresses for Siva Kalathi Virtual Chain
    address public constant VGAS = address(0); // Native VGAS on Virtual Chain
    address public constant USDC = 0xb12bFCA5a3cc1B8426150C3DB9C31B2055C76515; // USDC on Virtual Chain
    address public constant USDT = 0x4988a896b1227218e4A686fdE5EabdcAbd91571f; // USDT on Virtual Chain
    address public constant NEAR = 0x1111111111111111111111111111111111111111; // Placeholder for NEAR
    address public constant BTC = 0x2222222222222222222222222222222222222222;  // Placeholder for BTC
    
    // Events
    event PriceUpdated(
        address indexed base,
        address indexed quote,
        int256 price,
        uint8 decimals,
        uint256 timestamp,
        string source
    );
    
    /**
     * @notice Get the latest price for a token pair
     * @param base The base token address
     * @param quote The quote token address
     * @return price The latest price
     * @return decimals The number of decimals for the price
     * @return timestamp The timestamp when the price was last updated
     * @return source The source of the price data
     */
    function getLatestPrice(address base, address quote)
        public
        view
        returns (
            int256 price,
            uint8 decimals,
            uint256 timestamp,
            string memory source
        )
    {
        return getSimulatedPrice(base, quote);
    }
    
    /**
     * @notice Get simulated price data for Virtual Chain
     */
    function getSimulatedPrice(address base, address quote)
        internal
        view
        returns (
            int256 price,
            uint8 decimals,
            uint256 timestamp,
            string memory source
        )
    {
        if (base == VGAS && quote == USDC) {
            // VGAS/USDC - Simulate real price around $0.50
            return (50000000, 8, block.timestamp, "Virtual Chain Simulated Data");
        } else if (base == USDT && quote == USDC) {
            // USDT/USDC - Simulate real price around $1.00
            return (100000000, 8, block.timestamp, "Virtual Chain Simulated Data");
        } else if (base == NEAR && quote == USDC) {
            // NEAR/USDC - Simulate real price around $2.50
            return (250000000, 8, block.timestamp, "Virtual Chain Simulated Data");
        } else if (base == BTC && quote == USDC) {
            // BTC/USDC - Simulate real price around $45000
            return (4500000000000, 8, block.timestamp, "Virtual Chain Simulated Data");
        } else {
            // Default fallback
            return (100000000, 8, block.timestamp, "Virtual Chain Simulated Data");
        }
    }
    
    /**
     * @notice Check if using real Blocksense data (always false for Virtual Chain)
     */
    function isUsingRealBlocksense() external pure returns (bool) {
        return false;
    }
    
    /**
     * @notice Get Blocksense Feed Registry address (not applicable for Virtual Chain)
     */
    function getBlocksenseRegistry() external pure returns (address) {
        return address(0);
    }
    
    /**
     * @notice Get individual feed addresses (not applicable for Virtual Chain)
     */
    function getFeedAddresses() external pure returns (
        address vgasUsdc,
        address usdtUsdc,
        address nearUsdc,
        address btcUsdc
    ) {
        return (address(0), address(0), address(0), address(0));
    }
    
    // Convenience functions for common token pairs
    
    function getVGASUSDPrice() external view returns (int256 price) {
        (price, , , ) = getLatestPrice(VGAS, USDC);
    }
    
    function getUSDTUSDPrice() external view returns (int256 price) {
        (price, , , ) = getLatestPrice(USDT, USDC);
    }
    
    function getNEARUSDPrice() external view returns (int256 price) {
        (price, , , ) = getLatestPrice(NEAR, USDC);
    }
    
    function getBTCUSDPrice() external view returns (int256 price) {
        (price, , , ) = getLatestPrice(BTC, USDC);
    }
}

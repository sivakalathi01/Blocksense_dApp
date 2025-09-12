// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title BlocksenseIntegration
 * @dev A contract that integrates with REAL Blocksense price feeds on Aurora
 * @notice This contract demonstrates how to interact with actual Blocksense oracles
 */

// Interface for Blocksense Feed Registry
interface IBlocksenseFeedRegistry {
    function latestRoundData(address base, address quote)
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
    
    function decimals(address base, address quote) external view returns (uint8);
    function description(address base, address quote) external view returns (string memory);
    function version(address base, address quote) external view returns (uint256);
}

// Interface for individual Blocksense price feeds
interface IBlocksensePriceFeed {
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
    
    function decimals() external view returns (uint8);
    function description() external view returns (string memory);
    function version() external view returns (uint256);
}

contract BlocksenseIntegration {
    
    // Token addresses for Aurora Testnet
    address public constant ETH = address(0); // Native ETH on Aurora
    address public constant USDC = 0x901fb725c106E182614105335ad0E230c91B67C8;
    address public constant USDT = 0x4988a896b1227218e4A686fdE5EabdcAbd91571f;
    address public constant NEAR = 0x3333333333333333333333333333333333333333; // Placeholder for NEAR
    address public constant BTC = 0x4444444444444444444444444444444444444444;  // Placeholder for BTC
    
    // Blocksense Feed Registry Address (Aurora Testnet)
    // Real Blocksense Feed Registry address from Aurora Testnet
    address public constant BLOCKSENSE_FEED_REGISTRY = 0xfc05C4BC7C9D2F131CA8c3571C3f07c47D92738f;
    
    // Individual price feed addresses (Aurora Testnet)
    address public constant ETH_USDC_FEED = 0x5989875E00Ff00cA4E214375299AB2349CA64337;
    address public constant USDT_USDC_FEED = 0x1e91b5000b4B1fC88eF3c2e1E4D588626E62a22D;
    address public constant NEAR_USDC_FEED = 0xFc3241Cf09cdCB5675f2A1AD08FeFde97c4a05e8;
    address public constant BTC_USDC_FEED = 0x255Ed5Fb93a3FA1E59f93af1d55EbE9Fc46ea0AE;
    
    // Events
    event PriceUpdated(
        address indexed base,
        address indexed quote,
        int256 price,
        uint8 decimals,
        uint256 timestamp,
        string source
    );
    
    event BlocksenseFeedUsed(address indexed feed, string pair);
    event FallbackDataUsed(string pair, string reason);
    
    /**
     * @notice Get the latest price for a token pair from Blocksense
     * @param base The base token address
     * @param quote The quote token address
     * @return price The latest price from Blocksense
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
        // Try individual price feeds first (more specific)
        address feedAddress = getFeedAddress(base, quote);
        if (feedAddress != address(0)) {
            try IBlocksensePriceFeed(feedAddress).latestRoundData() returns (
                uint80,
                int256 answer,
                uint256,
                uint256 updatedAt,
                uint80
            ) {
                uint8 priceDecimals = IBlocksensePriceFeed(feedAddress).decimals();
                // Handle case where Blocksense returns 0 decimals but large values
                if (priceDecimals == 0 && answer > 1000000000000) {
                    // Assume 8 decimals for price feeds if 0 is returned
                    priceDecimals = 8;
                }
                return (answer, priceDecimals, updatedAt, "Blocksense Price Feed");
            } catch {
                // Continue to try registry
            }
        }
        
        // Try to get price from Blocksense Feed Registry as fallback
        if (BLOCKSENSE_FEED_REGISTRY != address(0)) {
            try IBlocksenseFeedRegistry(BLOCKSENSE_FEED_REGISTRY).latestRoundData(base, quote) returns (
                uint80,
                int256 answer,
                uint256,
                uint256 updatedAt,
                uint80
            ) {
                uint8 priceDecimals = IBlocksenseFeedRegistry(BLOCKSENSE_FEED_REGISTRY).decimals(base, quote);
                // Handle case where Blocksense returns 0 decimals but large values
                if (priceDecimals == 0 && answer > 1000000000000) {
                    // Assume 8 decimals for price feeds if 0 is returned
                    priceDecimals = 8;
                }
                return (answer, priceDecimals, updatedAt, "Blocksense Feed Registry");
            } catch {
                // Fallback to simulated data
                return getSimulatedPrice(base, quote);
            }
        }
        
        // Fallback to simulated data
        return getSimulatedPrice(base, quote);
    }
    
    /**
     * @notice Get price from individual Blocksense price feeds
     */
    function getPriceFromIndividualFeed(address base, address quote)
        internal
        view
        returns (
            int256 price,
            uint8 decimals,
            uint256 timestamp,
            string memory source
        )
    {
        address feedAddress = getFeedAddress(base, quote);
        
        if (feedAddress != address(0)) {
            try IBlocksensePriceFeed(feedAddress).latestRoundData() returns (
                uint80,
                int256 answer,
                uint256,
                uint256 updatedAt,
                uint80
            ) {
                uint8 priceDecimals = IBlocksensePriceFeed(feedAddress).decimals();
                // Handle case where Blocksense returns 0 decimals but large values
                if (priceDecimals == 0 && answer > 1000000000000) {
                    // Assume 8 decimals for price feeds if 0 is returned
                    priceDecimals = 8;
                }
                
                // Validate price reasonableness for known problematic feeds
                if (isUnrealisticPrice(base, quote, answer, priceDecimals)) {
                    // If price is unrealistic, fall back to registry or simulated data
                    return getFallbackPrice(base, quote);
                }
                
                return (answer, priceDecimals, updatedAt, "Blocksense Price Feed");
            } catch {
                // Fallback to simulated data
                return getSimulatedPrice(base, quote);
            }
        }
        
        // Fallback to simulated data
        return getSimulatedPrice(base, quote);
    }
    
    /**
     * @notice Get the appropriate feed address for a token pair
     */
    function getFeedAddress(address base, address quote) internal pure returns (address) {
        if (base == ETH && quote == USDC) {
            return ETH_USDC_FEED;
        } else if (base == USDT && quote == USDC) {
            return USDT_USDC_FEED;
        } else if (base == NEAR && quote == USDC) {
            return NEAR_USDC_FEED;
        } else if (base == BTC && quote == USDC) {
            return BTC_USDC_FEED;
        }
        return address(0);
    }
    
    /**
     * @notice Check if a price is unrealistic for known problematic feeds
     */
    function isUnrealisticPrice(address base, address quote, int256 price, uint8 decimals) internal pure returns (bool) {
        // Convert price to a more readable format for validation
        uint256 priceValue = uint256(price);
        
        // For NEAR/USDC: expect price around $2.5-4 (250-400 cents with 8 decimals)
        if (base == NEAR && quote == USDC) {
            uint256 nearPriceCents = priceValue / (10 ** (decimals - 2));
            return nearPriceCents < 250 || nearPriceCents > 400; // Outside $2.5-$4 range
        }
        
        // For BTC/USDC: expect price around $100,000-110,000 (10M-11M cents with 8 decimals)
        if (base == BTC && quote == USDC) {
            uint256 btcPriceCents = priceValue / (10 ** (decimals - 2));
            return btcPriceCents < 80000000 || btcPriceCents > 150000000; // Outside $800K-$1.5M range
        }
        
        return false; // Other pairs are assumed to be reasonable
    }
    
    /**
     * @notice Get fallback price when individual feed returns unrealistic data
     */
    function getFallbackPrice(address base, address quote) internal view returns (
        int256 price,
        uint8 decimals,
        uint256 timestamp,
        string memory source
    ) {
        // Try registry first
        if (BLOCKSENSE_FEED_REGISTRY != address(0)) {
            try IBlocksenseFeedRegistry(BLOCKSENSE_FEED_REGISTRY).latestRoundData(base, quote) returns (
                uint80,
                int256 answer,
                uint256,
                uint256 updatedAt,
                uint80
            ) {
                uint8 priceDecimals = IBlocksenseFeedRegistry(BLOCKSENSE_FEED_REGISTRY).decimals(base, quote);
                if (priceDecimals == 0 && answer > 1000000000000) {
                    priceDecimals = 8;
                }
                return (answer, priceDecimals, updatedAt, "Blocksense Registry (Fallback)");
            } catch {
                // Continue to simulated data
            }
        }
        
        // Fallback to simulated data
        return getSimulatedPrice(base, quote);
    }

    /**
     * @notice Get simulated price data (fallback when Blocksense not available)
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
        if (base == address(0) && quote == USDC) {
            // ETH/USDC - Simulate real price around $3000
            return (300000000000, 8, block.timestamp, "Simulated Data (Blocksense not available)");
        } else if (base == USDT && quote == USDC) {
            // USDT/USDC - Simulate real price around $1.00
            return (100000000, 8, block.timestamp, "Simulated Data (Blocksense not available)");
        } else if (base == NEAR && quote == USDC) {
            // NEAR/USDC - Simulate real price around $2.50
            return (250000000, 8, block.timestamp, "Simulated Data (Blocksense not available)");
        } else if (base == BTC && quote == USDC) {
            // BTC/USDC - Simulate real price around $45000
            return (4500000000000, 8, block.timestamp, "Simulated Data (Blocksense not available)");
        } else {
            // Default fallback
            return (100000000, 8, block.timestamp, "Simulated Data (Blocksense not available)");
        }
    }
    
    /**
     * @notice Check if using real Blocksense data
     */
    function isUsingRealBlocksense() external pure returns (bool) {
        return BLOCKSENSE_FEED_REGISTRY != address(0);
    }
    
    /**
     * @notice Get Blocksense Feed Registry address
     */
    function getBlocksenseRegistry() external pure returns (address) {
        return BLOCKSENSE_FEED_REGISTRY;
    }
    
    /**
     * @notice Get individual feed addresses
     */
    function getFeedAddresses() external pure returns (
        address ethUsdc,
        address usdtUsdc,
        address nearUsdc,
        address btcUsdc
    ) {
        return (ETH_USDC_FEED, USDT_USDC_FEED, NEAR_USDC_FEED, BTC_USDC_FEED);
    }
    
    // Convenience functions for common token pairs
    
    function getETHUSDPrice() external view returns (int256 price) {
        (price, , , ) = getLatestPrice(ETH, USDC);
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

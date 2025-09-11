// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ICLFeedRegistryAdapter
 * @dev Interface for Blocksense Chainlink Feed Registry Adapter
 * @notice This interface allows interaction with Blocksense's price feed registry
 */
interface ICLFeedRegistryAdapter {
    /**
     * @notice Get the latest round data for a price feed
     * @param base The base asset address
     * @param quote The quote asset address
     * @return roundId The round ID
     * @return answer The price answer
     * @return startedAt Timestamp when the round started
     * @return updatedAt Timestamp when the round was updated
     * @return answeredInRound The round ID in which the answer was computed
     */
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

    /**
     * @notice Get the decimals for a price feed
     * @param base The base asset address
     * @param quote The quote asset address
     * @return The number of decimals
     */
    function decimals(address base, address quote)
        external
        view
        returns (uint8);

    /**
     * @notice Get the description for a price feed
     * @param base The base asset address
     * @param quote The quote asset address
     * @return The description string
     */
    function description(address base, address quote)
        external
        view
        returns (string memory);

    /**
     * @notice Get the version for a price feed
     * @param base The base asset address
     * @param quote The quote asset address
     * @return The version number
     */
    function version(address base, address quote)
        external
        view
        returns (uint256);

    /**
     * @notice Get round data for a specific round
     * @param base The base asset address
     * @param quote The quote asset address
     * @param roundId The round ID to query
     * @return roundId The round ID
     * @return answer The price answer
     * @return startedAt Timestamp when the round started
     * @return updatedAt Timestamp when the round was updated
     * @return answeredInRound The round ID in which the answer was computed
     */
    function getRoundData(address base, address quote, uint80 roundId)
        external
        view
        returns (
            uint80,
            int256,
            uint256,
            uint256,
            uint80
        );
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ICLAggregatorAdapter
 * @dev Interface for Blocksense Chainlink Aggregator Adapter
 * @notice This interface allows direct interaction with individual price feeds
 */
interface ICLAggregatorAdapter {
    /**
     * @notice Get the latest round data
     * @return roundId The round ID
     * @return answer The price answer
     * @return startedAt Timestamp when the round started
     * @return updatedAt Timestamp when the round was updated
     * @return answeredInRound The round ID in which the answer was computed
     */
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

    /**
     * @notice Get the number of decimals for this price feed
     * @return The number of decimals
     */
    function decimals() external view returns (uint8);

    /**
     * @notice Get the description of this price feed
     * @return The description string
     */
    function description() external view returns (string memory);

    /**
     * @notice Get the version of this price feed
     * @return The version number
     */
    function version() external view returns (uint256);

    /**
     * @notice Get round data for a specific round
     * @param roundId The round ID to query
     * @return roundId The round ID
     * @return answer The price answer
     * @return startedAt Timestamp when the round started
     * @return updatedAt Timestamp when the round was updated
     * @return answeredInRound The round ID in which the answer was computed
     */
    function getRoundData(uint80 roundId)
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

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Analytics
 * @dev Advanced analytics and data tracking for airdrops - NEW FEATURE FOR BASE
 * Track claims, participation, token flow metrics
 */
contract Analytics is Ownable, ReentrancyGuard {
    // Events
    event MetricsUpdated(
        uint256 indexed airdropId,
        uint256 totalClaimers,
        uint256 totalClaimed,
        uint256 timestamp
    );
    event ParticipationRecorded(
        uint256 indexed airdropId,
        address indexed participant,
        uint256 amount,
        uint256 timestamp
    );

    // Data structures
    struct AirdropMetrics {
        uint256 totalClaimers;
        uint256 totalClaimed;
        uint256 averageClaimAmount;
        uint256 firstClaimTime;
        uint256 lastClaimTime;
        uint256 claimCount;
    }

    struct DailyStats {
        uint256 claimsCount;
        uint256 amountClaimed;
        uint256 uniqueClaimers;
    }

    struct ParticipantStats {
        uint256 claimAmount;
        uint256 claimTime;
        uint256 claimCount;
    }

    // State variables
    mapping(uint256 => AirdropMetrics) private metrics;
    mapping(uint256 => mapping(uint256 => DailyStats)) private dailyStats;
    mapping(uint256 => mapping(address => ParticipantStats)) private participantStats;
    mapping(uint256 => mapping(uint256 => bool)) private dayRecorded; // Prevent duplicate records

    constructor() Ownable(msg.sender) {}

    // ==================== Read-Only Functions ====================

    /**
     * @dev Get airdrop metrics
     */
    function getAirdropMetrics(uint256 airdropId)
        public
        view
        returns (AirdropMetrics memory)
    {
        return metrics[airdropId];
    }

    /**
     * @dev Get daily statistics for an airdrop
     */
    function getDailyStats(uint256 airdropId, uint256 day)
        public
        view
        returns (DailyStats memory)
    {
        return dailyStats[airdropId][day];
    }

    /**
     * @dev Get participant statistics
     */
    function getParticipantStats(uint256 airdropId, address participant)
        public
        view
        returns (ParticipantStats memory)
    {
        return participantStats[airdropId][participant];
    }

    /**
     * @dev Calculate current day (days since epoch)
     */
    function getCurrentDay() public view returns (uint256) {
        return block.timestamp / 86400;
    }

    /**
     * @dev Get day from timestamp
     */
    function getDayFromTimestamp(uint256 timestamp) public pure returns (uint256) {
        return timestamp / 86400;
    }

    // ==================== Public Functions ====================

    /**
     * @dev Record a claim event for analytics
     */
    function recordClaim(
        uint256 airdropId,
        address participant,
        uint256 amount
    ) public onlyOwner {
        require(amount > 0, "Invalid amount");

        uint256 currentDay = getCurrentDay();

        // Update global metrics
        AirdropMetrics storage metric = metrics[airdropId];
        if (participantStats[airdropId][participant].claimCount == 0) {
            metric.totalClaimers++;
        }
        metric.totalClaimed += amount;
        metric.claimCount++;
        metric.averageClaimAmount = metric.totalClaimed / metric.claimCount;
        metric.lastClaimTime = block.timestamp;
        if (metric.firstClaimTime == 0) {
            metric.firstClaimTime = block.timestamp;
        }

        // Update daily stats
        if (!dayRecorded[airdropId][currentDay]) {
            dailyStats[airdropId][currentDay].uniqueClaimers = 1;
            dayRecorded[airdropId][currentDay] = true;
        } else if (participantStats[airdropId][participant].claimCount == 0) {
            dailyStats[airdropId][currentDay].uniqueClaimers++;
        }

        dailyStats[airdropId][currentDay].claimsCount++;
        dailyStats[airdropId][currentDay].amountClaimed += amount;

        // Update participant stats
        participantStats[airdropId][participant].claimAmount += amount;
        participantStats[airdropId][participant].claimTime = block.timestamp;
        participantStats[airdropId][participant].claimCount++;

        emit ParticipationRecorded(airdropId, participant, amount, block.timestamp);
        emit MetricsUpdated(
            airdropId,
            metric.totalClaimers,
            metric.totalClaimed,
            block.timestamp
        );
    }

    /**
     * @dev Get claim rate (percentage of eligible users who claimed)
     */
    function getClaimRate(uint256 airdropId, uint256 totalEligible)
        public
        view
        returns (uint256)
    {
        if (totalEligible == 0) return 0;
        AirdropMetrics memory metric = metrics[airdropId];
        return (metric.totalClaimers * 100) / totalEligible;
    }

    /**
     * @dev Get total claimed amount
     */
    function getTotalClaimedAmount(uint256 airdropId)
        public
        view
        returns (uint256)
    {
        return metrics[airdropId].totalClaimed;
    }

    /**
     * @dev Get total number of claimers
     */
    function getTotalClaimers(uint256 airdropId)
        public
        view
        returns (uint256)
    {
        return metrics[airdropId].totalClaimers;
    }

    /**
     * @dev Get average claim amount
     */
    function getAverageClaimAmount(uint256 airdropId)
        public
        view
        returns (uint256)
    {
        return metrics[airdropId].averageClaimAmount;
    }
}

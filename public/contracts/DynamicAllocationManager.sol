// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface IPriceFeed {
    function getLatestPrice(address token) external view returns (uint256);
}

interface IPoolSizeOracle {
    function getPoolSize(address token) external view returns (uint256);
}

/**
 * @title DynamicAllocationManager
 * @notice Adjusts airdrop allocations in real-time based on conditions
 * @dev Supports price-based, pool-size-based, and time-based dynamic adjustments
 */
contract DynamicAllocationManager is Ownable, ReentrancyGuard, Pausable {
    
    enum AdjustmentType { PRICE_BASED, POOL_SIZE_BASED, TIME_BASED, VOLUME_BASED }
    
    struct DynamicAirdrop {
        address tokenContract;
        uint256 baseAllocation; // Base amount per user
        uint256 totalTokens;
        uint256 claimedTokens;
        uint256 startTime;
        uint256 endTime;
        AdjustmentType adjustmentType;
        bool active;
    }
    
    struct AdjustmentRule {
        uint256 airdropId;
        AdjustmentType adjustmentType;
        uint256 threshold; // Price threshold, pool size, etc.
        uint256 minMultiplier; // Min adjustment multiplier (e.g., 50 = 0.5x)
        uint256 maxMultiplier; // Max adjustment multiplier (e.g., 150 = 1.5x)
        address priceOracle; // For price-based adjustments
        address poolOracle; // For pool-size-based adjustments
    }
    
    struct UserAllocation {
        uint256 airdropId;
        address recipient;
        uint256 baseAmount;
        uint256 currentAmount; // Adjusted based on conditions
        uint256 adjustmentPercentage; // Current adjustment %
        bool claimed;
    }
    
    mapping(uint256 => DynamicAirdrop) public airdrops;
    mapping(uint256 => AdjustmentRule) public rules;
    mapping(uint256 => mapping(address => UserAllocation)) public allocations;
    mapping(uint256 => mapping(address => bool)) public claimed;
    
    uint256 public airdropCounter;
    
    event DynamicAirdropCreated(
        uint256 indexed airdropId,
        address indexed tokenContract,
        AdjustmentType adjustmentType,
        uint256 baseAllocation,
        uint256 startTime
    );
    
    event AdjustmentRuleSet(
        uint256 indexed airdropId,
        AdjustmentType adjustmentType,
        uint256 minMultiplier,
        uint256 maxMultiplier
    );
    
    event AllocationAdjusted(
        uint256 indexed airdropId,
        address indexed user,
        uint256 oldAmount,
        uint256 newAmount,
        uint256 adjustmentPercentage
    );
    
    event TokenClaimed(
        uint256 indexed airdropId,
        address indexed recipient,
        uint256 amount
    );
    
    /**
     * @notice Create a new dynamic airdrop
     * @param tokenContract Address of the token to distribute
     * @param baseAllocation Base amount per user before adjustments
     * @param totalTokens Total tokens for the campaign
     * @param adjustmentType Type of dynamic adjustment
     * @param startTime Campaign start time
     * @param endTime Campaign end time
     * @return airdropId The ID of the created airdrop
     */
    function createDynamicAirdrop(
        address tokenContract,
        uint256 baseAllocation,
        uint256 totalTokens,
        AdjustmentType adjustmentType,
        uint256 startTime,
        uint256 endTime
    ) external onlyOwner returns (uint256) {
        require(tokenContract != address(0), "Invalid token");
        require(baseAllocation > 0, "Invalid base allocation");
        require(startTime < endTime, "Invalid time range");
        
        uint256 airdropId = airdropCounter++;
        
        airdrops[airdropId] = DynamicAirdrop({
            tokenContract: tokenContract,
            baseAllocation: baseAllocation,
            totalTokens: totalTokens,
            claimedTokens: 0,
            startTime: startTime,
            endTime: endTime,
            adjustmentType: adjustmentType,
            active: true
        });
        
        emit DynamicAirdropCreated(
            airdropId,
            tokenContract,
            adjustmentType,
            baseAllocation,
            startTime
        );
        return airdropId;
    }
    
    /**
     * @notice Set adjustment rules for an airdrop
     * @param airdropId The airdrop ID
     * @param adjustmentType Type of adjustment
     * @param threshold Threshold value (price in cents, pool size in tokens, etc.)
     * @param minMultiplier Minimum multiplier (e.g., 50 = 0.5x)
     * @param maxMultiplier Maximum multiplier (e.g., 150 = 1.5x)
     * @param priceOracle Address of price feed (if price-based)
     * @param poolOracle Address of pool oracle (if pool-based)
     */
    function setAdjustmentRule(
        uint256 airdropId,
        AdjustmentType adjustmentType,
        uint256 threshold,
        uint256 minMultiplier,
        uint256 maxMultiplier,
        address priceOracle,
        address poolOracle
    ) external onlyOwner {
        require(minMultiplier <= maxMultiplier, "Invalid multipliers");
        require(minMultiplier > 0, "Min multiplier must be > 0");
        
        rules[airdropId] = AdjustmentRule({
            airdropId: airdropId,
            adjustmentType: adjustmentType,
            threshold: threshold,
            minMultiplier: minMultiplier,
            maxMultiplier: maxMultiplier,
            priceOracle: priceOracle,
            poolOracle: poolOracle
        });
        
        emit AdjustmentRuleSet(airdropId, adjustmentType, minMultiplier, maxMultiplier);
    }
    
    /**
     * @notice Allocate tokens to users and calculate adjustments
     * @param airdropId The airdrop ID
     * @param recipients Array of recipients
     * @param baseAmounts Array of base amounts
     */
    function batchAllocateAndAdjust(
        uint256 airdropId,
        address[] calldata recipients,
        uint256[] calldata baseAmounts
    ) external onlyOwner {
        require(recipients.length == baseAmounts.length, "Array length mismatch");
        require(recipients.length <= 500, "Too many allocations");
        require(airdrops[airdropId].active, "Airdrop not active");
        
        DynamicAirdrop storage airdrop = airdrops[airdropId];
        AdjustmentRule memory rule = rules[airdropId];
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            
            uint256 adjustedAmount = _calculateAdjustedAmount(
                baseAmounts[i],
                airdrop.adjustmentType,
                rule
            );
            
            uint256 adjustmentPercentage = (adjustedAmount * 100) / baseAmounts[i];
            
            allocations[airdropId][recipients[i]] = UserAllocation({
                airdropId: airdropId,
                recipient: recipients[i],
                baseAmount: baseAmounts[i],
                currentAmount: adjustedAmount,
                adjustmentPercentage: adjustmentPercentage,
                claimed: false
            });
            
            emit AllocationAdjusted(
                airdropId,
                recipients[i],
                baseAmounts[i],
                adjustedAmount,
                adjustmentPercentage
            );
        }
    }
    
    /**
     * @notice Update allocation for a user (re-calculates with current conditions)
     * @param airdropId The airdrop ID
     * @param recipient User address
     */
    function updateAllocationForUser(uint256 airdropId, address recipient)
        external
        onlyOwner
    {
        require(recipient != address(0), "Invalid recipient");
        require(!claimed[airdropId][recipient], "Already claimed");
        
        UserAllocation storage allocation = allocations[airdropId][recipient];
        AdjustmentRule memory rule = rules[airdropId];
        DynamicAirdrop memory airdrop = airdrops[airdropId];
        
        uint256 newAmount = _calculateAdjustedAmount(
            allocation.baseAmount,
            airdrop.adjustmentType,
            rule
        );
        
        uint256 oldAmount = allocation.currentAmount;
        allocation.currentAmount = newAmount;
        allocation.adjustmentPercentage = (newAmount * 100) / allocation.baseAmount;
        
        emit AllocationAdjusted(
            airdropId,
            recipient,
            oldAmount,
            newAmount,
            allocation.adjustmentPercentage
        );
    }
    
    /**
     * @notice Claim allocated tokens
     * @param airdropId The airdrop ID
     */
    function claimTokens(uint256 airdropId) external nonReentrant whenNotPaused {
        require(!claimed[airdropId][msg.sender], "Already claimed");
        require(block.timestamp >= airdrops[airdropId].startTime, "Airdrop not started");
        require(block.timestamp <= airdrops[airdropId].endTime, "Airdrop ended");
        
        UserAllocation memory allocation = allocations[airdropId][msg.sender];
        require(allocation.currentAmount > 0, "No tokens allocated");
        
        DynamicAirdrop storage airdrop = airdrops[airdropId];
        airdrop.claimedTokens += allocation.currentAmount;
        claimed[airdropId][msg.sender] = true;
        
        require(
            IERC20(airdrop.tokenContract).transfer(msg.sender, allocation.currentAmount),
            "Transfer failed"
        );
        
        emit TokenClaimed(airdropId, msg.sender, allocation.currentAmount);
    }
    
    /**
     * @notice Get user's allocation details
     * @param airdropId The airdrop ID
     * @param user User address
     * @return User's allocation
     */
    function getUserAllocation(uint256 airdropId, address user)
        external
        view
        returns (UserAllocation memory)
    {
        return allocations[airdropId][user];
    }
    
    /**
     * @notice Get airdrop details
     * @param airdropId The airdrop ID
     * @return Airdrop information
     */
    function getAirdropDetails(uint256 airdropId)
        external
        view
        returns (DynamicAirdrop memory)
    {
        return airdrops[airdropId];
    }
    
    /**
     * @notice Get adjustment rule for an airdrop
     * @param airdropId The airdrop ID
     * @return Adjustment rule
     */
    function getAdjustmentRule(uint256 airdropId)
        external
        view
        returns (AdjustmentRule memory)
    {
        return rules[airdropId];
    }
    
    /**
     * @notice Get claim rate for an airdrop
     * @param airdropId The airdrop ID
     * @return Percentage of tokens claimed (0-100)
     */
    function getClaimRate(uint256 airdropId) external view returns (uint256) {
        DynamicAirdrop memory airdrop = airdrops[airdropId];
        if (airdrop.totalTokens == 0) return 0;
        return (airdrop.claimedTokens * 100) / airdrop.totalTokens;
    }
    
    /**
     * @notice Pause/unpause claims
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Deactivate an airdrop
     * @param airdropId The airdrop ID
     */
    function deactivateAirdrop(uint256 airdropId) external onlyOwner {
        airdrops[airdropId].active = false;
    }
    
    /**
     * @notice Recover tokens (emergency only)
     * @param tokenContract Token contract address
     * @param amount Amount to recover
     */
    function recoverTokens(address tokenContract, uint256 amount) external onlyOwner {
        require(
            IERC20(tokenContract).transfer(msg.sender, amount),
            "Transfer failed"
        );
    }
    
    // Internal Functions
    
    function _calculateAdjustedAmount(
        uint256 baseAmount,
        AdjustmentType adjustmentType,
        AdjustmentRule memory rule
    ) internal view returns (uint256) {
        if (adjustmentType == AdjustmentType.TIME_BASED) {
            return _calculateTimeBasedAdjustment(baseAmount, rule);
        } else if (adjustmentType == AdjustmentType.PRICE_BASED) {
            return _calculatePriceBasedAdjustment(baseAmount, rule);
        } else if (adjustmentType == AdjustmentType.POOL_SIZE_BASED) {
            return _calculatePoolSizeBasedAdjustment(baseAmount, rule);
        } else {
            return baseAmount;
        }
    }
    
    function _calculateTimeBasedAdjustment(
        uint256 baseAmount,
        AdjustmentRule memory rule
    ) internal view returns (uint256) {
        // Early claimer bonus: higher multiplier for early claims
        // Linear decrease from maxMultiplier to minMultiplier
        uint256 elapsed = block.timestamp - rule.threshold;
        uint256 duration = 30 days;
        
        if (elapsed >= duration) {
            return (baseAmount * rule.minMultiplier) / 100;
        }
        
        uint256 multiplier = rule.maxMultiplier - 
            ((rule.maxMultiplier - rule.minMultiplier) * elapsed) / duration;
        
        return (baseAmount * multiplier) / 100;
    }
    
    function _calculatePriceBasedAdjustment(
        uint256 baseAmount,
        AdjustmentRule memory rule
    ) internal view returns (uint256) {
        require(rule.priceOracle != address(0), "Price oracle not set");
        
        uint256 currentPrice = IPriceFeed(rule.priceOracle).getLatestPrice(
            address(0)
        );
        
        if (currentPrice >= rule.threshold) {
            return (baseAmount * rule.maxMultiplier) / 100;
        } else {
            return (baseAmount * rule.minMultiplier) / 100;
        }
    }
    
    function _calculatePoolSizeBasedAdjustment(
        uint256 baseAmount,
        AdjustmentRule memory rule
    ) internal view returns (uint256) {
        require(rule.poolOracle != address(0), "Pool oracle not set");
        
        uint256 poolSize = IPoolSizeOracle(rule.poolOracle).getPoolSize(
            address(0)
        );
        
        if (poolSize >= rule.threshold) {
            return (baseAmount * rule.maxMultiplier) / 100;
        } else {
            return (baseAmount * rule.minMultiplier) / 100;
        }
    }
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title LPTokenDistributor
 * @notice Distributes LP tokens from DEXes (Uniswap V3/V2, others) with liquidity tracking
 * @dev Supports multiple LP token types and redemption mechanisms
 */
contract LPTokenDistributor is Ownable, ReentrancyGuard, Pausable {
    
    struct LPAirdrop {
        address lpTokenContract;
        string dexName; // "Uniswap V3", "Uniswap V2", "SushiSwap", etc.
        string poolName;
        uint256 totalLPTokens;
        uint256 claimedLPTokens;
        uint256 startTime;
        uint256 endTime;
        bool active;
    }
    
    struct LPAllocation {
        uint256 airdropId;
        address recipient;
        uint256 lpAmount;
        uint256 liquidityValue; // estimated USD value
        bool claimed;
    }
    
    struct LiquidityData {
        address token0;
        address token1;
        uint256 fee; // for Uniswap V3
        uint256 position; // position ID for V3
        uint128 liquidity; // liquidity amount
    }
    
    mapping(uint256 => LPAirdrop) public airdrops;
    mapping(uint256 => mapping(address => LPAllocation)) public allocations;
    mapping(uint256 => LiquidityData) public liquidityInfo;
    mapping(uint256 => mapping(address => bool)) public claimed;
    
    uint256 public airdropCounter;
    
    event LPAirdropCreated(
        uint256 indexed airdropId,
        address indexed lpTokenContract,
        string dexName,
        uint256 totalLPTokens,
        uint256 startTime
    );
    
    event LPAllocated(
        uint256 indexed airdropId,
        address indexed recipient,
        uint256 lpAmount,
        uint256 liquidityValue
    );
    
    event LPClaimed(
        uint256 indexed airdropId,
        address indexed recipient,
        uint256 lpAmount
    );
    
    event LiquidityDataSet(
        uint256 indexed airdropId,
        address token0,
        address token1,
        uint256 fee
    );
    
    /**
     * @notice Create a new LP token airdrop
     * @param lpTokenContract Address of the LP token contract
     * @param dexName Name of the DEX (e.g., "Uniswap V3", "SushiSwap")
     * @param poolName Name of the liquidity pool
     * @param totalLPTokens Total LP tokens to distribute
     * @param startTime Campaign start time
     * @param endTime Campaign end time
     * @return airdropId The ID of the created airdrop
     */
    function createLPAirdrop(
        address lpTokenContract,
        string memory dexName,
        string memory poolName,
        uint256 totalLPTokens,
        uint256 startTime,
        uint256 endTime
    ) external onlyOwner returns (uint256) {
        require(lpTokenContract != address(0), "Invalid LP token contract");
        require(startTime < endTime, "Invalid time range");
        require(totalLPTokens > 0, "Must have at least 1 LP token");
        
        uint256 airdropId = airdropCounter++;
        
        airdrops[airdropId] = LPAirdrop({
            lpTokenContract: lpTokenContract,
            dexName: dexName,
            poolName: poolName,
            totalLPTokens: totalLPTokens,
            claimedLPTokens: 0,
            startTime: startTime,
            endTime: endTime,
            active: true
        });
        
        emit LPAirdropCreated(airdropId, lpTokenContract, dexName, totalLPTokens, startTime);
        return airdropId;
    }
    
    /**
     * @notice Set liquidity metadata for an LP airdrop
     * @param airdropId The airdrop ID
     * @param token0 First token in the pair
     * @param token1 Second token in the pair
     * @param fee Swap fee (Uniswap V3: 500, 3000, 10000; Uniswap V2: 3000 basis points)
     * @param position Position ID (for tracking)
     * @param liquidity Liquidity amount
     */
    function setLiquidityData(
        uint256 airdropId,
        address token0,
        address token1,
        uint256 fee,
        uint256 position,
        uint128 liquidity
    ) external onlyOwner {
        require(token0 != address(0) && token1 != address(0), "Invalid tokens");
        require(token0 != token1, "Duplicate tokens");
        
        liquidityInfo[airdropId] = LiquidityData({
            token0: token0,
            token1: token1,
            fee: fee,
            position: position,
            liquidity: liquidity
        });
        
        emit LiquidityDataSet(airdropId, token0, token1, fee);
    }
    
    /**
     * @notice Allocate LP tokens to recipients
     * @param airdropId The airdrop ID
     * @param recipients Array of recipient addresses
     * @param lpAmounts Array of LP amounts
     * @param liquidityValues Array of liquidity values in USD
     */
    function batchAllocateLPTokens(
        uint256 airdropId,
        address[] calldata recipients,
        uint256[] calldata lpAmounts,
        uint256[] calldata liquidityValues
    ) external onlyOwner {
        require(recipients.length == lpAmounts.length, "Array length mismatch");
        require(recipients.length == liquidityValues.length, "Array length mismatch");
        require(recipients.length <= 500, "Too many allocations");
        require(airdrops[airdropId].active, "Airdrop not active");
        
        LPAirdrop storage airdrop = airdrops[airdropId];
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            require(lpAmounts[i] > 0, "Invalid LP amount");
            
            allocations[airdropId][recipients[i]] = LPAllocation({
                airdropId: airdropId,
                recipient: recipients[i],
                lpAmount: lpAmounts[i],
                liquidityValue: liquidityValues[i],
                claimed: false
            });
            
            emit LPAllocated(airdropId, recipients[i], lpAmounts[i], liquidityValues[i]);
        }
    }
    
    /**
     * @notice Claim allocated LP tokens
     * @param airdropId The airdrop ID
     */
    function claimLPTokens(uint256 airdropId) external nonReentrant whenNotPaused {
        require(!claimed[airdropId][msg.sender], "Already claimed");
        require(block.timestamp >= airdrops[airdropId].startTime, "Airdrop not started");
        require(block.timestamp <= airdrops[airdropId].endTime, "Airdrop ended");
        
        LPAllocation memory allocation = allocations[airdropId][msg.sender];
        require(allocation.lpAmount > 0, "No LP tokens allocated");
        require(!allocation.claimed, "LP tokens already claimed");
        
        LPAirdrop storage airdrop = airdrops[airdropId];
        airdrop.claimedLPTokens += allocation.lpAmount;
        claimed[airdropId][msg.sender] = true;
        allocations[airdropId][msg.sender].claimed = true;
        
        require(
            IERC20(airdrop.lpTokenContract).transfer(msg.sender, allocation.lpAmount),
            "Transfer failed"
        );
        
        emit LPClaimed(airdropId, msg.sender, allocation.lpAmount);
    }
    
    /**
     * @notice Get LP token allocation for a user
     * @param airdropId The airdrop ID
     * @param user User address
     * @return User's LP allocation
     */
    function getLPAllocation(uint256 airdropId, address user)
        external
        view
        returns (LPAllocation memory)
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
        returns (LPAirdrop memory)
    {
        return airdrops[airdropId];
    }
    
    /**
     * @notice Get liquidity data for an airdrop
     * @param airdropId The airdrop ID
     * @return Liquidity information
     */
    function getLiquidityData(uint256 airdropId)
        external
        view
        returns (LiquidityData memory)
    {
        return liquidityInfo[airdropId];
    }
    
    /**
     * @notice Get claim rate for an airdrop
     * @param airdropId The airdrop ID
     * @return Percentage of LP tokens claimed (0-100)
     */
    function getClaimRate(uint256 airdropId) external view returns (uint256) {
        LPAirdrop memory airdrop = airdrops[airdropId];
        if (airdrop.totalLPTokens == 0) return 0;
        return (airdrop.claimedLPTokens * 100) / airdrop.totalLPTokens;
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
     * @notice Recover LP tokens (emergency only)
     * @param lpTokenContract Address of the LP token
     * @param amount Amount to recover
     */
    function recoverLPTokens(address lpTokenContract, uint256 amount) external onlyOwner {
        require(
            IERC20(lpTokenContract).transfer(msg.sender, amount),
            "Transfer failed"
        );
    }
}

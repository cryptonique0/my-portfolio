// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title StakingRewards
 * @notice Token staking with yield rewards and unlock periods
 * @dev Users lock tokens to earn additional yields
 */
contract StakingRewards is Ownable, ReentrancyGuard {
    
    struct StakePosition {
        uint256 amount;
        uint256 stakedAt;
        uint256 unlocksAt;
        uint256 rewardAmount;
        bool claimed;
    }
    
    struct StakingPool {
        address rewardToken;
        uint256 minStakeAmount;
        uint256 maxStakeAmount;
        uint256 lockDuration; // seconds
        uint256 apy; // Annual percentage yield (e.g., 25 = 25%)
        bool active;
    }
    
    mapping(uint256 => StakingPool) public pools;
    mapping(uint256 => mapping(address => StakePosition[])) public positions;
    
    uint256 public poolCount;
    address public stakeToken;
    uint256 public totalStaked;
    
    event PoolCreated(
        uint256 indexed poolId,
        address rewardToken,
        uint256 lockDuration,
        uint256 apy
    );
    
    event TokensStaked(
        uint256 indexed poolId,
        address indexed user,
        uint256 amount,
        uint256 unlocksAt
    );
    
    event TokensUnstaked(
        uint256 indexed poolId,
        address indexed user,
        uint256 amount
    );
    
    event RewardsClaimed(
        uint256 indexed poolId,
        address indexed user,
        uint256 amount
    );
    
    event PoolUpdated(uint256 indexed poolId);
    
    /**
     * @notice Set the stake token
     * @param _token Token contract address
     */
    function setStakeToken(address _token) external onlyOwner {
        require(_token != address(0), "Invalid token");
        stakeToken = _token;
    }
    
    /**
     * @notice Create a new staking pool
     * @param _rewardToken Reward token contract
     * @param _minStake Minimum stake amount
     * @param _maxStake Maximum stake amount
     * @param _lockDuration Lock duration in seconds
     * @param _apy Annual percentage yield
     */
    function createPool(
        address _rewardToken,
        uint256 _minStake,
        uint256 _maxStake,
        uint256 _lockDuration,
        uint256 _apy
    ) external onlyOwner returns (uint256) {
        require(_rewardToken != address(0), "Invalid reward token");
        require(_minStake <= _maxStake, "Invalid stake range");
        require(_apy > 0 && _apy <= 1000, "Invalid APY"); // Max 1000%
        
        uint256 poolId = poolCount++;
        
        pools[poolId] = StakingPool({
            rewardToken: _rewardToken,
            minStakeAmount: _minStake,
            maxStakeAmount: _maxStake,
            lockDuration: _lockDuration,
            apy: _apy,
            active: true
        });
        
        emit PoolCreated(poolId, _rewardToken, _lockDuration, _apy);
        return poolId;
    }
    
    /**
     * @notice Stake tokens
     * @param _poolId Pool ID
     * @param _amount Amount to stake
     */
    function stake(uint256 _poolId, uint256 _amount) external nonReentrant {
        require(_poolId < poolCount, "Invalid pool");
        require(_amount > 0, "Invalid amount");
        
        StakingPool memory pool = pools[_poolId];
        require(pool.active, "Pool not active");
        require(_amount >= pool.minStakeAmount, "Below minimum stake");
        require(_amount <= pool.maxStakeAmount, "Exceeds maximum stake");
        
        // Calculate reward
        uint256 rewardAmount = (_amount * pool.apy) / 100;
        
        // Record position
        positions[_poolId][msg.sender].push(StakePosition({
            amount: _amount,
            stakedAt: block.timestamp,
            unlocksAt: block.timestamp + pool.lockDuration,
            rewardAmount: rewardAmount,
            claimed: false
        }));
        
        totalStaked += _amount;
        
        // Transfer tokens from user to contract
        require(
            IERC20(stakeToken).transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );
        
        emit TokensStaked(_poolId, msg.sender, _amount, block.timestamp + pool.lockDuration);
    }
    
    /**
     * @notice Unstake tokens
     * @param _poolId Pool ID
     * @param _positionId Position ID
     */
    function unstake(uint256 _poolId, uint256 _positionId) external nonReentrant {
        require(_poolId < poolCount, "Invalid pool");
        
        StakePosition[] storage userPositions = positions[_poolId][msg.sender];
        require(_positionId < userPositions.length, "Invalid position");
        
        StakePosition storage position = userPositions[_positionId];
        require(block.timestamp >= position.unlocksAt, "Tokens still locked");
        
        uint256 amount = position.amount;
        
        // Remove position
        userPositions[_positionId] = userPositions[userPositions.length - 1];
        userPositions.pop();
        
        totalStaked -= amount;
        
        // Transfer tokens back to user
        require(
            IERC20(stakeToken).transfer(msg.sender, amount),
            "Transfer failed"
        );
        
        emit TokensUnstaked(_poolId, msg.sender, amount);
    }
    
    /**
     * @notice Claim rewards
     * @param _poolId Pool ID
     * @param _positionId Position ID
     */
    function claimRewards(uint256 _poolId, uint256 _positionId) external nonReentrant {
        require(_poolId < poolCount, "Invalid pool");
        
        StakePosition[] storage userPositions = positions[_poolId][msg.sender];
        require(_positionId < userPositions.length, "Invalid position");
        
        StakePosition storage position = userPositions[_positionId];
        require(!position.claimed, "Already claimed");
        require(block.timestamp >= position.unlocksAt, "Rewards not yet available");
        
        position.claimed = true;
        
        StakingPool memory pool = pools[_poolId];
        
        // Transfer rewards
        require(
            IERC20(pool.rewardToken).transfer(msg.sender, position.rewardAmount),
            "Transfer failed"
        );
        
        emit RewardsClaimed(_poolId, msg.sender, position.rewardAmount);
    }
    
    /**
     * @notice Batch claim rewards
     * @param _poolId Pool ID
     * @param _positionIds Array of position IDs
     */
    function batchClaimRewards(uint256 _poolId, uint256[] calldata _positionIds)
        external
        nonReentrant
    {
        require(_poolId < poolCount, "Invalid pool");
        require(_positionIds.length <= 100, "Too many positions");
        
        StakePosition[] storage userPositions = positions[_poolId][msg.sender];
        StakingPool memory pool = pools[_poolId];
        
        uint256 totalRewards = 0;
        
        for (uint256 i = 0; i < _positionIds.length; i++) {
            uint256 positionId = _positionIds[i];
            require(positionId < userPositions.length, "Invalid position");
            
            StakePosition storage position = userPositions[positionId];
            require(!position.claimed, "Already claimed");
            require(block.timestamp >= position.unlocksAt, "Rewards not yet available");
            
            position.claimed = true;
            totalRewards += position.rewardAmount;
        }
        
        // Transfer all rewards at once
        require(
            IERC20(pool.rewardToken).transfer(msg.sender, totalRewards),
            "Transfer failed"
        );
    }
    
    /**
     * @notice Get user positions in a pool
     * @param _poolId Pool ID
     * @param _user User address
     */
    function getUserPositions(uint256 _poolId, address _user)
        external
        view
        returns (StakePosition[] memory)
    {
        return positions[_poolId][_user];
    }
    
    /**
     * @notice Get specific position
     * @param _poolId Pool ID
     * @param _user User address
     * @param _positionId Position ID
     */
    function getPosition(uint256 _poolId, address _user, uint256 _positionId)
        external
        view
        returns (StakePosition memory)
    {
        return positions[_poolId][_user][_positionId];
    }
    
    /**
     * @notice Get pool details
     * @param _poolId Pool ID
     */
    function getPool(uint256 _poolId) external view returns (StakingPool memory) {
        return pools[_poolId];
    }
    
    /**
     * @notice Check if position is unlocked
     * @param _poolId Pool ID
     * @param _user User address
     * @param _positionId Position ID
     */
    function isUnlocked(uint256 _poolId, address _user, uint256 _positionId)
        external
        view
        returns (bool)
    {
        StakePosition memory position = positions[_poolId][_user][_positionId];
        return block.timestamp >= position.unlocksAt;
    }
    
    /**
     * @notice Update pool APY
     * @param _poolId Pool ID
     * @param _newAPY New APY
     */
    function updatePoolAPY(uint256 _poolId, uint256 _newAPY) external onlyOwner {
        require(_poolId < poolCount, "Invalid pool");
        require(_newAPY > 0 && _newAPY <= 1000, "Invalid APY");
        
        pools[_poolId].apy = _newAPY;
        emit PoolUpdated(_poolId);
    }
    
    /**
     * @notice Deactivate pool
     * @param _poolId Pool ID
     */
    function deactivatePool(uint256 _poolId) external onlyOwner {
        require(_poolId < poolCount, "Invalid pool");
        pools[_poolId].active = false;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title FairLaunchMechanism
 * @notice Progressive token release to prevent dumping and ensure fair distribution
 * @dev Implements gradual vesting with cliff periods and release schedules
 */
contract FairLaunchMechanism is Ownable, ReentrancyGuard {
    
    struct LaunchPhase {
        uint256 phaseId;
        string phaseName;
        uint256 startTime;
        uint256 endTime;
        uint256 totalTokens;
        uint256 releasedTokens;
        uint256 releasePercentage; // e.g., 25 = 25%
        bool active;
    }
    
    struct UserAllocation {
        uint256 phaseId;
        address user;
        uint256 allocatedAmount;
        uint256 claimedAmount;
        uint256 vestingStart;
        uint256 vestingEnd;
        bool completed;
    }
    
    mapping(uint256 => LaunchPhase) public phases;
    mapping(uint256 => mapping(address => UserAllocation)) public allocations;
    
    uint256 public phaseCount;
    address public launchToken;
    uint256 public totalAllocated;
    
    // Anti-dump mechanism
    uint256 public maxSellPercentagePerTx; // e.g., 5 = 5%
    uint256 public sellCooldownPeriod; // seconds
    mapping(address => uint256) public lastSellTime;
    mapping(address => uint256) public dailySellAmount;
    mapping(address => uint256) public dailySellReset;
    
    event LaunchPhaseCreated(
        uint256 indexed phaseId,
        string phaseName,
        uint256 totalTokens,
        uint256 releasePercentage
    );
    
    event UserAllocated(
        uint256 indexed phaseId,
        address indexed user,
        uint256 amount
    );
    
    event TokensClaimed(
        uint256 indexed phaseId,
        address indexed user,
        uint256 amount
    );
    
    event PhaseActivated(uint256 indexed phaseId);
    event PhaseCompleted(uint256 indexed phaseId);
    
    /**
     * @notice Set the launch token
     * @param _token Token contract address
     */
    function setLaunchToken(address _token) external onlyOwner {
        require(_token != address(0), "Invalid token");
        launchToken = _token;
    }
    
    /**
     * @notice Create a launch phase
     * @param _phaseName Name of the phase (e.g., "Seed", "Private", "Public")
     * @param _startTime Phase start time
     * @param _endTime Phase end time
     * @param _totalTokens Total tokens for this phase
     * @param _releasePercentage Percentage to release in this phase
     */
    function createLaunchPhase(
        string memory _phaseName,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _totalTokens,
        uint256 _releasePercentage
    ) external onlyOwner returns (uint256) {
        require(_startTime < _endTime, "Invalid time range");
        require(_totalTokens > 0, "Invalid amount");
        require(_releasePercentage > 0 && _releasePercentage <= 100, "Invalid percentage");
        
        uint256 phaseId = phaseCount++;
        
        phases[phaseId] = LaunchPhase({
            phaseId: phaseId,
            phaseName: _phaseName,
            startTime: _startTime,
            endTime: _endTime,
            totalTokens: _totalTokens,
            releasedTokens: 0,
            releasePercentage: _releasePercentage,
            active: false
        });
        
        emit LaunchPhaseCreated(phaseId, _phaseName, _totalTokens, _releasePercentage);
        return phaseId;
    }
    
    /**
     * @notice Allocate tokens to users in a phase
     * @param _phaseId Phase ID
     * @param _users Array of user addresses
     * @param _amounts Array of allocation amounts
     */
    function allocateTokensToUsers(
        uint256 _phaseId,
        address[] calldata _users,
        uint256[] calldata _amounts
    ) external onlyOwner {
        require(_phaseId < phaseCount, "Invalid phase");
        require(_users.length == _amounts.length, "Array length mismatch");
        require(_users.length <= 500, "Too many users");
        
        LaunchPhase storage phase = phases[_phaseId];
        
        for (uint256 i = 0; i < _users.length; i++) {
            require(_users[i] != address(0), "Invalid user");
            
            allocations[_phaseId][_users[i]] = UserAllocation({
                phaseId: _phaseId,
                user: _users[i],
                allocatedAmount: _amounts[i],
                claimedAmount: 0,
                vestingStart: phase.startTime,
                vestingEnd: phase.endTime,
                completed: false
            });
            
            totalAllocated += _amounts[i];
            
            emit UserAllocated(_phaseId, _users[i], _amounts[i]);
        }
    }
    
    /**
     * @notice Activate a launch phase
     * @param _phaseId Phase ID
     */
    function activatePhase(uint256 _phaseId) external onlyOwner {
        require(_phaseId < phaseCount, "Invalid phase");
        require(block.timestamp >= phases[_phaseId].startTime, "Phase not ready");
        
        phases[_phaseId].active = true;
        
        emit PhaseActivated(_phaseId);
    }
    
    /**
     * @notice Claim tokens from a phase
     * @param _phaseId Phase ID
     */
    function claimTokens(uint256 _phaseId) external nonReentrant {
        require(_phaseId < phaseCount, "Invalid phase");
        
        LaunchPhase storage phase = phases[_phaseId];
        UserAllocation storage allocation = allocations[_phaseId][msg.sender];
        
        require(phase.active, "Phase not active");
        require(block.timestamp >= allocation.vestingStart, "Vesting not started");
        require(allocation.allocatedAmount > 0, "No allocation");
        require(!allocation.completed, "Already claimed all tokens");
        
        // Calculate claimable amount based on vesting schedule
        uint256 claimable = _calculateClaimableAmount(_phaseId, msg.sender);
        require(claimable > 0, "Nothing to claim");
        
        allocation.claimedAmount += claimable;
        phase.releasedTokens += claimable;
        
        if (allocation.claimedAmount >= allocation.allocatedAmount) {
            allocation.completed = true;
            emit PhaseCompleted(_phaseId);
        }
        
        require(
            IERC20(launchToken).transfer(msg.sender, claimable),
            "Transfer failed"
        );
        
        emit TokensClaimed(_phaseId, msg.sender, claimable);
    }
    
    /**
     * @notice Get claimable amount for user
     * @param _phaseId Phase ID
     * @param _user User address
     */
    function getClaimableAmount(uint256 _phaseId, address _user)
        external
        view
        returns (uint256)
    {
        return _calculateClaimableAmount(_phaseId, _user);
    }
    
    /**
     * @notice Get phase details
     * @param _phaseId Phase ID
     */
    function getPhaseDetails(uint256 _phaseId)
        external
        view
        returns (LaunchPhase memory)
    {
        return phases[_phaseId];
    }
    
    /**
     * @notice Get user allocation
     * @param _phaseId Phase ID
     * @param _user User address
     */
    function getUserAllocation(uint256 _phaseId, address _user)
        external
        view
        returns (UserAllocation memory)
    {
        return allocations[_phaseId][_user];
    }
    
    /**
     * @notice Set anti-dump parameters
     * @param _maxSellPercentage Maximum sell percentage per transaction
     * @param _cooldownPeriod Cooldown period between sells
     */
    function setAntiDumpParameters(
        uint256 _maxSellPercentage,
        uint256 _cooldownPeriod
    ) external onlyOwner {
        require(_maxSellPercentage > 0 && _maxSellPercentage <= 100, "Invalid percentage");
        
        maxSellPercentagePerTx = _maxSellPercentage;
        sellCooldownPeriod = _cooldownPeriod;
    }
    
    /**
     * @notice Check if user can sell tokens (anti-dump check)
     * @param _user User address
     * @param _amount Amount to sell
     */
    function canSell(address _user, uint256 _amount) external view returns (bool) {
        // Check cooldown
        if (block.timestamp < lastSellTime[_user] + sellCooldownPeriod) {
            return false;
        }
        
        // Check daily limit
        if (block.timestamp > dailySellReset[_user]) {
            // Reset daily counter
            return true;
        }
        
        return (dailySellAmount[_user] + _amount) <= ((_amount * maxSellPercentagePerTx) / 100);
    }
    
    /**
     * @notice Record a sell transaction
     * @param _user User address
     * @param _amount Amount sold
     */
    function recordSell(address _user, uint256 _amount) external onlyOwner {
        lastSellTime[_user] = block.timestamp;
        
        // Reset daily counter if period passed
        if (block.timestamp > dailySellReset[_user]) {
            dailySellReset[_user] = block.timestamp + 24 hours;
            dailySellAmount[_user] = _amount;
        } else {
            dailySellAmount[_user] += _amount;
        }
    }
    
    // Internal Functions
    
    function _calculateClaimableAmount(uint256 _phaseId, address _user)
        internal
        view
        returns (uint256)
    {
        UserAllocation memory allocation = allocations[_phaseId][_user];
        LaunchPhase memory phase = phases[_phaseId];
        
        if (block.timestamp < allocation.vestingStart) {
            return 0;
        }
        
        // Linear vesting
        uint256 elapsed = block.timestamp - allocation.vestingStart;
        uint256 duration = allocation.vestingEnd - allocation.vestingStart;
        
        uint256 vested = (allocation.allocatedAmount * elapsed) / duration;
        
        // Apply phase release percentage
        vested = (vested * phase.releasePercentage) / 100;
        
        // Return only unclaimed amount
        return vested > allocation.claimedAmount ? vested - allocation.claimedAmount : 0;
    }
}

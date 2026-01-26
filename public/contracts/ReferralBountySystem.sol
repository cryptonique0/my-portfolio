// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ReferralBountySystem
 * @notice Manages referral rewards and bounty system
 * @dev Users earn commissions for referring others with tiered rewards
 */
contract ReferralBountySystem is Ownable, ReentrancyGuard {
    
    struct Referrer {
        address referrer;
        uint256 totalReferrals;
        uint256 totalRewards;
        uint256 tier;
        bool active;
    }
    
    struct Referral {
        address referrer;
        address referee;
        uint256 airdropId;
        uint256 referralAmount;
        uint256 rewardAmount;
        uint256 timestamp;
        bool rewarded;
    }
    
    struct TierReward {
        uint256 minReferrals;
        uint256 rewardPercentage; // e.g., 5 = 5%
        uint256 bonusMultiplier; // e.g., 150 = 1.5x
    }
    
    mapping(address => Referrer) public referrers;
    mapping(uint256 => Referral) public referrals;
    mapping(address => uint256[]) public referrerReferrals;
    mapping(uint256 => TierReward) public tierRewards;
    
    uint256 public referralCount;
    uint256 public tierCount;
    address public rewardToken;
    
    event ReferrerRegistered(address indexed referrer);
    event ReferralCreated(
        uint256 indexed referralId,
        address indexed referrer,
        address indexed referee,
        uint256 amount
    );
    
    event RewardEarned(
        uint256 indexed referralId,
        address indexed referrer,
        uint256 rewardAmount
    );
    
    event TierUpdated(address indexed referrer, uint256 newTier);
    event TierRewardSet(uint256 indexed tier, uint256 percentage, uint256 multiplier);
    
    /**
     * @notice Register as a referrer
     */
    function registerAsReferrer() external {
        require(!referrers[msg.sender].active, "Already registered");
        
        referrers[msg.sender] = Referrer({
            referrer: msg.sender,
            totalReferrals: 0,
            totalRewards: 0,
            tier: 0,
            active: true
        });
        
        emit ReferrerRegistered(msg.sender);
    }
    
    /**
     * @notice Create a referral (when referee claims via referrer's link)
     * @param _referrer Referrer address
     * @param _referee Referee address
     * @param _airdropId Airdrop ID
     * @param _claimAmount Amount claimed by referee
     */
    function createReferral(
        address _referrer,
        address _referee,
        uint256 _airdropId,
        uint256 _claimAmount
    ) external onlyOwner returns (uint256) {
        require(_referrer != address(0), "Invalid referrer");
        require(_referee != address(0), "Invalid referee");
        require(_claimAmount > 0, "Invalid amount");
        require(referrers[_referrer].active, "Referrer not registered");
        
        uint256 referralId = referralCount++;
        
        // Calculate reward based on tier
        uint256 baseRewardPercentage = tierRewards[referrers[_referrer].tier].rewardPercentage;
        uint256 rewardAmount = (_claimAmount * baseRewardPercentage) / 100;
        
        referrals[referralId] = Referral({
            referrer: _referrer,
            referee: _referee,
            airdropId: _airdropId,
            referralAmount: _claimAmount,
            rewardAmount: rewardAmount,
            timestamp: block.timestamp,
            rewarded: false
        });
        
        referrerReferrals[_referrer].push(referralId);
        referrers[_referrer].totalReferrals++;
        
        _updateReferrerTier(_referrer);
        
        emit ReferralCreated(referralId, _referrer, _referee, _claimAmount);
        
        return referralId;
    }
    
    /**
     * @notice Claim referral reward
     * @param _referralId Referral ID
     */
    function claimReferralReward(uint256 _referralId) external nonReentrant {
        require(_referralId < referralCount, "Invalid referral");
        
        Referral storage referral = referrals[_referralId];
        require(msg.sender == referral.referrer, "Not referrer");
        require(!referral.rewarded, "Already rewarded");
        
        referral.rewarded = true;
        referrers[msg.sender].totalRewards += referral.rewardAmount;
        
        if (rewardToken != address(0)) {
            require(
                IERC20(rewardToken).transfer(msg.sender, referral.rewardAmount),
                "Transfer failed"
            );
        }
        
        emit RewardEarned(_referralId, msg.sender, referral.rewardAmount);
    }
    
    /**
     * @notice Batch claim referral rewards
     * @param _referralIds Array of referral IDs
     */
    function batchClaimRewards(uint256[] calldata _referralIds) external nonReentrant {
        require(_referralIds.length <= 100, "Too many referrals");
        
        uint256 totalReward = 0;
        
        for (uint256 i = 0; i < _referralIds.length; i++) {
            uint256 referralId = _referralIds[i];
            require(referralId < referralCount, "Invalid referral");
            
            Referral storage referral = referrals[referralId];
            require(msg.sender == referral.referrer, "Not referrer");
            require(!referral.rewarded, "Already rewarded");
            
            referral.rewarded = true;
            totalReward += referral.rewardAmount;
            
            emit RewardEarned(referralId, msg.sender, referral.rewardAmount);
        }
        
        referrers[msg.sender].totalRewards += totalReward;
        
        if (rewardToken != address(0)) {
            require(
                IERC20(rewardToken).transfer(msg.sender, totalReward),
                "Transfer failed"
            );
        }
    }
    
    /**
     * @notice Set tier rewards
     * @param _tier Tier number
     * @param _minReferrals Minimum referrals for this tier
     * @param _rewardPercentage Reward percentage
     * @param _bonusMultiplier Bonus multiplier
     */
    function setTierReward(
        uint256 _tier,
        uint256 _minReferrals,
        uint256 _rewardPercentage,
        uint256 _bonusMultiplier
    ) external onlyOwner {
        tierRewards[_tier] = TierReward({
            minReferrals: _minReferrals,
            rewardPercentage: _rewardPercentage,
            bonusMultiplier: _bonusMultiplier
        });
        
        if (_tier >= tierCount) {
            tierCount = _tier + 1;
        }
        
        emit TierRewardSet(_tier, _rewardPercentage, _bonusMultiplier);
    }
    
    /**
     * @notice Set reward token address
     * @param _token Token contract address
     */
    function setRewardToken(address _token) external onlyOwner {
        require(_token != address(0), "Invalid token");
        rewardToken = _token;
    }
    
    /**
     * @notice Get referrer details
     * @param _referrer Referrer address
     */
    function getReferrerDetails(address _referrer)
        external
        view
        returns (Referrer memory)
    {
        return referrers[_referrer];
    }
    
    /**
     * @notice Get referral details
     * @param _referralId Referral ID
     */
    function getReferralDetails(uint256 _referralId)
        external
        view
        returns (Referral memory)
    {
        require(_referralId < referralCount, "Invalid referral");
        return referrals[_referralId];
    }
    
    /**
     * @notice Get referrer's referrals
     * @param _referrer Referrer address
     */
    function getReferrerReferrals(address _referrer)
        external
        view
        returns (uint256[] memory)
    {
        return referrerReferrals[_referrer];
    }
    
    /**
     * @notice Get tier reward details
     * @param _tier Tier number
     */
    function getTierReward(uint256 _tier)
        external
        view
        returns (TierReward memory)
    {
        return tierRewards[_tier];
    }
    
    /**
     * @notice Check referrer status
     * @param _referrer Referrer address
     */
    function isReferrerActive(address _referrer) external view returns (bool) {
        return referrers[_referrer].active;
    }
    
    // Internal Functions
    
    function _updateReferrerTier(address _referrer) internal {
        Referrer storage referrer = referrers[_referrer];
        uint256 currentTier = referrer.tier;
        
        for (uint256 i = tierCount - 1; i >= 0; i--) {
            if (referrer.totalReferrals >= tierRewards[i].minReferrals) {
                if (i > currentTier) {
                    referrer.tier = i;
                    emit TierUpdated(_referrer, i);
                }
                break;
            }
        }
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ChainAggregator
 * @dev Single contract managing multi-chain airdrop campaigns
 * Coordinates airdrops across multiple blockchain networks
 */
contract ChainAggregator is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // Chain identifiers
    enum Chain {
        ETHEREUM,
        ARBITRUM,
        OPTIMISM,
        POLYGON,
        AVALANCHE,
        BASE
    }

    // Campaign structure
    struct AirdropCampaign {
        uint256 campaignId;
        string name;
        address token;
        uint256 totalAllocation;
        uint256 totalClaimed;
        uint256 startTime;
        uint256 endTime;
        address creator;
        bool active;
        bool finalized;
        mapping(Chain => uint256) chainAllocations;
        mapping(Chain => uint256) chainClaimed;
    }

    // Multi-chain recipient structure
    struct MultiChainRecipient {
        address recipient;
        uint256 totalAmount;
        mapping(Chain => uint256) chainAmounts;
        mapping(Chain => bool) chainClaimed;
    }

    // Cross-chain campaign structure
    struct CrossChainCampaign {
        uint256 campaignId;
        string name;
        address creator;
        uint256 startTime;
        uint256 endTime;
        bool active;
        mapping(Chain => uint256) chainAllocations;
        mapping(Chain => address) chainTokens;
        mapping(Chain => uint256) chainClaimed;
        address[] allChains;
    }

    // State variables
    mapping(uint256 => AirdropCampaign) public campaigns;
    mapping(uint256 => mapping(address => MultiChainRecipient)) public recipients;
    mapping(uint256 => mapping(Chain => bool)) public chainSupported;
    mapping(address => uint256[]) public creatorCampaigns;
    mapping(address => uint256[]) public userCampaigns;

    uint256 public campaignCounter = 1;
    uint256 public totalDistributed;

    // Events
    event CampaignCreated(
        uint256 indexed campaignId,
        string name,
        address indexed creator,
        address token,
        uint256 totalAllocation
    );

    event ChainAllocationSet(
        uint256 indexed campaignId,
        Chain indexed chain,
        uint256 allocation
    );

    event AirdropClaimed(
        uint256 indexed campaignId,
        address indexed recipient,
        Chain indexed chain,
        uint256 amount
    );

    event CampaignFinalized(
        uint256 indexed campaignId,
        uint256 totalClaimed
    );

    event MultiChainAirdropSet(
        uint256 indexed campaignId,
        address indexed recipient,
        uint256 totalAmount
    );

    /**
     * @dev Create a new multi-chain airdrop campaign
     */
    function createCampaign(
        string calldata name,
        address token,
        uint256 totalAllocation,
        uint256 startTime,
        uint256 endTime
    )
        external
        returns (uint256 campaignId)
    {
        require(token != address(0), "Invalid token");
        require(totalAllocation > 0, "Invalid allocation");
        require(startTime < endTime, "Invalid time range");
        require(endTime > block.timestamp, "End time in past");

        campaignId = campaignCounter++;
        AirdropCampaign storage campaign = campaigns[campaignId];

        campaign.campaignId = campaignId;
        campaign.name = name;
        campaign.token = token;
        campaign.totalAllocation = totalAllocation;
        campaign.startTime = startTime;
        campaign.endTime = endTime;
        campaign.creator = msg.sender;
        campaign.active = true;

        // Transfer tokens from creator to contract
        IERC20(token).safeTransferFrom(
            msg.sender,
            address(this),
            totalAllocation
        );

        creatorCampaigns[msg.sender].push(campaignId);

        emit CampaignCreated(
            campaignId,
            name,
            msg.sender,
            token,
            totalAllocation
        );
    }

    /**
     * @dev Set allocation for a specific chain
     */
    function setChainAllocation(
        uint256 campaignId,
        Chain chain,
        uint256 allocation
    )
        external
        onlyOwner
    {
        require(campaigns[campaignId].creator != address(0), "Invalid campaign");
        require(!campaigns[campaignId].finalized, "Campaign finalized");
        require(allocation > 0, "Invalid allocation");

        campaigns[campaignId].chainAllocations[chain] = allocation;
        chainSupported[campaignId][chain] = true;

        emit ChainAllocationSet(campaignId, chain, allocation);
    }

    /**
     * @dev Set airdrop for a recipient across multiple chains
     */
    function setMultiChainAirdrop(
        uint256 campaignId,
        address recipient,
        Chain[] calldata chains,
        uint256[] calldata amounts
    )
        external
        onlyOwner
    {
        require(campaigns[campaignId].creator != address(0), "Invalid campaign");
        require(!campaigns[campaignId].finalized, "Campaign finalized");
        require(chains.length == amounts.length, "Array length mismatch");
        require(recipient != address(0), "Invalid recipient");

        MultiChainRecipient storage multiRecipient = recipients[campaignId][recipient];
        multiRecipient.recipient = recipient;

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < chains.length; i++) {
            require(chainSupported[campaignId][chains[i]], "Chain not supported");
            require(amounts[i] > 0, "Invalid amount");

            multiRecipient.chainAmounts[chains[i]] = amounts[i];
            totalAmount += amounts[i];
        }

        multiRecipient.totalAmount = totalAmount;
        userCampaigns[recipient].push(campaignId);

        emit MultiChainAirdropSet(campaignId, recipient, totalAmount);
    }

    /**
     * @dev Claim airdrop on a specific chain
     */
    function claimAirdrop(
        uint256 campaignId,
        Chain chain
    )
        external
        nonReentrant
        whenNotPaused
        returns (uint256 claimAmount)
    {
        require(campaigns[campaignId].creator != address(0), "Invalid campaign");
        require(campaigns[campaignId].active, "Campaign inactive");

        AirdropCampaign storage campaign = campaigns[campaignId];
        require(block.timestamp >= campaign.startTime, "Campaign not started");
        require(block.timestamp <= campaign.endTime, "Campaign ended");

        MultiChainRecipient storage recipient = recipients[campaignId][msg.sender];
        require(recipient.recipient == msg.sender, "Not eligible");
        require(!recipient.chainClaimed[chain], "Already claimed on this chain");
        require(recipient.chainAmounts[chain] > 0, "No allocation on this chain");

        claimAmount = recipient.chainAmounts[chain];

        // Mark as claimed
        recipient.chainClaimed[chain] = true;
        campaign.chainClaimed[chain] += claimAmount;
        campaign.totalClaimed += claimAmount;

        // Transfer tokens
        IERC20(campaign.token).safeTransfer(msg.sender, claimAmount);

        totalDistributed += claimAmount;

        emit AirdropClaimed(campaignId, msg.sender, chain, claimAmount);
    }

    /**
     * @dev Claim airdrop across all chains in a single transaction
     */
    function claimMultiChainAirdrop(
        uint256 campaignId,
        Chain[] calldata chains
    )
        external
        nonReentrant
        whenNotPaused
        returns (uint256 totalClaimed)
    {
        require(campaigns[campaignId].creator != address(0), "Invalid campaign");
        require(campaigns[campaignId].active, "Campaign inactive");

        AirdropCampaign storage campaign = campaigns[campaignId];
        MultiChainRecipient storage recipient = recipients[campaignId][msg.sender];

        require(recipient.recipient == msg.sender, "Not eligible");

        for (uint256 i = 0; i < chains.length; i++) {
            if (!recipient.chainClaimed[chains[i]] && recipient.chainAmounts[chains[i]] > 0) {
                uint256 amount = recipient.chainAmounts[chains[i]];
                recipient.chainClaimed[chains[i]] = true;
                campaign.chainClaimed[chains[i]] += amount;
                campaign.totalClaimed += amount;
                totalClaimed += amount;

                emit AirdropClaimed(campaignId, msg.sender, chains[i], amount);
            }
        }

        require(totalClaimed > 0, "Nothing to claim");

        // Transfer all tokens at once
        IERC20(campaign.token).safeTransfer(msg.sender, totalClaimed);
        totalDistributed += totalClaimed;
    }

    /**
     * @dev Finalize campaign and recover unclaimed tokens
     */
    function finalizeCampaign(uint256 campaignId)
        external
        onlyOwner
        nonReentrant
    {
        require(campaigns[campaignId].creator != address(0), "Invalid campaign");
        require(!campaigns[campaignId].finalized, "Already finalized");

        AirdropCampaign storage campaign = campaigns[campaignId];
        require(block.timestamp > campaign.endTime, "Campaign still active");

        campaign.finalized = true;
        campaign.active = false;

        // Return unclaimed tokens to creator
        uint256 unclaimedAmount = campaign.totalAllocation - campaign.totalClaimed;
        if (unclaimedAmount > 0) {
            IERC20(campaign.token).safeTransfer(campaign.creator, unclaimedAmount);
        }

        emit CampaignFinalized(campaignId, campaign.totalClaimed);
    }

    /**
     * @dev Get campaign details
     */
    function getCampaignInfo(uint256 campaignId)
        external
        view
        returns (
            string memory name,
            address token,
            uint256 totalAllocation,
            uint256 totalClaimed,
            uint256 startTime,
            uint256 endTime,
            bool active,
            bool finalized
        )
    {
        AirdropCampaign storage campaign = campaigns[campaignId];
        return (
            campaign.name,
            campaign.token,
            campaign.totalAllocation,
            campaign.totalClaimed,
            campaign.startTime,
            campaign.endTime,
            campaign.active,
            campaign.finalized
        );
    }

    /**
     * @dev Get chain allocation for campaign
     */
    function getChainAllocation(uint256 campaignId, Chain chain)
        external
        view
        returns (uint256)
    {
        return campaigns[campaignId].chainAllocations[chain];
    }

    /**
     * @dev Get recipient's allocation across chains
     */
    function getRecipientAllocation(uint256 campaignId, address recipient, Chain[] calldata chains)
        external
        view
        returns (uint256[] memory)
    {
        MultiChainRecipient storage multiRecipient = recipients[campaignId][recipient];
        uint256[] memory allocations = new uint256[](chains.length);

        for (uint256 i = 0; i < chains.length; i++) {
            allocations[i] = multiRecipient.chainAmounts[chains[i]];
        }

        return allocations;
    }

    /**
     * @dev Check if user has claimed on a specific chain
     */
    function hasClaimed(uint256 campaignId, address user, Chain chain)
        external
        view
        returns (bool)
    {
        return recipients[campaignId][user].chainClaimed[chain];
    }

    /**
     * @dev Get user's campaigns
     */
    function getUserCampaigns(address user)
        external
        view
        returns (uint256[] memory)
    {
        return userCampaigns[user];
    }

    /**
     * @dev Get creator's campaigns
     */
    function getCreatorCampaigns(address creator)
        external
        view
        returns (uint256[] memory)
    {
        return creatorCampaigns[creator];
    }

    /**
     * @dev Pause aggregator
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Resume aggregator
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}

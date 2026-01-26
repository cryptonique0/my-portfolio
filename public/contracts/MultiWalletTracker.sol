// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title MultiWalletTracker
 * @dev Tracks multiple wallets across different chains and campaigns
 * Enables comprehensive portfolio monitoring and analytics
 */

contract MultiWalletTracker is Ownable, ReentrancyGuard {
    
    // Structs
    struct WalletProfile {
        address walletAddress;
        string name;
        uint256 createdAt;
        bool isActive;
        uint256 totalCampaigns;
        uint256 totalClaimed;
    }

    struct WalletCampaignData {
        uint256 campaignId;
        address token;
        uint256 allocatedAmount;
        uint256 claimedAmount;
        uint256 pendingAmount;
        uint16 chainId;
        uint256 claimDate;
        bool isClaimed;
    }

    struct WalletPortfolio {
        address wallet;
        uint256 totalBalance;
        uint256 totalAllocated;
        uint256 totalClaimed;
        uint256 totalPending;
        uint256 numCampaigns;
        uint256 numChains;
    }

    struct ChainAllocation {
        uint16 chainId;
        uint256 totalAmount;
        uint256 claimedAmount;
        uint256 numCampaigns;
    }

    struct PortfolioSnapshot {
        address wallet;
        uint256 timestamp;
        uint256 totalValue;
        uint256 claimedValue;
        uint256 pendingValue;
    }

    // State variables
    mapping(address => WalletProfile) public walletProfiles;
    mapping(address => address[]) public watchlists; // owner => tracked wallets
    mapping(address => WalletCampaignData[]) public walletCampaigns;
    mapping(address => PortfolioSnapshot[]) public portfolioHistory;
    mapping(address => ChainAllocation[]) public chainAllocations;

    address[] public allTrackedWallets;
    mapping(address => bool) public isTracked;
    mapping(address => mapping(address => bool)) public isInWatchlist;

    uint256 public walletCount = 0;
    uint256 public snapshotInterval = 1 days;
    uint256 public maxWalletsPerUser = 50;

    // Events
    event WalletProfileCreated(
        address indexed wallet,
        string name,
        uint256 timestamp
    );

    event WalletAddedToWatchlist(
        address indexed owner,
        address indexed wallet,
        uint256 timestamp
    );

    event WalletRemovedFromWatchlist(
        address indexed owner,
        address indexed wallet,
        uint256 timestamp
    );

    event CampaignDataTracked(
        address indexed wallet,
        uint256 indexed campaignId,
        uint256 allocatedAmount,
        uint16 chainId
    );

    event ClaimRecorded(
        address indexed wallet,
        uint256 indexed campaignId,
        uint256 claimedAmount,
        uint256 timestamp
    );

    event PortfolioSnapshotCreated(
        address indexed wallet,
        uint256 totalValue,
        uint256 claimedValue,
        uint256 pendingValue
    );

    event WalletProfileUpdated(
        address indexed wallet,
        string newName,
        uint256 timestamp
    );

    // Modifiers
    modifier validWallet(address wallet) {
        require(wallet != address(0), "Invalid wallet address");
        _;
    }

    modifier profileExists(address wallet) {
        require(walletProfiles[wallet].walletAddress != address(0), "Profile does not exist");
        _;
    }

    /**
     * @dev Create or update wallet profile
     */
    function createProfile(
        address walletAddress,
        string calldata name
    )
        external
        validWallet(walletAddress)
    {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(name).length <= 50, "Name too long");

        WalletProfile storage profile = walletProfiles[walletAddress];

        if (profile.walletAddress == address(0)) {
            profile.walletAddress = walletAddress;
            profile.createdAt = block.timestamp;
            profile.isActive = true;
            allTrackedWallets.push(walletAddress);
            isTracked[walletAddress] = true;
            walletCount++;

            emit WalletProfileCreated(walletAddress, name, block.timestamp);
        } else {
            emit WalletProfileUpdated(walletAddress, name, block.timestamp);
        }

        profile.name = name;
    }

    /**
     * @dev Add wallet to personal watchlist
     */
    function addToWatchlist(address walletToWatch)
        external
        validWallet(walletToWatch)
        nonReentrant
    {
        require(msg.sender != walletToWatch, "Cannot watch own wallet");
        require(!isInWatchlist[msg.sender][walletToWatch], "Already in watchlist");
        require(
            watchlists[msg.sender].length < maxWalletsPerUser,
            "Watchlist full"
        );

        watchlists[msg.sender].push(walletToWatch);
        isInWatchlist[msg.sender][walletToWatch] = true;

        // Create profile if doesn't exist
        if (walletProfiles[walletToWatch].walletAddress == address(0)) {
            createProfile(walletToWatch, "");
        }

        emit WalletAddedToWatchlist(msg.sender, walletToWatch, block.timestamp);
    }

    /**
     * @dev Remove wallet from watchlist
     */
    function removeFromWatchlist(address walletToRemove)
        external
        nonReentrant
    {
        require(isInWatchlist[msg.sender][walletToRemove], "Not in watchlist");

        isInWatchlist[msg.sender][walletToRemove] = false;

        // Remove from array
        address[] storage list = watchlists[msg.sender];
        for (uint256 i = 0; i < list.length; i++) {
            if (list[i] == walletToRemove) {
                list[i] = list[list.length - 1];
                list.pop();
                break;
            }
        }

        emit WalletRemovedFromWatchlist(msg.sender, walletToRemove, block.timestamp);
    }

    /**
     * @dev Track campaign data for a wallet
     */
    function trackCampaignData(
        address wallet,
        uint256 campaignId,
        address token,
        uint256 allocatedAmount,
        uint256 claimedAmount,
        uint16 chainId
    )
        external
        validWallet(wallet)
        onlyOwner
    {
        require(allocatedAmount > 0, "Invalid amount");

        WalletCampaignData memory campaignData = WalletCampaignData({
            campaignId: campaignId,
            token: token,
            allocatedAmount: allocatedAmount,
            claimedAmount: claimedAmount,
            pendingAmount: allocatedAmount - claimedAmount,
            chainId: chainId,
            claimDate: claimedAmount > 0 ? block.timestamp : 0,
            isClaimed: claimedAmount >= allocatedAmount
        });

        walletCampaigns[wallet].push(campaignData);

        // Update chain allocation
        _updateChainAllocation(wallet, chainId, allocatedAmount, claimedAmount);

        // Update profile
        WalletProfile storage profile = walletProfiles[wallet];
        if (profile.walletAddress == address(0)) {
            createProfile(wallet, "");
        }
        profile.totalCampaigns++;
        profile.totalClaimed += claimedAmount;

        emit CampaignDataTracked(wallet, campaignId, allocatedAmount, chainId);
    }

    /**
     * @dev Record claim event
     */
    function recordClaim(
        address wallet,
        uint256 campaignId,
        uint256 claimedAmount
    )
        external
        profileExists(wallet)
        onlyOwner
    {
        require(claimedAmount > 0, "Invalid claim amount");

        WalletCampaignData[] storage campaigns = walletCampaigns[wallet];
        bool found = false;

        for (uint256 i = 0; i < campaigns.length; i++) {
            if (campaigns[i].campaignId == campaignId) {
                campaigns[i].claimedAmount += claimedAmount;
                campaigns[i].pendingAmount = campaigns[i].allocatedAmount - campaigns[i].claimedAmount;
                campaigns[i].isClaimed = campaigns[i].claimedAmount >= campaigns[i].allocatedAmount;
                campaigns[i].claimDate = block.timestamp;
                found = true;
                break;
            }
        }

        require(found, "Campaign not found for wallet");

        // Update profile
        walletProfiles[wallet].totalClaimed += claimedAmount;

        emit ClaimRecorded(wallet, campaignId, claimedAmount, block.timestamp);
    }

    /**
     * @dev Get portfolio overview
     */
    function getPortfolio(address wallet)
        external
        view
        profileExists(wallet)
        returns (WalletPortfolio memory)
    {
        WalletCampaignData[] memory campaigns = walletCampaigns[wallet];
        uint256 totalAllocated = 0;
        uint256 totalClaimed = 0;
        uint256 chainsSet = 0;
        uint16 lastChain = 0;

        for (uint256 i = 0; i < campaigns.length; i++) {
            totalAllocated += campaigns[i].allocatedAmount;
            totalClaimed += campaigns[i].claimedAmount;

            if (campaigns[i].chainId != lastChain) {
                lastChain = campaigns[i].chainId;
                chainsSet++;
            }
        }

        return WalletPortfolio({
            wallet: wallet,
            totalBalance: 0, // Would require price oracle
            totalAllocated: totalAllocated,
            totalClaimed: totalClaimed,
            totalPending: totalAllocated - totalClaimed,
            numCampaigns: campaigns.length,
            numChains: chainsSet
        });
    }

    /**
     * @dev Create portfolio snapshot
     */
    function createSnapshot(address wallet)
        external
        profileExists(wallet)
        nonReentrant
    {
        WalletCampaignData[] memory campaigns = walletCampaigns[wallet];
        uint256 totalValue = 0;
        uint256 claimedValue = 0;
        uint256 pendingValue = 0;

        for (uint256 i = 0; i < campaigns.length; i++) {
            totalValue += campaigns[i].allocatedAmount;
            claimedValue += campaigns[i].claimedAmount;
            pendingValue += campaigns[i].pendingAmount;
        }

        PortfolioSnapshot memory snapshot = PortfolioSnapshot({
            wallet: wallet,
            timestamp: block.timestamp,
            totalValue: totalValue,
            claimedValue: claimedValue,
            pendingValue: pendingValue
        });

        portfolioHistory[wallet].push(snapshot);

        emit PortfolioSnapshotCreated(wallet, totalValue, claimedValue, pendingValue);
    }

    /**
     * @dev Get campaign count for wallet
     */
    function getCampaignCount(address wallet)
        external
        view
        returns (uint256)
    {
        return walletCampaigns[wallet].length;
    }

    /**
     * @dev Get campaign data by index
     */
    function getCampaignData(address wallet, uint256 index)
        external
        view
        returns (WalletCampaignData memory)
    {
        require(index < walletCampaigns[wallet].length, "Index out of bounds");
        return walletCampaigns[wallet][index];
    }

    /**
     * @dev Get all campaigns for wallet
     */
    function getAllCampaigns(address wallet)
        external
        view
        returns (WalletCampaignData[] memory)
    {
        return walletCampaigns[wallet];
    }

    /**
     * @dev Get watchlist
     */
    function getWatchlist(address owner)
        external
        view
        returns (address[] memory)
    {
        return watchlists[owner];
    }

    /**
     * @dev Get watchlist size
     */
    function getWatchlistSize(address owner)
        external
        view
        returns (uint256)
    {
        return watchlists[owner].length;
    }

    /**
     * @dev Get portfolio history
     */
    function getPortfolioHistory(address wallet)
        external
        view
        returns (PortfolioSnapshot[] memory)
    {
        return portfolioHistory[wallet];
    }

    /**
     * @dev Get all tracked wallets
     */
    function getAllTrackedWallets()
        external
        view
        returns (address[] memory)
    {
        return allTrackedWallets;
    }

    /**
     * @dev Get tracked wallet count
     */
    function getTrackedWalletCount()
        external
        view
        returns (uint256)
    {
        return walletCount;
    }

    /**
     * @dev Update max wallets per user
     */
    function setMaxWalletsPerUser(uint256 newMax)
        external
        onlyOwner
    {
        require(newMax > 0, "Max must be greater than 0");
        maxWalletsPerUser = newMax;
    }

    /**
     * @dev Internal: Update chain allocation
     */
    function _updateChainAllocation(
        address wallet,
        uint16 chainId,
        uint256 allocatedAmount,
        uint256 claimedAmount
    )
        internal
    {
        ChainAllocation[] storage allocations = chainAllocations[wallet];
        bool found = false;

        for (uint256 i = 0; i < allocations.length; i++) {
            if (allocations[i].chainId == chainId) {
                allocations[i].totalAmount += allocatedAmount;
                allocations[i].claimedAmount += claimedAmount;
                allocations[i].numCampaigns++;
                found = true;
                break;
            }
        }

        if (!found) {
            allocations.push(ChainAllocation({
                chainId: chainId,
                totalAmount: allocatedAmount,
                claimedAmount: claimedAmount,
                numCampaigns: 1
            }));
        }
    }

    /**
     * @dev Get chain allocations for wallet
     */
    function getChainAllocations(address wallet)
        external
        view
        returns (ChainAllocation[] memory)
    {
        return chainAllocations[wallet];
    }

    /**
     * @dev Deactivate wallet profile
     */
    function deactivateProfile(address wallet)
        external
        onlyOwner
        profileExists(wallet)
    {
        walletProfiles[wallet].isActive = false;
    }

    /**
     * @dev Activate wallet profile
     */
    function activateProfile(address wallet)
        external
        onlyOwner
        profileExists(wallet)
    {
        walletProfiles[wallet].isActive = true;
    }

    /**
     * @dev Get wallet profile
     */
    function getProfile(address wallet)
        external
        view
        profileExists(wallet)
        returns (WalletProfile memory)
    {
        return walletProfiles[wallet];
    }
}

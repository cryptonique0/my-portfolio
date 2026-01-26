// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ETHAirdropManager
 * @dev Native ETH airdrop support - NEW FEATURE FOR BASE
 * Manage airdrops of native ETH directly on Base chain
 */
contract ETHAirdropManager is Ownable, ReentrancyGuard {
    // Custom errors
    error NotWhitelisted();
    error AlreadyClaimed();
    error AirdropNotActive();
    error AirdropNotFound();
    error InvalidAmount();

    // Events
    event ETHAirdropCreated(
        uint256 indexed airdropId,
        uint256 totalAmount,
        uint256 startTime,
        uint256 endTime
    );
    event ETHAllocationSet(
        uint256 indexed airdropId,
        address indexed recipient,
        uint256 amount
    );
    event ETHClaimed(
        uint256 indexed airdropId,
        address indexed recipient,
        uint256 amount
    );
    event ETHDeposited(
        uint256 indexed airdropId,
        uint256 amount,
        uint256 timestamp
    );

    // Data structures
    struct ETHAirdrop {
        uint256 totalAmount;
        uint256 claimedAmount;
        uint256 startTime;
        uint256 endTime;
        bool active;
        address creator;
    }

    struct ClaimInfo {
        bool claimed;
        uint256 amount;
        uint256 claimTime;
    }

    // State variables
    uint256 private ethAirdropCounter;
    mapping(uint256 => ETHAirdrop) private ethAirdrops;
    mapping(uint256 => mapping(address => ClaimInfo)) private ethClaims;
    mapping(uint256 => mapping(address => uint256)) private ethAllocations;

    constructor() Ownable(msg.sender) {}

    // ==================== Read-Only Functions ====================

    /**
     * @dev Get ETH airdrop details
     */
    function getETHAirdrop(uint256 airdropId)
        public
        view
        returns (ETHAirdrop memory)
    {
        require(ethAirdrops[airdropId].creator != address(0), "Airdrop not found");
        return ethAirdrops[airdropId];
    }

    /**
     * @dev Get ETH allocation for address
     */
    function getETHAllocation(uint256 airdropId, address recipient)
        public
        view
        returns (uint256)
    {
        return ethAllocations[airdropId][recipient];
    }

    /**
     * @dev Check if address has claimed ETH
     */
    function hasETHClaimed(uint256 airdropId, address recipient)
        public
        view
        returns (ClaimInfo memory)
    {
        return ethClaims[airdropId][recipient];
    }

    /**
     * @dev Check if ETH airdrop is active
     */
    function isETHAirdropActive(uint256 airdropId) public view returns (bool) {
        ETHAirdrop memory airdrop = ethAirdrops[airdropId];
        return (airdrop.active &&
            block.timestamp >= airdrop.startTime &&
            block.timestamp <= airdrop.endTime);
    }

    /**
     * @dev Get airdrop counter
     */
    function getETHAirdropCounter() public view returns (uint256) {
        return ethAirdropCounter;
    }

    // ==================== Public Functions ====================

    /**
     * @dev Create a new ETH airdrop (with ETH deposit)
     */
    function createETHAirdrop(
        uint256 startTime,
        uint256 endTime
    ) public payable onlyOwner returns (uint256) {
        require(msg.value > 0, "Must deposit ETH");
        require(startTime < endTime, "Invalid time range");
        require(startTime >= block.timestamp, "Start time must be future");

        ethAirdropCounter++;
        uint256 newAirdropId = ethAirdropCounter;

        ethAirdrops[newAirdropId] = ETHAirdrop({
            totalAmount: msg.value,
            claimedAmount: 0,
            startTime: startTime,
            endTime: endTime,
            active: true,
            creator: msg.sender
        });

        emit ETHAirdropCreated(newAirdropId, msg.value, startTime, endTime);
        emit ETHDeposited(newAirdropId, msg.value, block.timestamp);

        return newAirdropId;
    }

    /**
     * @dev Deposit additional ETH to an airdrop
     */
    function depositETH(uint256 airdropId) public payable onlyOwner {
        require(ethAirdrops[airdropId].creator != address(0), "Airdrop not found");
        require(msg.value > 0, "Must deposit ETH");

        ethAirdrops[airdropId].totalAmount += msg.value;

        emit ETHDeposited(airdropId, msg.value, block.timestamp);
    }

    /**
     * @dev Set ETH allocation for recipient
     */
    function setETHAllocation(
        uint256 airdropId,
        address recipient,
        uint256 amount
    ) public onlyOwner {
        require(ethAirdrops[airdropId].creator != address(0), "Airdrop not found");
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");

        ethAllocations[airdropId][recipient] = amount;

        emit ETHAllocationSet(airdropId, recipient, amount);
    }

    /**
     * @dev Batch set ETH allocations
     */
    function batchSetETHAllocations(
        uint256 airdropId,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) public onlyOwner {
        require(ethAirdrops[airdropId].creator != address(0), "Airdrop not found");
        require(recipients.length == amounts.length, "Length mismatch");
        require(recipients.length <= 500, "Too many recipients");

        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            require(amounts[i] > 0, "Invalid amount");
            ethAllocations[airdropId][recipients[i]] = amounts[i];
        }
    }

    /**
     * @dev Claim ETH from airdrop
     */
    function claimETH(uint256 airdropId) public nonReentrant {
        ETHAirdrop storage airdrop = ethAirdrops[airdropId];

        require(airdrop.creator != address(0), "Airdrop not found");
        require(isETHAirdropActive(airdropId), "Airdrop not active");
        require(!ethClaims[airdropId][msg.sender].claimed, "Already claimed");

        uint256 allocation = ethAllocations[airdropId][msg.sender];
        require(allocation > 0, "Not whitelisted");
        require(address(this).balance >= allocation, "Insufficient balance");

        // Mark as claimed
        ethClaims[airdropId][msg.sender] = ClaimInfo({
            claimed: true,
            amount: allocation,
            claimTime: block.timestamp
        });

        // Update claimed amount
        airdrop.claimedAmount += allocation;

        // Transfer ETH
        (bool success, ) = msg.sender.call{value: allocation}("");
        require(success, "ETH transfer failed");

        emit ETHClaimed(airdropId, msg.sender, allocation);
    }

    /**
     * @dev Deactivate ETH airdrop
     */
    function deactivateETHAirdrop(uint256 airdropId) public onlyOwner {
        require(ethAirdrops[airdropId].creator != address(0), "Airdrop not found");
        ethAirdrops[airdropId].active = false;
    }

    /**
     * @dev Recover unclaimed ETH (emergency only)
     */
    function recoverETH(uint256 amount) public onlyOwner nonReentrant {
        require(amount > 0, "Invalid amount");
        require(address(this).balance >= amount, "Insufficient balance");

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "ETH transfer failed");
    }

    // ==================== Fallback ====================

    receive() external payable {}
}

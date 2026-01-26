// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AirdropManager
 * @dev Manages token airdrops with whitelist verification and claim functionality
 */
contract AirdropManager is Ownable, ReentrancyGuard, Pausable {
    // Custom errors
    error NotWhitelisted();
    error AlreadyClaimed();
    error AirdropNotActive();
    error AirdropNotFound();
    error InsufficientBalance();
    error InvalidAmount();
    error ListLengthMismatch();

    // Events
    event AirdropCreated(
        uint256 indexed airdropId,
        address indexed tokenContract,
        uint256 totalAmount,
        uint256 startTime,
        uint256 endTime
    );
    event AllocationSet(
        uint256 indexed airdropId,
        address indexed recipient,
        uint256 amount
    );
    event TokensClaimed(
        uint256 indexed airdropId,
        address indexed recipient,
        uint256 amount
    );
    event AirdropDeactivated(uint256 indexed airdropId);
    event AirdropActivated(uint256 indexed airdropId);
    event BatchAllocationsSet(uint256 indexed airdropId, uint256 count);

    // Data structures
    struct Airdrop {
        address tokenContract;
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
    uint256 private airdropCounter;
    mapping(uint256 => Airdrop) private airdrops;
    mapping(uint256 => mapping(address => ClaimInfo)) private claims;
    mapping(uint256 => mapping(address => uint256)) private allocations;

    constructor() Ownable(msg.sender) {}

    // ==================== Read-Only Functions ====================

    /**
     * @dev Get airdrop details
     */
    function getAirdrop(uint256 airdropId)
        public
        view
        returns (Airdrop memory)
    {
        if (airdrops[airdropId].creator == address(0)) {
            revert AirdropNotFound();
        }
        return airdrops[airdropId];
    }

    /**
     * @dev Check if address has claimed
     */
    function hasClaimed(uint256 airdropId, address recipient)
        public
        view
        returns (ClaimInfo memory)
    {
        return claims[airdropId][recipient];
    }

    /**
     * @dev Get allocation amount for address
     */
    function getAllocation(uint256 airdropId, address recipient)
        public
        view
        returns (uint256)
    {
        return allocations[airdropId][recipient];
    }

    /**
     * @dev Check if airdrop is currently active (within time window)
     */
    function isAirdropActive(uint256 airdropId) public view returns (bool) {
        Airdrop memory airdrop = airdrops[airdropId];
        return (airdrop.active &&
            block.timestamp >= airdrop.startTime &&
            block.timestamp <= airdrop.endTime);
    }

    /**
     * @dev Get current airdrop counter
     */
    function getAirdropCounter() public view returns (uint256) {
        return airdropCounter;
    }

    // ==================== Public Functions ====================

    /**
     * @dev Create a new airdrop
     */
    function createAirdrop(
        address tokenContract,
        uint256 totalAmount,
        uint256 startTime,
        uint256 endTime
    ) public onlyOwner returns (uint256) {
        require(tokenContract != address(0), "Invalid token contract");
        require(totalAmount > 0, "Total amount must be greater than 0");
        require(startTime < endTime, "Invalid time range");
        require(
            startTime >= block.timestamp,
            "Start time must be in the future"
        );

        airdropCounter++;
        uint256 newAirdropId = airdropCounter;

        airdrops[newAirdropId] = Airdrop({
            tokenContract: tokenContract,
            totalAmount: totalAmount,
            claimedAmount: 0,
            startTime: startTime,
            endTime: endTime,
            active: true,
            creator: msg.sender
        });

        emit AirdropCreated(
            newAirdropId,
            tokenContract,
            totalAmount,
            startTime,
            endTime
        );

        return newAirdropId;
    }

    /**
     * @dev Set allocation for a single recipient
     */
    function setAllocation(
        uint256 airdropId,
        address recipient,
        uint256 amount
    ) public onlyOwner {
        require(airdrops[airdropId].creator != address(0), "Airdrop not found");
        require(amount > 0, "Amount must be greater than 0");
        require(recipient != address(0), "Invalid recipient");

        allocations[airdropId][recipient] = amount;

        emit AllocationSet(airdropId, recipient, amount);
    }

    /**
     * @dev Batch set allocations for multiple recipients
     */
    function batchSetAllocations(
        uint256 airdropId,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) public onlyOwner {
        require(airdrops[airdropId].creator != address(0), "Airdrop not found");
        require(
            recipients.length == amounts.length,
            "Length mismatch"
        );
        require(recipients.length <= 500, "Too many recipients");

        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            require(amounts[i] > 0, "Amount must be greater than 0");
            allocations[airdropId][recipients[i]] = amounts[i];
        }

        emit BatchAllocationsSet(airdropId, recipients.length);
    }

    /**
     * @dev Claim tokens from an airdrop
     */
    function claimTokens(uint256 airdropId) public nonReentrant whenNotPaused {
        Airdrop storage airdrop = airdrops[airdropId];

        require(airdrop.creator != address(0), "Airdrop not found");
        require(isAirdropActive(airdropId), "Airdrop not active");
        require(!claims[airdropId][msg.sender].claimed, "Already claimed");

        uint256 allocation = allocations[airdropId][msg.sender];
        require(allocation > 0, "Not whitelisted");

        // Mark as claimed
        claims[airdropId][msg.sender] = ClaimInfo({
            claimed: true,
            amount: allocation,
            claimTime: block.timestamp
        });

        // Update claimed amount
        airdrop.claimedAmount += allocation;

        // Transfer tokens
        require(
            IERC20(airdrop.tokenContract).transfer(msg.sender, allocation),
            "Transfer failed"
        );

        emit TokensClaimed(airdropId, msg.sender, allocation);
    }

    /**
     * @dev Pause the contract
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Deactivate an airdrop
     */
    function deactivateAirdrop(uint256 airdropId) public onlyOwner {
        require(airdrops[airdropId].creator != address(0), "Airdrop not found");
        airdrops[airdropId].active = false;
        emit AirdropDeactivated(airdropId);
    }

    /**
     * @dev Activate an airdrop
     */
    function activateAirdrop(uint256 airdropId) public onlyOwner {
        require(airdrops[airdropId].creator != address(0), "Airdrop not found");
        airdrops[airdropId].active = true;
        emit AirdropActivated(airdropId);
    }

    /**
     * @dev Recover tokens from contract (emergency only)
     */
    function recoverTokens(address token, uint256 amount) public onlyOwner {
        require(token != address(0), "Invalid token");
        require(amount > 0, "Invalid amount");
        require(
            IERC20(token).transfer(msg.sender, amount),
            "Transfer failed"
        );
    }
}

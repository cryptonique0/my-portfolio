// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title MultiTokenAirdropManager
 * @notice Enables distribution of any ERC20 token, not just a single token
 * @dev Supports unlimited ERC20 tokens with per-campaign configuration
 */
contract MultiTokenAirdropManager is Ownable, ReentrancyGuard, Pausable {
    
    struct TokenAirdrop {
        address tokenContract;
        string tokenName;
        uint8 tokenDecimals;
        uint256 totalTokens;
        uint256 claimedTokens;
        uint256 startTime;
        uint256 endTime;
        bool active;
    }
    
    struct TokenAllocation {
        uint256 airdropId;
        address recipient;
        uint256 amount;
        bool claimed;
    }
    
    mapping(uint256 => TokenAirdrop) public airdrops;
    mapping(uint256 => mapping(address => TokenAllocation)) public allocations;
    mapping(uint256 => mapping(address => bool)) public claimed;
    mapping(address => bool) public whitelistedTokens; // Optional token whitelist
    
    uint256 public airdropCounter;
    bool public requireTokenWhitelist;
    
    event TokenAirdropCreated(
        uint256 indexed airdropId,
        address indexed tokenContract,
        string tokenName,
        uint256 totalTokens,
        uint256 startTime
    );
    
    event TokenAllocated(
        uint256 indexed airdropId,
        address indexed recipient,
        uint256 amount
    );
    
    event TokenClaimed(
        uint256 indexed airdropId,
        address indexed recipient,
        uint256 amount
    );
    
    event TokenWhitelisted(address indexed tokenContract);
    event TokenRemovedFromWhitelist(address indexed tokenContract);
    event WhitelistRequirementToggled(bool required);
    
    /**
     * @notice Create a new multi-token airdrop
     * @param tokenContract Address of the ERC20 token to distribute
     * @param tokenName Name of the token (for display)
     * @param tokenDecimals Token decimals
     * @param totalTokens Total tokens to distribute
     * @param startTime Campaign start time
     * @param endTime Campaign end time
     * @return airdropId The ID of the created airdrop
     */
    function createTokenAirdrop(
        address tokenContract,
        string memory tokenName,
        uint8 tokenDecimals,
        uint256 totalTokens,
        uint256 startTime,
        uint256 endTime
    ) external onlyOwner returns (uint256) {
        require(tokenContract != address(0), "Invalid token contract");
        require(startTime < endTime, "Invalid time range");
        require(totalTokens > 0, "Must have at least 1 token");
        
        if (requireTokenWhitelist) {
            require(whitelistedTokens[tokenContract], "Token not whitelisted");
        }
        
        uint256 airdropId = airdropCounter++;
        
        airdrops[airdropId] = TokenAirdrop({
            tokenContract: tokenContract,
            tokenName: tokenName,
            tokenDecimals: tokenDecimals,
            totalTokens: totalTokens,
            claimedTokens: 0,
            startTime: startTime,
            endTime: endTime,
            active: true
        });
        
        emit TokenAirdropCreated(airdropId, tokenContract, tokenName, totalTokens, startTime);
        return airdropId;
    }
    
    /**
     * @notice Allocate tokens to recipients
     * @param airdropId The airdrop ID
     * @param recipients Array of recipient addresses
     * @param amounts Array of token amounts
     */
    function batchAllocateTokens(
        uint256 airdropId,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(recipients.length == amounts.length, "Array length mismatch");
        require(recipients.length <= 500, "Too many allocations");
        require(airdrops[airdropId].active, "Airdrop not active");
        
        TokenAirdrop storage airdrop = airdrops[airdropId];
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            require(amounts[i] > 0, "Invalid amount");
            
            allocations[airdropId][recipients[i]] = TokenAllocation({
                airdropId: airdropId,
                recipient: recipients[i],
                amount: amounts[i],
                claimed: false
            });
            
            emit TokenAllocated(airdropId, recipients[i], amounts[i]);
        }
    }
    
    /**
     * @notice Update allocation for a user (admin only)
     * @param airdropId The airdrop ID
     * @param recipient Recipient address
     * @param newAmount New allocation amount
     */
    function updateAllocation(
        uint256 airdropId,
        address recipient,
        uint256 newAmount
    ) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        require(newAmount > 0, "Invalid amount");
        require(!claimed[airdropId][recipient], "User already claimed");
        
        allocations[airdropId][recipient].amount = newAmount;
    }
    
    /**
     * @notice Claim allocated tokens
     * @param airdropId The airdrop ID
     */
    function claimTokens(uint256 airdropId) external nonReentrant whenNotPaused {
        require(!claimed[airdropId][msg.sender], "Already claimed");
        require(block.timestamp >= airdrops[airdropId].startTime, "Airdrop not started");
        require(block.timestamp <= airdrops[airdropId].endTime, "Airdrop ended");
        
        TokenAllocation memory allocation = allocations[airdropId][msg.sender];
        require(allocation.amount > 0, "No tokens allocated");
        
        TokenAirdrop storage airdrop = airdrops[airdropId];
        airdrop.claimedTokens += allocation.amount;
        claimed[airdropId][msg.sender] = true;
        
        require(
            IERC20(airdrop.tokenContract).transfer(msg.sender, allocation.amount),
            "Transfer failed"
        );
        
        emit TokenClaimed(airdropId, msg.sender, allocation.amount);
    }
    
    /**
     * @notice Get token allocation for a user
     * @param airdropId The airdrop ID
     * @param user User address
     * @return User's token allocation
     */
    function getTokenAllocation(uint256 airdropId, address user)
        external
        view
        returns (TokenAllocation memory)
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
        returns (TokenAirdrop memory)
    {
        return airdrops[airdropId];
    }
    
    /**
     * @notice Get claim rate for an airdrop
     * @param airdropId The airdrop ID
     * @return Percentage of tokens claimed (0-100)
     */
    function getClaimRate(uint256 airdropId) external view returns (uint256) {
        TokenAirdrop memory airdrop = airdrops[airdropId];
        if (airdrop.totalTokens == 0) return 0;
        return (airdrop.claimedTokens * 100) / airdrop.totalTokens;
    }
    
    /**
     * @notice Whitelist a token for airdrop creation
     * @param tokenContract Token address to whitelist
     */
    function whitelistToken(address tokenContract) external onlyOwner {
        require(tokenContract != address(0), "Invalid token");
        whitelistedTokens[tokenContract] = true;
        emit TokenWhitelisted(tokenContract);
    }
    
    /**
     * @notice Remove token from whitelist
     * @param tokenContract Token address to remove
     */
    function removeTokenFromWhitelist(address tokenContract) external onlyOwner {
        whitelistedTokens[tokenContract] = false;
        emit TokenRemovedFromWhitelist(tokenContract);
    }
    
    /**
     * @notice Toggle whether whitelist is required for new airdrops
     * @param required True to require whitelist, false to allow any token
     */
    function toggleWhitelistRequirement(bool required) external onlyOwner {
        requireTokenWhitelist = required;
        emit WhitelistRequirementToggled(required);
    }
    
    /**
     * @notice Check if a token is whitelisted
     * @param tokenContract Token address
     * @return True if whitelisted
     */
    function isTokenWhitelisted(address tokenContract) external view returns (bool) {
        return whitelistedTokens[tokenContract];
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
     * @notice Recover tokens from contract (emergency only)
     * @param tokenContract Token contract address
     * @param amount Amount to recover
     */
    function recoverTokens(address tokenContract, uint256 amount) external onlyOwner {
        require(
            IERC20(tokenContract).transfer(msg.sender, amount),
            "Transfer failed"
        );
    }
}

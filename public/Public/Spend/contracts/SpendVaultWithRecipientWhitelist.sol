// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./RecipientWhitelist.sol";

/**
 * @title SpendVaultWithRecipientWhitelist
 * @dev Enhanced SpendVault with recipient whitelist enforcement
 * @notice Only whitelisted recipients can receive funds (unless emergency mode active)
 */
contract SpendVaultWithRecipientWhitelist is Ownable, ReentrancyGuard, EIP712 {
    
    using ECDSA for bytes32;
    
    // ============ State Variables ============
    
    IERC721 public guardianToken;
    RecipientWhitelist public whitelistContract;
    uint256 public quorum;
    uint256 public nonce;
    bool public vaultFrozen;
    
    // Emergency unlock tracking
    uint256 public emergencyUnlockRequestTime;
    bool public emergencyUnlockRequested;
    
    // Constants
    uint256 constant EMERGENCY_UNLOCK_DELAY = 30 days;

    // ============ Events ============
    
    event Deposit(address indexed token, uint256 amount, uint256 timestamp);
    event Withdrawal(
        address indexed token,
        uint256 amount,
        address indexed recipient,
        string reason,
        uint256 timestamp
    );
    event QuorumUpdated(uint256 newQuorum, uint256 timestamp);
    event GuardianTokenUpdated(address newGuardianToken, uint256 timestamp);
    event VaultFrozen(uint256 timestamp);
    event VaultUnfrozen(uint256 timestamp);
    event EmergencyUnlockRequested(uint256 unlockTime, uint256 timestamp);
    event EmergencyUnlockExecuted(address indexed token, uint256 timestamp);
    event EmergencyUnlockCancelled(uint256 timestamp);
    event RecipientCheckPerformed(
        address indexed recipient,
        bool allowed,
        string reason,
        uint256 timestamp
    );

    // ============ Initialization ============
    
    constructor(
        address _guardianToken,
        address _whitelistContract,
        uint256 _quorum
    ) EIP712("SpendGuard", "1") {
        require(_guardianToken != address(0), "Invalid guardian token");
        require(_whitelistContract != address(0), "Invalid whitelist contract");
        require(_quorum > 0, "Quorum must be > 0");
        
        guardianToken = IERC721(_guardianToken);
        whitelistContract = RecipientWhitelist(_whitelistContract);
        quorum = _quorum;
    }

    // ============ Modifiers ============
    
    modifier vaultNotFrozen() {
        require(!vaultFrozen, "Vault is frozen");
        _;
    }
    
    modifier validGuardians(address[] memory guardians) {
        // Check for duplicate guardians
        for (uint256 i = 0; i < guardians.length; i++) {
            for (uint256 j = i + 1; j < guardians.length; j++) {
                require(guardians[i] != guardians[j], "Duplicate guardian signature");
            }
        }
        _;
    }

    // ============ Owner Functions ============
    
    /**
     * @notice Update quorum requirement
     * @param _newQuorum New quorum value
     */
    function setQuorum(uint256 _newQuorum) external onlyOwner {
        require(_newQuorum > 0, "Quorum must be > 0");
        quorum = _newQuorum;
        emit QuorumUpdated(_newQuorum, block.timestamp);
    }
    
    /**
     * @notice Update guardian token contract
     * @param _newGuardianToken New guardian token address
     */
    function updateGuardianToken(address _newGuardianToken) external onlyOwner {
        require(_newGuardianToken != address(0), "Invalid address");
        guardianToken = IERC721(_newGuardianToken);
        emit GuardianTokenUpdated(_newGuardianToken, block.timestamp);
    }
    
    /**
     * @notice Freeze the vault (no withdrawals allowed)
     */
    function freezeVault() external onlyOwner {
        vaultFrozen = true;
        emit VaultFrozen(block.timestamp);
    }
    
    /**
     * @notice Unfreeze the vault
     */
    function unfreezeVault() external onlyOwner {
        vaultFrozen = false;
        emit VaultUnfrozen(block.timestamp);
    }
    
    /**
     * @notice Request emergency unlock (30-day timelock)
     */
    function requestEmergencyUnlock() external onlyOwner {
        require(!emergencyUnlockRequested, "Emergency unlock already requested");
        emergencyUnlockRequested = true;
        emergencyUnlockRequestTime = block.timestamp + EMERGENCY_UNLOCK_DELAY;
        emit EmergencyUnlockRequested(emergencyUnlockRequestTime, block.timestamp);
    }
    
    /**
     * @notice Cancel emergency unlock request
     */
    function cancelEmergencyUnlock() external onlyOwner {
        require(emergencyUnlockRequested, "No emergency unlock requested");
        emergencyUnlockRequested = false;
        emit EmergencyUnlockCancelled(block.timestamp);
    }
    
    /**
     * @notice Execute emergency unlock withdrawal
     * @param token Token to withdraw
     */
    function executeEmergencyUnlock(address token) external onlyOwner nonReentrant {
        require(emergencyUnlockRequested, "No emergency unlock requested");
        require(block.timestamp >= emergencyUnlockRequestTime, "Emergency unlock not ready");
        
        uint256 balance = _getBalance(token);
        require(balance > 0, "No funds to withdraw");
        
        emergencyUnlockRequested = false;
        _transfer(token, owner(), balance);
        
        emit EmergencyUnlockExecuted(token, block.timestamp);
    }

    // ============ Funding ============
    
    /**
     * @notice Accept ETH deposits
     */
    receive() external payable {
        emit Deposit(address(0), msg.value, block.timestamp);
    }
    
    /**
     * @notice Accept fallback for ETH
     */
    fallback() external payable {
        emit Deposit(address(0), msg.value, block.timestamp);
    }
    
    /**
     * @notice Deposit ERC-20 tokens
     * @param token Token address
     * @param amount Amount to deposit
     */
    function deposit(address token, uint256 amount) external {
        require(token != address(0), "Invalid token");
        require(amount > 0, "Amount must be > 0");
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        emit Deposit(token, amount, block.timestamp);
    }

    // ============ Withdrawal with Whitelist ============
    
    /**
     * @notice Execute withdrawal with recipient whitelist enforcement
     * @param token Token to withdraw
     * @param amount Amount to withdraw
     * @param recipient Recipient address (must be whitelisted)
     * @param reason Withdrawal reason
     * @param signatures Guardian signatures
     */
    function withdrawWithRecipientCheck(
        address token,
        uint256 amount,
        address recipient,
        string memory reason,
        bytes[] calldata signatures
    ) external vaultNotFrozen nonReentrant validGuardians(_extractGuardians(signatures)) {
        require(token != address(0), "Invalid token");
        require(amount > 0, "Amount must be > 0");
        require(recipient != address(0), "Invalid recipient");
        require(signatures.length >= quorum, "Insufficient signatures");
        
        // Check recipient whitelist
        (bool allowed, string memory rejectionReason) = whitelistContract.checkRecipientWhitelist(
            address(this),
            recipient,
            token,
            amount
        );
        require(allowed, rejectionReason);
        
        emit RecipientCheckPerformed(recipient, true, "", block.timestamp);
        
        // Verify signatures
        bytes32 messageHash = _hashWithdrawal(token, amount, recipient, nonce, reason);
        _verifySignatures(messageHash, signatures);
        
        // Check balance
        uint256 balance = _getBalance(token);
        require(balance >= amount, "Insufficient balance");
        
        // Record withdrawal in whitelist
        whitelistContract.recordWithdrawal(address(this), recipient, token, amount);
        
        // Increment nonce for replay protection
        nonce++;
        
        // Execute transfer
        _transfer(token, recipient, amount);
        
        emit Withdrawal(token, amount, recipient, reason, block.timestamp);
    }

    // ============ Internal Functions ============
    
    /**
     * @notice Hash withdrawal for EIP-712 signature
     */
    function _hashWithdrawal(
        address token,
        uint256 amount,
        address recipient,
        uint256 nonceValue,
        string memory reason
    ) internal view returns (bytes32) {
        return _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256("Withdrawal(address token,uint256 amount,address recipient,uint256 nonce,string reason)"),
                    token,
                    amount,
                    recipient,
                    nonceValue,
                    keccak256(abi.encodePacked(reason))
                )
            )
        );
    }
    
    /**
     * @notice Verify guardian signatures
     */
    function _verifySignatures(bytes32 messageHash, bytes[] calldata signatures) internal view {
        require(signatures.length >= quorum, "Insufficient signatures");
        
        address[] memory signers = new address[](signatures.length);
        for (uint256 i = 0; i < signatures.length; i++) {
            address signer = messageHash.recover(signatures[i]);
            require(signer != address(0), "Invalid signature");
            
            // Check if signer is a guardian
            require(_isGuardian(signer), "Signer is not a guardian");
            
            // Check for duplicates
            for (uint256 j = 0; j < i; j++) {
                require(signers[j] != signer, "Duplicate signature");
            }
            
            signers[i] = signer;
        }
    }
    
    /**
     * @notice Extract guardian addresses from signatures (for validation)
     */
    function _extractGuardians(bytes[] calldata signatures) internal pure returns (address[] memory) {
        address[] memory guardians = new address[](signatures.length);
        // Addresses will be verified in _verifySignatures
        return guardians;
    }
    
    /**
     * @notice Check if address is a guardian
     */
    function _isGuardian(address account) internal view returns (bool) {
        // Check if account has a guardian token
        try IERC721(address(guardianToken)).balanceOf(account) returns (uint256 balance) {
            return balance > 0;
        } catch {
            return false;
        }
    }
    
    /**
     * @notice Get token balance
     */
    function _getBalance(address token) internal view returns (uint256) {
        if (token == address(0)) {
            return address(this).balance;
        }
        return IERC20(token).balanceOf(address(this));
    }
    
    /**
     * @notice Transfer tokens or ETH
     */
    function _transfer(address token, address to, uint256 amount) internal {
        if (token == address(0)) {
            (bool success, ) = payable(to).call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(token).transfer(to, amount);
        }
    }

    // ============ View Functions ============
    
    /**
     * @notice Get ETH balance
     */
    function getETHBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @notice Get ERC-20 token balance
     */
    function getTokenBalance(address token) external view returns (uint256) {
        require(token != address(0), "Invalid token");
        return IERC20(token).balanceOf(address(this));
    }
    
    /**
     * @notice Get EIP-712 domain separator
     */
    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
    
    /**
     * @notice Get seconds remaining for emergency unlock
     */
    function getEmergencyUnlockTimeRemaining() external view returns (uint256) {
        if (!emergencyUnlockRequested) {
            return 0;
        }
        if (block.timestamp >= emergencyUnlockRequestTime) {
            return 0;
        }
        return emergencyUnlockRequestTime - block.timestamp;
    }
    
    /**
     * @notice Get recipient's approval status and limit
     */
    function getRecipientStatus(address recipient) external view returns (
        bool isWhitelisted,
        uint256 dailyLimit,
        string memory name
    ) {
        RecipientWhitelist.WhitelistEntry memory entry = whitelistContract.getRecipientInfo(
            address(this),
            recipient
        );
        return (entry.isWhitelisted, entry.dailyLimit, entry.name);
    }
    
    /**
     * @notice Get recipient's current daily spending
     */
    function getRecipientDailySpending(address recipient, address token) external view returns (
        uint256 dailySpent,
        uint256 dailyLimit,
        uint256 dailyRemaining
    ) {
        return whitelistContract.getRecipientDailySpending(address(this), recipient, token);
    }
    
    /**
     * @notice Check if emergency mode is active
     */
    function isEmergencyModeActive() external view returns (bool) {
        return whitelistContract.isEmergencyMode(address(this));
    }
}

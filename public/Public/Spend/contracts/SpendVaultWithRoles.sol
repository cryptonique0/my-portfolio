// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./GuardianRoles.sol";

interface IGuardianSBT {
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title SpendVaultWithRoles
 * @notice Enhanced multi-signature vault with role-based guardian permissions
 * @dev Extends SpendVault with support for guardian roles (SIGNER, OBSERVER, EMERGENCY_ONLY)
 */
contract SpendVaultWithRoles is Ownable, EIP712, ReentrancyGuard {
    using ECDSA for bytes32;
    
    // ============ State Variables ============
    
    address public guardianToken;
    address public guardianRoles;
    uint256 public quorum;
    uint256 public nonce;
    bool public vaultEmergencyFrozen;
    
    // ============ Withdrawal Tracking ============
    
    struct WithdrawalMetadata {
        string category;
        bytes32 reasonHash;
        uint256 createdAt;
    }
    
    mapping(uint256 => WithdrawalMetadata) public withdrawalMetadatas;
    
    // Emergency unlock
    uint256 public emergencyUnlockRequestTime;
    mapping(address => uint256) public lastWithdrawalTime;
    
    // ============ Events ============
    
    event VaultCreated(
        address indexed owner,
        address indexed guardianToken,
        uint256 quorum
    );
    
    event Withdrawal(
        address indexed token,
        uint256 amount,
        address indexed recipient,
        string reason
    );
    
    event GuardianSignature(
        address indexed guardian,
        uint256 nonce,
        string category,
        bytes32 reasonHash,
        uint256 createdAt
    );
    
    event GuardianRoleCheckFailed(
        address indexed guardian,
        string reason,
        bool isEmergency
    );
    
    event WithdrawalApprovedByRole(
        address indexed guardian,
        GuardianRoles.GuardianRole role,
        uint256 nonce
    );
    
    event EmergencyUnlockRequested(uint256 requestTime);
    event EmergencyUnlockExecuted(address indexed token);
    event EmergencyUnlockCancelled();
    event VaultFrozen(address indexed by);
    event VaultUnfrozen(address indexed by);
    
    // ============ Type Hashes ============
    
    bytes32 private constant WITHDRAWAL_TYPEHASH = 
        keccak256("Withdrawal(address token,uint256 amount,address recipient,uint256 nonce,bytes32 reason,bytes32 category,uint256 createdAt)");
    
    // ============ Modifiers ============
    
    modifier onlyActiveGuardian(bool isEmergency) {
        require(IGuardianSBT(guardianToken).balanceOf(msg.sender) > 0, "Not a guardian");
        
        if (!isEmergency) {
            require(
                GuardianRoles(guardianRoles).isGuardianActive(address(this), msg.sender),
                "Guardian role inactive or expired"
            );
        }
        _;
    }
    
    // ============ Constructor ============
    
    constructor(
        address _guardianToken,
        address _guardianRoles,
        uint256 _quorum
    ) EIP712("SpendGuard", "1") Ownable(msg.sender) {
        require(_guardianToken != address(0), "Invalid guardian token");
        require(_guardianRoles != address(0), "Invalid guardian roles");
        require(_quorum > 0, "Quorum must be positive");
        
        guardianToken = _guardianToken;
        guardianRoles = _guardianRoles;
        quorum = _quorum;
        
        emit VaultCreated(msg.sender, _guardianToken, _quorum);
    }
    
    // ============ Funding Functions ============
    
    receive() external payable {}
    
    fallback() external payable {}
    
    function deposit(address token, uint256 amount) external {
        require(token != address(0), "Invalid token");
        require(amount > 0, "Amount must be positive");
        
        bool success = IERC20(token).transferFrom(msg.sender, address(this), amount);
        require(success, "Transfer failed");
    }
    
    // ============ Withdrawal Functions ============
    
    /**
     * @notice Execute a withdrawal with role-based guardian approval
     * @param token Token address to withdraw
     * @param amount Amount to withdraw
     * @param recipient Address to receive funds
     * @param reason Reason for withdrawal
     * @param isEmergency Whether this is an emergency withdrawal
     * @param signatures Guardian signatures
     */
    function withdrawWithRoles(
        address token,
        uint256 amount,
        address recipient,
        string memory reason,
        bool isEmergency,
        bytes[] memory signatures
    ) external nonReentrant {
        require(!vaultEmergencyFrozen, "Vault is frozen");
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be positive");
        require(signatures.length > 0, "No signatures provided");
        
        bytes32 reasonHash = keccak256(bytes(reason));
        bytes32 structHash = keccak256(
            abi.encode(
                WITHDRAWAL_TYPEHASH,
                token,
                amount,
                recipient,
                nonce,
                reasonHash,
                keccak256(bytes(isEmergency ? "emergency" : "regular")),
                block.timestamp
            )
        );
        bytes32 hash = _hashTypedDataV4(structHash);
        
        withdrawalMetadatas[nonce] = WithdrawalMetadata({
            category: isEmergency ? "emergency" : "regular",
            reasonHash: reasonHash,
            createdAt: block.timestamp
        });
        
        // Verify signatures with role checking
        address[] memory signers = new address[](signatures.length);
        uint256 validSignatures = 0;
        uint256 signerWeight = 0;
        
        GuardianRoles guardianRolesContract = GuardianRoles(guardianRoles);
        
        for (uint256 i = 0; i < signatures.length; i++) {
            address signer = hash.recover(signatures[i]);
            require(IGuardianSBT(guardianToken).balanceOf(signer) > 0, "Invalid guardian");
            
            // Check for duplicates
            for (uint256 j = 0; j < validSignatures; j++) {
                require(signers[j] != signer, "Duplicate signature");
            }
            
            // Check guardian role permissions
            bool canApprove = isEmergency
                ? guardianRolesContract.canApproveEmergencyWithdrawal(
                    address(this),
                    signer,
                    amount
                )
                : guardianRolesContract.canApproveRegularWithdrawal(
                    address(this),
                    signer,
                    amount
                );
            
            if (!canApprove) {
                emit GuardianRoleCheckFailed(
                    signer,
                    isEmergency ? "Emergency role required" : "Signer role required",
                    isEmergency
                );
                continue; // Skip this signature if role doesn't permit approval
            }
            
            GuardianRoles.GuardianRole role = guardianRolesContract.getGuardianRole(
                address(this),
                signer
            );
            
            signers[validSignatures] = signer;
            validSignatures++;
            signerWeight++;
            
            emit WithdrawalApprovedByRole(signer, role, nonce);
            emit GuardianSignature(signer, nonce, withdrawalMetadatas[nonce].category, reasonHash, block.timestamp);
        }
        
        // Require minimum quorum with valid role-based signatures
        require(validSignatures >= quorum, "Insufficient valid signatures");
        require(signerWeight >= quorum, "Insufficient guardian weight");
        
        nonce++;
        
        // Execute transfer
        if (token == address(0)) {
            require(address(this).balance >= amount, "Insufficient ETH");
            (bool success, ) = recipient.call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            bool success = IERC20(token).transfer(recipient, amount);
            require(success, "Token transfer failed");
        }
        
        emit Withdrawal(token, amount, recipient, reason);
    }
    
    // ============ Emergency Unlock Functions ============
    
    /**
     * @notice Request emergency unlock with 30-day timelock
     * @dev Only vault owner can request
     */
    function requestEmergencyUnlock() external onlyOwner {
        require(!vaultEmergencyFrozen, "Vault already frozen");
        emergencyUnlockRequestTime = block.timestamp;
        emit EmergencyUnlockRequested(block.timestamp);
    }
    
    /**
     * @notice Execute emergency unlock after 30-day delay
     * @param token Token to withdraw in emergency
     * @dev Only vault owner can execute
     */
    function executeEmergencyUnlock(address token) external onlyOwner nonReentrant {
        require(emergencyUnlockRequestTime > 0, "No emergency unlock requested");
        require(
            block.timestamp >= emergencyUnlockRequestTime + 30 days,
            "30-day timelock not elapsed"
        );
        
        uint256 balance = token == address(0)
            ? address(this).balance
            : IERC20(token).balanceOf(address(this));
        
        require(balance > 0, "No balance to withdraw");
        
        if (token == address(0)) {
            (bool success, ) = owner().call{value: balance}("");
            require(success, "ETH transfer failed");
        } else {
            bool success = IERC20(token).transfer(owner(), balance);
            require(success, "Token transfer failed");
        }
        
        emergencyUnlockRequestTime = 0;
        emit EmergencyUnlockExecuted(token);
    }
    
    /**
     * @notice Cancel pending emergency unlock
     * @dev Only vault owner can cancel
     */
    function cancelEmergencyUnlock() external onlyOwner {
        require(emergencyUnlockRequestTime > 0, "No unlock requested");
        emergencyUnlockRequestTime = 0;
        emit EmergencyUnlockCancelled();
    }
    
    /**
     * @notice Get remaining time until emergency unlock can be executed
     * @return Seconds remaining (0 if none pending or already elapsed)
     */
    function getEmergencyUnlockTimeRemaining() external view returns (uint256) {
        if (emergencyUnlockRequestTime == 0) return 0;
        
        uint256 unlockTime = emergencyUnlockRequestTime + 30 days;
        if (block.timestamp >= unlockTime) return 0;
        
        return unlockTime - block.timestamp;
    }
    
    // ============ Freeze Functions ============
    
    /**
     * @notice Freeze vault to prevent any withdrawals
     * @dev Only vault owner can freeze
     */
    function freezeVault() external onlyOwner {
        require(!vaultEmergencyFrozen, "Vault already frozen");
        vaultEmergencyFrozen = true;
        emit VaultFrozen(msg.sender);
    }
    
    /**
     * @notice Unfreeze vault to restore withdrawal functionality
     * @dev Only vault owner can unfreeze
     */
    function unfreezeVault() external onlyOwner {
        require(vaultEmergencyFrozen, "Vault not frozen");
        vaultEmergencyFrozen = false;
        emit VaultUnfrozen(msg.sender);
    }
    
    // ============ Information Functions ============
    
    function getETHBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
    
    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
    
    /**
     * @notice Get active guardian count using role contract
     * @return Number of active guardians for this vault
     */
    function getActiveGuardianCount() external view returns (uint256) {
        return GuardianRoles(guardianRoles).getActiveGuardianCount(address(this));
    }
    
    /**
     * @notice Get all active guardians for this vault
     * @return Array of active guardian addresses
     */
    function getActiveGuardians() external view returns (address[] memory) {
        return GuardianRoles(guardianRoles).getActiveGuardians(address(this));
    }
    
    /**
     * @notice Get guardian role information
     * @param guardian Address of the guardian
     * @return Role information
     */
    function getGuardianRoleInfo(address guardian)
        external
        view
        returns (GuardianRoles.GuardianRoleInfo memory)
    {
        return GuardianRoles(guardianRoles).getGuardianRoleInfo(address(this), guardian);
    }
    
    // ============ Configuration Functions ============
    
    function setQuorum(uint256 _newQuorum) external onlyOwner {
        require(_newQuorum > 0, "Quorum must be positive");
        quorum = _newQuorum;
    }
    
    function updateGuardianToken(address _newAddress) external onlyOwner {
        require(_newAddress != address(0), "Invalid address");
        guardianToken = _newAddress;
    }
    
    function updateGuardianRoles(address _newAddress) external onlyOwner {
        require(_newAddress != address(0), "Invalid address");
        guardianRoles = _newAddress;
    }
}

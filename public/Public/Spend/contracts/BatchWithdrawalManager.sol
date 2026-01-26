// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ISpendVault {
    function executeQueuedWithdrawal(uint256 withdrawalId) external;
    function withdraw(
        address token,
        uint256 amount,
        address recipient,
        string memory reason,
        string memory category,
        uint256 createdAt,
        bytes[] memory signatures
    ) external;
}

/**
 * @title BatchWithdrawalManager
 * @notice Manages batched withdrawals for multi-sig efficiency
 * @dev Allows bundling multiple withdrawals into a single batch for atomic execution
 */
contract BatchWithdrawalManager is EIP712, ReentrancyGuard, Ownable {
    using ECDSA for bytes32;

    // ============ Types ============

    enum BatchStatus {
        Pending,      // Waiting for guardian approvals
        Approved,     // All required approvals received
        Executing,    // Currently executing withdrawals
        Completed,    // All withdrawals executed
        Cancelled,    // Batch was cancelled
        PartialFail   // Some withdrawals failed
    }

    struct WithdrawalItem {
        address token;
        uint256 amount;
        address recipient;
        string reason;
        string category;
        uint256 withdrawalId; // For queued withdrawals
        bool isQueued; // True if it's a queued withdrawal, false if direct withdrawal
        bool executed; // Track individual execution status
    }

    struct WithdrawalBatch {
        uint256 batchId;
        address vaultAddress;
        address creator;
        uint256 createdAt;
        uint256 expiresAt; // Batch approval window expires
        BatchStatus status;
        
        WithdrawalItem[] items;
        uint256 totalAmount; // Total ETH or primary token amount
        
        address[] approvers; // Guardians who approved
        mapping(address => bool) approved; // Guardian => has approved
        mapping(address => uint256) approvalTimestamp; // Track when each guardian approved
        
        uint256 requiredApprovals;
        bytes32 batchHash; // Hash of batch contents for verification
        
        uint256 executedAt;
        string executionNotes; // Notes from batch execution (e.g., "2/3 items succeeded")
    }

    struct BatchExecutionResult {
        uint256 batchId;
        uint256 successCount;
        uint256 failureCount;
        string[] failureReasons;
        uint256 executedAt;
    }

    // ============ State ============

    mapping(uint256 => WithdrawalBatch) public batches;
    uint256 public batchCounter;
    
    // Batch governance
    uint256 public defaultBatchApprovalsRequired = 2; // Default approvals needed per batch
    uint256 public batchApprovalWindow = 7 days; // Time to approve batch
    
    // Mappings for batch lookups
    mapping(address => uint256[]) public vaultBatches; // vault => batchIds
    mapping(address => uint256[]) public userBatches; // user => batchIds created
    mapping(uint256 => BatchExecutionResult) public batchResults; // batchId => execution result
    
    // Multi-sig coordination
    mapping(uint256 => mapping(address => bytes)) public guardianSignatures; // batchId => guardian => signature
    
    // Batch execution history
    uint256[] public completedBatches;
    mapping(uint256 => bool) public batchCompleted;

    // ============ Events ============

    event BatchCreated(
        uint256 indexed batchId,
        address indexed vaultAddress,
        address indexed creator,
        uint256 itemCount,
        uint256 totalAmount,
        uint256 expiresAt
    );

    event BatchApproved(
        uint256 indexed batchId,
        address indexed approver,
        uint256 totalApprovals,
        uint256 requiredApprovals
    );

    event BatchApprovalRevoked(
        uint256 indexed batchId,
        address indexed revoker
    );

    event BatchExecutionStarted(
        uint256 indexed batchId,
        uint256 itemCount
    );

    event BatchItemExecuted(
        uint256 indexed batchId,
        uint256 itemIndex,
        bool success,
        string reason
    );

    event BatchCompleted(
        uint256 indexed batchId,
        BatchStatus finalStatus,
        uint256 successCount,
        uint256 failureCount,
        uint256 executedAt
    );

    event BatchCancelled(
        uint256 indexed batchId,
        address indexed cancelledBy,
        string reason
    );

    event BatchExpired(
        uint256 indexed batchId
    );

    // ============ Modifiers ============

    modifier batchExists(uint256 batchId) {
        require(batchId < batchCounter, "Batch does not exist");
        _;
    }

    modifier batchNotExpired(uint256 batchId) {
        require(block.timestamp <= batches[batchId].expiresAt, "Batch approval window expired");
        _;
    }

    modifier onlyBatchCreator(uint256 batchId) {
        require(msg.sender == batches[batchId].creator, "Only batch creator can perform this action");
        _;
    }

    // ============ Constructor ============

    constructor() EIP712("BatchWithdrawalManager", "1") {
        batchCounter = 0;
    }

    // ============ Batch Creation ============

    /**
     * @notice Create a new withdrawal batch
     * @param vaultAddress Address of the SpendVault
     * @param items Array of withdrawal items to batch
     * @param requiredApprovals Number of guardian approvals needed (0 = use default)
     */
    function createBatch(
        address vaultAddress,
        WithdrawalItem[] calldata items,
        uint256 requiredApprovals
    ) external returns (uint256 batchId) {
        require(vaultAddress != address(0), "Invalid vault address");
        require(items.length > 0, "Batch must contain at least 1 item");
        require(items.length <= 50, "Batch cannot exceed 50 items");
        
        uint256 approvals = requiredApprovals > 0 ? requiredApprovals : defaultBatchApprovalsRequired;
        require(approvals > 0, "At least 1 approval required");

        batchId = batchCounter++;

        // Calculate total amount and verify items
        uint256 totalAmount = 0;
        address primaryToken = items[0].token;
        
        for (uint256 i = 0; i < items.length; i++) {
            WithdrawalItem calldata item = items[i];
            require(item.amount > 0, "Item amount must be greater than 0");
            require(item.recipient != address(0), "Invalid recipient");
            
            // All items should use same token for batching (or allow multi-token)
            // Currently enforcing single token per batch for simplicity
            require(item.token == primaryToken, "All items must use same token");
            
            totalAmount += item.amount;
        }

        // Create batch
        WithdrawalBatch storage batch = batches[batchId];
        batch.batchId = batchId;
        batch.vaultAddress = vaultAddress;
        batch.creator = msg.sender;
        batch.createdAt = block.timestamp;
        batch.expiresAt = block.timestamp + batchApprovalWindow;
        batch.status = BatchStatus.Pending;
        batch.requiredApprovals = approvals;
        batch.totalAmount = totalAmount;

        // Add items
        for (uint256 i = 0; i < items.length; i++) {
            batch.items.push(items[i]);
        }

        // Calculate batch hash
        batch.batchHash = _calculateBatchHash(batchId);

        // Track batch
        vaultBatches[vaultAddress].push(batchId);
        userBatches[msg.sender].push(batchId);

        emit BatchCreated(
            batchId,
            vaultAddress,
            msg.sender,
            items.length,
            totalAmount,
            batch.expiresAt
        );
    }

    /**
     * @notice Approve a batch
     * @param batchId ID of batch to approve
     * @param signature Optional EIP-712 signature for off-chain approval
     */
    function approveBatch(
        uint256 batchId,
        bytes calldata signature
    ) external batchExists(batchId) batchNotExpired(batchId) {
        WithdrawalBatch storage batch = batches[batchId];
        
        require(batch.status == BatchStatus.Pending, "Batch not in pending state");
        require(!batch.approved[msg.sender], "Already approved");

        // If signature provided, verify it's from msg.sender for batch
        if (signature.length > 0) {
            bytes32 structHash = keccak256(abi.encode(
                keccak256("ApproveBatch(uint256 batchId,address approver,uint256 nonce)"),
                batchId,
                msg.sender,
                block.timestamp / 1 hours // Hourly nonce for signature freshness
            ));
            bytes32 digest = _hashTypedDataV4(structHash);
            address recovered = digest.recover(signature);
            require(recovered == msg.sender, "Invalid signature");
        }

        // Record approval
        batch.approved[msg.sender] = true;
        batch.approvers.push(msg.sender);
        batch.approvalTimestamp[msg.sender] = block.timestamp;

        uint256 approvalCount = batch.approvers.length;
        
        // Update status if threshold reached
        if (approvalCount >= batch.requiredApprovals) {
            batch.status = BatchStatus.Approved;
        }

        emit BatchApproved(batchId, msg.sender, approvalCount, batch.requiredApprovals);
    }

    /**
     * @notice Revoke batch approval
     * @param batchId ID of batch to revoke approval
     */
    function revokeBatchApproval(
        uint256 batchId
    ) external batchExists(batchId) batchNotExpired(batchId) {
        WithdrawalBatch storage batch = batches[batchId];
        
        require(batch.status == BatchStatus.Pending || batch.status == BatchStatus.Approved, "Cannot revoke approval");
        require(batch.approved[msg.sender], "Not approved by caller");

        batch.approved[msg.sender] = false;
        
        // Remove from approvers array
        for (uint256 i = 0; i < batch.approvers.length; i++) {
            if (batch.approvers[i] == msg.sender) {
                batch.approvers[i] = batch.approvers[batch.approvers.length - 1];
                batch.approvers.pop();
                break;
            }
        }

        // Revert to pending if approvals dropped below threshold
        if (batch.approvers.length < batch.requiredApprovals) {
            batch.status = BatchStatus.Pending;
        }

        emit BatchApprovalRevoked(batchId, msg.sender);
    }

    // ============ Batch Execution ============

    /**
     * @notice Execute all items in an approved batch
     * @param batchId ID of batch to execute
     * @dev Atomicity: If any individual item fails, batch status becomes PartialFail
     */
    function executeBatch(
        uint256 batchId
    ) external nonReentrant batchExists(batchId) {
        WithdrawalBatch storage batch = batches[batchId];
        
        require(batch.status == BatchStatus.Approved, "Batch not approved");
        require(block.timestamp <= batch.expiresAt + 7 days, "Batch approval expired");
        
        batch.status = BatchStatus.Executing;
        batch.executedAt = block.timestamp;

        uint256 successCount = 0;
        uint256 failureCount = 0;
        string[] memory failureReasons = new string[](batch.items.length);

        emit BatchExecutionStarted(batchId, batch.items.length);

        // Execute each item
        for (uint256 i = 0; i < batch.items.length; i++) {
            WithdrawalItem storage item = batch.items[i];
            
            if (item.executed) {
                continue; // Skip already executed items
            }

            bool success = false;
            string memory reason = "";

            try this._executeWithdrawalItem(batchId, i) {
                item.executed = true;
                success = true;
                successCount++;
            } catch Error(string memory errorReason) {
                reason = errorReason;
                failureCount++;
                failureReasons[i] = reason;
            } catch (bytes memory) {
                reason = "Unknown error";
                failureCount++;
                failureReasons[i] = reason;
            }

            emit BatchItemExecuted(batchId, i, success, reason);
        }

        // Determine final status
        if (failureCount == 0) {
            batch.status = BatchStatus.Completed;
        } else if (successCount > 0) {
            batch.status = BatchStatus.PartialFail;
        } else {
            batch.status = BatchStatus.Cancelled;
        }

        // Store execution result
        batchResults[batchId] = BatchExecutionResult({
            batchId: batchId,
            successCount: successCount,
            failureCount: failureCount,
            failureReasons: failureReasons,
            executedAt: block.timestamp
        });

        completedBatches.push(batchId);
        batchCompleted[batchId] = true;

        emit BatchCompleted(batchId, batch.status, successCount, failureCount, batch.executedAt);
    }

    /**
     * @notice Internal function to execute a single withdrawal item
     * @dev Separated for try-catch error handling
     */
    function _executeWithdrawalItem(
        uint256 batchId,
        uint256 itemIndex
    ) external nonReentrant {
        require(msg.sender == address(this), "Can only be called internally");
        
        WithdrawalBatch storage batch = batches[batchId];
        require(itemIndex < batch.items.length, "Invalid item index");

        WithdrawalItem storage item = batch.items[itemIndex];
        
        // Execute based on item type
        if (item.isQueued) {
            // Execute queued withdrawal
            ISpendVault(batch.vaultAddress).executeQueuedWithdrawal(item.withdrawalId);
        } else {
            // Execute direct withdrawal
            bytes[] memory emptySignatures = new bytes[](0);
            ISpendVault(batch.vaultAddress).withdraw(
                item.token,
                item.amount,
                item.recipient,
                item.reason,
                item.category,
                block.timestamp,
                emptySignatures
            );
        }
    }

    // ============ Batch Management ============

    /**
     * @notice Cancel a batch (only creator can cancel before execution)
     * @param batchId ID of batch to cancel
     * @param reason Reason for cancellation
     */
    function cancelBatch(
        uint256 batchId,
        string memory reason
    ) external batchExists(batchId) onlyBatchCreator(batchId) {
        WithdrawalBatch storage batch = batches[batchId];
        
        require(batch.status != BatchStatus.Completed, "Cannot cancel completed batch");
        require(batch.status != BatchStatus.Executing, "Cannot cancel executing batch");

        batch.status = BatchStatus.Cancelled;
        batch.executionNotes = reason;

        emit BatchCancelled(batchId, msg.sender, reason);
    }

    /**
     * @notice Expire a batch approval window (if not executed)
     * @param batchId ID of batch to expire
     */
    function expireBatch(
        uint256 batchId
    ) external batchExists(batchId) {
        WithdrawalBatch storage batch = batches[batchId];
        
        require(block.timestamp > batch.expiresAt, "Batch approval window not expired");
        require(batch.status == BatchStatus.Pending || batch.status == BatchStatus.Approved, "Batch already finalized");

        batch.status = BatchStatus.Cancelled;

        emit BatchExpired(batchId);
    }

    // ============ Query Functions ============

    /**
     * @notice Get batch details
     */
    function getBatch(uint256 batchId) external view batchExists(batchId) returns (
        address vaultAddress,
        address creator,
        uint256 createdAt,
        uint256 expiresAt,
        BatchStatus status,
        uint256 itemCount,
        uint256 totalAmount,
        uint256 approvalCount,
        uint256 requiredApprovals
    ) {
        WithdrawalBatch storage batch = batches[batchId];
        return (
            batch.vaultAddress,
            batch.creator,
            batch.createdAt,
            batch.expiresAt,
            batch.status,
            batch.items.length,
            batch.totalAmount,
            batch.approvers.length,
            batch.requiredApprovals
        );
    }

    /**
     * @notice Get batch items
     */
    function getBatchItems(uint256 batchId) external view batchExists(batchId) 
        returns (WithdrawalItem[] memory) {
        return batches[batchId].items;
    }

    /**
     * @notice Get batch item details
     */
    function getBatchItem(uint256 batchId, uint256 itemIndex) external view batchExists(batchId)
        returns (WithdrawalItem memory) {
        require(itemIndex < batches[batchId].items.length, "Item index out of bounds");
        return batches[batchId].items[itemIndex];
    }

    /**
     * @notice Get batch approvers
     */
    function getBatchApprovers(uint256 batchId) external view batchExists(batchId)
        returns (address[] memory) {
        return batches[batchId].approvers;
    }

    /**
     * @notice Check if address approved batch
     */
    function hasApproved(uint256 batchId, address approver) external view batchExists(batchId)
        returns (bool) {
        return batches[batchId].approved[approver];
    }

    /**
     * @notice Get vault's batches
     */
    function getVaultBatches(address vaultAddress) external view returns (uint256[] memory) {
        return vaultBatches[vaultAddress];
    }

    /**
     * @notice Get user's created batches
     */
    function getUserBatches(address user) external view returns (uint256[] memory) {
        return userBatches[user];
    }

    /**
     * @notice Get batch execution result
     */
    function getBatchResult(uint256 batchId) external view batchExists(batchId)
        returns (BatchExecutionResult memory) {
        return batchResults[batchId];
    }

    /**
     * @notice Get approval timestamp for guardian on batch
     */
    function getApprovalTimestamp(uint256 batchId, address approver) external view batchExists(batchId)
        returns (uint256) {
        return batches[batchId].approvalTimestamp[approver];
    }

    /**
     * @notice Get all completed batches
     */
    function getCompletedBatches() external view returns (uint256[] memory) {
        return completedBatches;
    }

    // ============ Admin Functions ============

    /**
     * @notice Update default batch approvals requirement
     */
    function setDefaultBatchApprovals(uint256 newDefault) external onlyOwner {
        require(newDefault > 0, "Must require at least 1 approval");
        defaultBatchApprovalsRequired = newDefault;
    }

    /**
     * @notice Update batch approval window
     */
    function setBatchApprovalWindow(uint256 newWindow) external onlyOwner {
        require(newWindow > 0, "Window must be greater than 0");
        batchApprovalWindow = newWindow;
    }

    // ============ Internal Helpers ============

    /**
     * @notice Calculate batch hash for verification
     */
    function _calculateBatchHash(uint256 batchId) internal view returns (bytes32) {
        WithdrawalBatch storage batch = batches[batchId];
        
        bytes32 itemsHash = keccak256(abi.encode(batch.items));
        return keccak256(abi.encodePacked(
            batchId,
            batch.vaultAddress,
            batch.creator,
            batch.totalAmount,
            batch.requiredApprovals,
            itemsHash
        ));
    }

    /**
     * @notice Get signers from approval signatures
     */
    function _getSignersFromSignatures(
        bytes[] memory signatures,
        bytes32 messageHash
    ) internal pure returns (address[] memory) {
        address[] memory signers = new address[](signatures.length);
        
        for (uint256 i = 0; i < signatures.length; i++) {
            signers[i] = messageHash.recover(signatures[i]);
        }
        
        return signers;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title MultiSigVault
 * @notice Multi-signature wallet for secure large transfers
 * @dev Requires M-of-N signatures for transactions above threshold
 */
contract MultiSigVault is Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    struct Transaction {
        address to;
        address token;
        uint256 amount;
        uint256 createdAt;
        bool executed;
        uint256 signatures;
    }

    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;
    mapping(address => bool) public signers;

    uint256 public transactionCount;
    uint256 public requiredSignatures;
    uint256 public signerCount;
    uint256 public transferThreshold; // Amount above which multi-sig required
    uint256 public executionDelay; // Minimum time before execution

    event TransactionCreated(
        uint256 indexed txId,
        address indexed to,
        address indexed token,
        uint256 amount
    );

    event TransactionConfirmed(uint256 indexed txId, address indexed signer);
    event TransactionExecuted(uint256 indexed txId);
    event SignerAdded(address indexed signer);
    event SignerRemoved(address indexed signer);
    event RequiredSignaturesChanged(uint256 newRequired);
    event ThresholdChanged(uint256 newThreshold);

    modifier onlySigner() {
        require(signers[msg.sender], "Not a signer");
        _;
    }

    /**
     * @notice Initialize multi-sig vault with signers
     * @param _signers Array of signer addresses
     * @param _requiredSignatures Number of signatures required
     * @param _transferThreshold Amount above which multi-sig required
     * @param _executionDelay Minimum time before execution
     */
    function initialize(
        address[] memory _signers,
        uint256 _requiredSignatures,
        uint256 _transferThreshold,
        uint256 _executionDelay
    ) external onlyOwner {
        require(_signers.length >= _requiredSignatures, "Invalid signer count");
        require(_requiredSignatures > 0, "At least 1 signature required");

        for (uint256 i = 0; i < _signers.length; i++) {
            require(_signers[i] != address(0), "Invalid signer");
            if (!signers[_signers[i]]) {
                signers[_signers[i]] = true;
                signerCount++;
            }
        }

        requiredSignatures = _requiredSignatures;
        transferThreshold = _transferThreshold;
        executionDelay = _executionDelay;
    }

    /**
     * @notice Add a new signer
     * @param _signer Address to add
     */
    function addSigner(address _signer) external onlyOwner {
        require(_signer != address(0), "Invalid address");
        require(!signers[_signer], "Already a signer");

        signers[_signer] = true;
        signerCount++;

        emit SignerAdded(_signer);
    }

    /**
     * @notice Remove a signer
     * @param _signer Address to remove
     */
    function removeSigner(address _signer) external onlyOwner {
        require(signers[_signer], "Not a signer");
        require(signerCount > requiredSignatures, "Cannot remove signer");

        signers[_signer] = false;
        signerCount--;

        emit SignerRemoved(_signer);
    }

    /**
     * @notice Create a multi-sig transaction
     * @param _to Recipient address
     * @param _token Token contract address
     * @param _amount Amount to transfer
     */
    function createTransaction(
        address _to,
        address _token,
        uint256 _amount
    ) external onlyOwner returns (uint256) {
        require(_to != address(0), "Invalid recipient");
        require(_amount > 0, "Invalid amount");

        uint256 txId = transactionCount++;

        transactions[txId] = Transaction({
            to: _to,
            token: _token,
            amount: _amount,
            createdAt: block.timestamp,
            executed: false,
            signatures: 0
        });

        emit TransactionCreated(txId, _to, _token, _amount);
        return txId;
    }

    /**
     * @notice Confirm a transaction (sign it)
     * @param _txId Transaction ID
     */
    function confirmTransaction(uint256 _txId) external onlySigner {
        require(_txId < transactionCount, "Invalid transaction");
        require(!transactions[_txId].executed, "Already executed");
        require(!confirmations[_txId][msg.sender], "Already confirmed");

        confirmations[_txId][msg.sender] = true;
        transactions[_txId].signatures++;

        emit TransactionConfirmed(_txId, msg.sender);
    }

    /**
     * @notice Execute confirmed transaction
     * @param _txId Transaction ID
     */
    function executeTransaction(uint256 _txId) external nonReentrant {
        require(_txId < transactionCount, "Invalid transaction");

        Transaction storage txn = transactions[_txId];

        require(!txn.executed, "Already executed");
        require(txn.signatures >= requiredSignatures, "Not enough signatures");
        require(
            block.timestamp >= txn.createdAt + executionDelay,
            "Execution delay not met"
        );

        txn.executed = true;

        if (txn.token == address(0)) {
            // ETH transfer
            (bool success, ) = txn.to.call{value: txn.amount}("");
            require(success, "ETH transfer failed");
        } else {
            // ERC20 transfer
            require(
                IERC20(txn.token).transfer(txn.to, txn.amount),
                "Token transfer failed"
            );
        }

        emit TransactionExecuted(_txId);
    }

    /**
     * @notice Get transaction details
     * @param _txId Transaction ID
     */
    function getTransaction(uint256 _txId)
        external
        view
        returns (Transaction memory)
    {
        require(_txId < transactionCount, "Invalid transaction");
        return transactions[_txId];
    }

    /**
     * @notice Check if signer confirmed transaction
     * @param _txId Transaction ID
     * @param _signer Signer address
     */
    function hasConfirmed(uint256 _txId, address _signer)
        external
        view
        returns (bool)
    {
        return confirmations[_txId][_signer];
    }

    /**
     * @notice Update required signatures
     * @param _newRequired New required signature count
     */
    function setRequiredSignatures(uint256 _newRequired) external onlyOwner {
        require(_newRequired > 0, "At least 1 required");
        require(_newRequired <= signerCount, "Cannot exceed signer count");

        requiredSignatures = _newRequired;
        emit RequiredSignaturesChanged(_newRequired);
    }

    /**
     * @notice Update transfer threshold
     * @param _newThreshold New threshold amount
     */
    function setTransferThreshold(uint256 _newThreshold) external onlyOwner {
        transferThreshold = _newThreshold;
        emit ThresholdChanged(_newThreshold);
    }

    /**
     * @notice Set execution delay
     * @param _delay Delay in seconds
     */
    function setExecutionDelay(uint256 _delay) external onlyOwner {
        executionDelay = _delay;
    }

    // Allow ETH deposits
    receive() external payable {}
}

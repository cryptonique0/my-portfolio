// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SnapshotEligibility
 * @notice Manages snapshot-based eligibility at historical block heights
 * @dev Ensures fair airdrop distribution based on historical holdings
 */
contract SnapshotEligibility is Ownable, ReentrancyGuard {
    
    struct Snapshot {
        uint256 snapshotId;
        uint256 blockNumber;
        uint256 timestamp;
        string description;
        bool finalized;
        uint256 totalParticipants;
    }
    
    struct UserSnapshot {
        uint256 balance;
        bool eligible;
        uint256 allocationAmount;
        bool claimed;
    }
    
    mapping(uint256 => Snapshot) public snapshots;
    mapping(uint256 => mapping(address => UserSnapshot)) public userSnapshots;
    mapping(uint256 => address[]) public participantsList;
    
    uint256 public snapshotCount;
    uint256 public minBalanceRequired;
    
    event SnapshotCreated(
        uint256 indexed snapshotId,
        uint256 blockNumber,
        uint256 timestamp,
        string description
    );
    
    event SnapshotFinalized(uint256 indexed snapshotId, uint256 participantCount);
    
    event UserBalanceRecorded(
        uint256 indexed snapshotId,
        address indexed user,
        uint256 balance
    );
    
    event EligibilitySet(
        uint256 indexed snapshotId,
        address indexed user,
        bool eligible,
        uint256 allocationAmount
    );
    
    event AllocationClaimed(
        uint256 indexed snapshotId,
        address indexed user,
        uint256 amount
    );
    
    /**
     * @notice Create a new snapshot
     * @param _blockNumber Block number for snapshot
     * @param _description Snapshot description
     */
    function createSnapshot(
        uint256 _blockNumber,
        string memory _description
    ) external onlyOwner returns (uint256) {
        require(_blockNumber < block.number, "Block not mined yet");
        
        uint256 snapshotId = snapshotCount++;
        
        snapshots[snapshotId] = Snapshot({
            snapshotId: snapshotId,
            blockNumber: _blockNumber,
            timestamp: block.timestamp,
            description: _description,
            finalized: false,
            totalParticipants: 0
        });
        
        emit SnapshotCreated(snapshotId, _blockNumber, block.timestamp, _description);
        return snapshotId;
    }
    
    /**
     * @notice Record user balance for snapshot
     * @param _snapshotId Snapshot ID
     * @param _user User address
     * @param _balance Balance at snapshot block
     */
    function recordUserBalance(
        uint256 _snapshotId,
        address _user,
        uint256 _balance
    ) external onlyOwner {
        require(_snapshotId < snapshotCount, "Invalid snapshot");
        require(!snapshots[_snapshotId].finalized, "Snapshot finalized");
        require(_user != address(0), "Invalid user");
        
        if (userSnapshots[_snapshotId][_user].balance == 0) {
            participantsList[_snapshotId].push(_user);
        }
        
        userSnapshots[_snapshotId][_user].balance = _balance;
        
        emit UserBalanceRecorded(_snapshotId, _user, _balance);
    }
    
    /**
     * @notice Batch record user balances
     * @param _snapshotId Snapshot ID
     * @param _users Array of user addresses
     * @param _balances Array of balances
     */
    function batchRecordBalances(
        uint256 _snapshotId,
        address[] calldata _users,
        uint256[] calldata _balances
    ) external onlyOwner {
        require(_users.length == _balances.length, "Array length mismatch");
        require(_users.length <= 500, "Too many users");
        require(_snapshotId < snapshotCount, "Invalid snapshot");
        require(!snapshots[_snapshotId].finalized, "Snapshot finalized");
        
        for (uint256 i = 0; i < _users.length; i++) {
            require(_users[i] != address(0), "Invalid user");
            
            if (userSnapshots[_snapshotId][_users[i]].balance == 0) {
                participantsList[_snapshotId].push(_users[i]);
            }
            
            userSnapshots[_snapshotId][_users[i]].balance = _balances[i];
            
            emit UserBalanceRecorded(_snapshotId, _users[i], _balances[i]);
        }
    }
    
    /**
     * @notice Set eligibility for users
     * @param _snapshotId Snapshot ID
     * @param _users Array of user addresses
     * @param _allocations Array of allocation amounts
     */
    function setEligibility(
        uint256 _snapshotId,
        address[] calldata _users,
        uint256[] calldata _allocations
    ) external onlyOwner {
        require(_users.length == _allocations.length, "Array length mismatch");
        require(_users.length <= 500, "Too many users");
        require(_snapshotId < snapshotCount, "Invalid snapshot");
        
        for (uint256 i = 0; i < _users.length; i++) {
            require(_users[i] != address(0), "Invalid user");
            
            userSnapshots[_snapshotId][_users[i]].eligible = true;
            userSnapshots[_snapshotId][_users[i]].allocationAmount = _allocations[i];
            
            emit EligibilitySet(_snapshotId, _users[i], true, _allocations[i]);
        }
    }
    
    /**
     * @notice Finalize snapshot
     * @param _snapshotId Snapshot ID
     */
    function finalizeSnapshot(uint256 _snapshotId) external onlyOwner {
        require(_snapshotId < snapshotCount, "Invalid snapshot");
        require(!snapshots[_snapshotId].finalized, "Already finalized");
        
        snapshots[_snapshotId].finalized = true;
        snapshots[_snapshotId].totalParticipants = participantsList[_snapshotId].length;
        
        emit SnapshotFinalized(_snapshotId, snapshots[_snapshotId].totalParticipants);
    }
    
    /**
     * @notice Claim allocation based on snapshot
     * @param _snapshotId Snapshot ID
     */
    function claimAllocation(uint256 _snapshotId) external nonReentrant {
        require(_snapshotId < snapshotCount, "Invalid snapshot");
        require(snapshots[_snapshotId].finalized, "Snapshot not finalized");
        
        UserSnapshot storage userSnapshot = userSnapshots[_snapshotId][msg.sender];
        
        require(userSnapshot.eligible, "Not eligible");
        require(!userSnapshot.claimed, "Already claimed");
        require(userSnapshot.allocationAmount > 0, "No allocation");
        
        userSnapshot.claimed = true;
        
        emit AllocationClaimed(_snapshotId, msg.sender, userSnapshot.allocationAmount);
    }
    
    /**
     * @notice Get snapshot details
     * @param _snapshotId Snapshot ID
     */
    function getSnapshot(uint256 _snapshotId)
        external
        view
        returns (Snapshot memory)
    {
        require(_snapshotId < snapshotCount, "Invalid snapshot");
        return snapshots[_snapshotId];
    }
    
    /**
     * @notice Get user snapshot data
     * @param _snapshotId Snapshot ID
     * @param _user User address
     */
    function getUserSnapshot(uint256 _snapshotId, address _user)
        external
        view
        returns (UserSnapshot memory)
    {
        return userSnapshots[_snapshotId][_user];
    }
    
    /**
     * @notice Get participants list
     * @param _snapshotId Snapshot ID
     */
    function getParticipants(uint256 _snapshotId)
        external
        view
        returns (address[] memory)
    {
        require(_snapshotId < snapshotCount, "Invalid snapshot");
        return participantsList[_snapshotId];
    }
    
    /**
     * @notice Get participant count for snapshot
     * @param _snapshotId Snapshot ID
     */
    function getParticipantCount(uint256 _snapshotId)
        external
        view
        returns (uint256)
    {
        require(_snapshotId < snapshotCount, "Invalid snapshot");
        return participantsList[_snapshotId].length;
    }
    
    /**
     * @notice Check if user is eligible
     * @param _snapshotId Snapshot ID
     * @param _user User address
     */
    function isEligible(uint256 _snapshotId, address _user)
        external
        view
        returns (bool)
    {
        return userSnapshots[_snapshotId][_user].eligible;
    }
    
    /**
     * @notice Set minimum balance required
     * @param _minBalance Minimum balance
     */
    function setMinBalanceRequired(uint256 _minBalance) external onlyOwner {
        minBalanceRequired = _minBalance;
    }
}

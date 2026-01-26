// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title MerkleTree
 * @dev Merkle tree-based whitelist verification with efficient on-chain proof verification
 */
contract MerkleTree is Ownable, ReentrancyGuard, Pausable {
    // Events
    event MerkleRootUpdated(
        uint256 indexed airdropId,
        bytes32 newRoot,
        uint256 timestamp
    );
    event MerkleClaimProcessed(
        uint256 indexed airdropId,
        address indexed claimant,
        uint256 amount,
        uint256 timestamp
    );

    // Data structures
    struct MerkleAirdrop {
        bytes32 merkleRoot;
        address tokenAddress;
        uint256 totalAmount;
        uint256 claimedAmount;
        uint256 startTime;
        uint256 endTime;
        bool active;
        address creator;
    }

    // State variables
    uint256 private merkleAirdropCounter;
    mapping(uint256 => MerkleAirdrop) private merkleAirdrops;
    mapping(uint256 => mapping(address => bool)) private merkleClaimClaimed;
    mapping(uint256 => mapping(address => uint256)) private merkleClaims;

    constructor() Ownable(msg.sender) {}

    // ==================== Read-Only Functions ====================

    /**
     * @dev Get merkle airdrop details
     */
    function getMerkleAirdrop(uint256 airdropId)
        public
        view
        returns (MerkleAirdrop memory)
    {
        require(merkleAirdrops[airdropId].creator != address(0), "Airdrop not found");
        return merkleAirdrops[airdropId];
    }

    /**
     * @dev Check if address has claimed from merkle airdrop
     */
    function hasMerkleClaimed(uint256 airdropId, address claimant)
        public
        view
        returns (bool)
    {
        return merkleClaimClaimed[airdropId][claimant];
    }

    /**
     * @dev Get claim amount for merkle airdrop
     */
    function getMerkleClaimAmount(uint256 airdropId, address claimant)
        public
        view
        returns (uint256)
    {
        return merkleClaims[airdropId][claimant];
    }

    /**
     * @dev Verify merkle proof
     */
    function verifyMerkleProof(
        uint256 airdropId,
        address claimant,
        uint256 amount,
        bytes32[] calldata proof
    ) public view returns (bool) {
        MerkleAirdrop memory airdrop = merkleAirdrops[airdropId];
        require(airdrop.creator != address(0), "Airdrop not found");

        bytes32 leaf = keccak256(abi.encodePacked(claimant, amount));
        return MerkleProof.verify(proof, airdrop.merkleRoot, leaf);
    }

    // ==================== Public Functions ====================

    /**
     * @dev Create a new merkle-based airdrop
     */
    function createMerkleAirdrop(
        bytes32 merkleRoot,
        address tokenAddress,
        uint256 totalAmount,
        uint256 startTime,
        uint256 endTime
    ) public onlyOwner returns (uint256) {
        require(tokenAddress != address(0), "Invalid token address");
        require(totalAmount > 0, "Invalid amount");
        require(startTime < endTime, "Invalid time range");
        require(merkleRoot != bytes32(0), "Invalid merkle root");

        merkleAirdropCounter++;
        uint256 newAirdropId = merkleAirdropCounter;

        merkleAirdrops[newAirdropId] = MerkleAirdrop({
            merkleRoot: merkleRoot,
            tokenAddress: tokenAddress,
            totalAmount: totalAmount,
            claimedAmount: 0,
            startTime: startTime,
            endTime: endTime,
            active: true,
            creator: msg.sender
        });

        emit MerkleRootUpdated(newAirdropId, merkleRoot, block.timestamp);

        return newAirdropId;
    }

    /**
     * @dev Claim tokens using merkle proof
     */
    function claimMerkleTokens(
        uint256 airdropId,
        uint256 amount,
        bytes32[] calldata proof
    ) public nonReentrant whenNotPaused {
        MerkleAirdrop storage airdrop = merkleAirdrops[airdropId];

        require(airdrop.creator != address(0), "Airdrop not found");
        require(airdrop.active, "Airdrop inactive");
        require(block.timestamp >= airdrop.startTime, "Airdrop not started");
        require(block.timestamp <= airdrop.endTime, "Airdrop ended");
        require(!merkleClaimClaimed[airdropId][msg.sender], "Already claimed");
        require(amount > 0, "Invalid amount");

        // Verify merkle proof
        require(
            verifyMerkleProof(airdropId, msg.sender, amount, proof),
            "Invalid proof"
        );

        // Mark as claimed
        merkleClaimClaimed[airdropId][msg.sender] = true;
        merkleClaims[airdropId][msg.sender] = amount;
        airdrop.claimedAmount += amount;

        // Transfer tokens
        require(
            IERC20(airdrop.tokenAddress).transfer(msg.sender, amount),
            "Transfer failed"
        );

        emit MerkleClaimProcessed(airdropId, msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Update merkle root for an airdrop
     */
    function updateMerkleRoot(uint256 airdropId, bytes32 newMerkleRoot)
        public
        onlyOwner
    {
        MerkleAirdrop storage airdrop = merkleAirdrops[airdropId];
        require(airdrop.creator != address(0), "Airdrop not found");
        require(newMerkleRoot != bytes32(0), "Invalid merkle root");

        airdrop.merkleRoot = newMerkleRoot;

        emit MerkleRootUpdated(airdropId, newMerkleRoot, block.timestamp);
    }

    /**
     * @dev Deactivate merkle airdrop
     */
    function deactivateMerkleAirdrop(uint256 airdropId) public onlyOwner {
        MerkleAirdrop storage airdrop = merkleAirdrops[airdropId];
        require(airdrop.creator != address(0), "Airdrop not found");

        airdrop.active = false;
    }

    /**
     * @dev Pause claiming
     */
    function pauseClaiming() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause claiming
     */
    function unpauseClaiming() public onlyOwner {
        _unpause();
    }
}

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

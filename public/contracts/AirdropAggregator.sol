// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AirdropAggregator
 * @dev Advanced aggregator for multiple simultaneous airdrops - NEW FEATURE FOR BASE
 * Allows users to claim from multiple airdrops in a single transaction
 */
contract AirdropAggregator is Ownable, ReentrancyGuard {
    // Events
    event AggregatedClaimProcessed(
        address indexed claimant,
        uint256[] airdropIds,
        uint256 totalAmount,
        uint256 claimTime
    );
    event AirdropRegistered(
        uint256 indexed airdropId,
        address airdropContract
    );

    // Data structures
    struct AirdropReference {
        address airdropContract;
        bool active;
    }

    // State variables
    mapping(uint256 => AirdropReference) private registeredAirdrops;

    constructor() Ownable(msg.sender) {}

    // ==================== Public Functions ====================

    /**
     * @dev Register an airdrop contract for aggregation
     */
    function registerAirdrop(uint256 airdropId, address airdropContract)
        public
        onlyOwner
    {
        require(airdropContract != address(0), "Invalid contract");
        registeredAirdrops[airdropId] = AirdropReference({
            airdropContract: airdropContract,
            active: true
        });
        emit AirdropRegistered(airdropId, airdropContract);
    }

    /**
     * @dev Claim from multiple airdrops in single transaction
     * @param airdropIds Array of airdrop IDs to claim from
     */
    function aggregatedClaim(uint256[] calldata airdropIds) public nonReentrant {
        require(airdropIds.length > 0, "No airdrops specified");
        require(airdropIds.length <= 20, "Too many airdrops");

        uint256 totalAmount = 0;
        IAirdropManager[] memory managers = new IAirdropManager[](airdropIds.length);

        // Validate and prepare claims
        for (uint256 i = 0; i < airdropIds.length; i++) {
            require(
                registeredAirdrops[airdropIds[i]].active,
                "Airdrop not active"
            );

            IAirdropManager manager = IAirdropManager(
                registeredAirdrops[airdropIds[i]].airdropContract
            );
            managers[i] = manager;

            uint256 allocation = manager.getAllocation(airdropIds[i], msg.sender);
            require(allocation > 0, "Not eligible for airdrop");
            require(!manager.hasClaimed(airdropIds[i], msg.sender).claimed, "Already claimed");

            totalAmount += allocation;
        }

        // Execute claims
        for (uint256 i = 0; i < airdropIds.length; i++) {
            managers[i].claimTokens(airdropIds[i]);
        }

        emit AggregatedClaimProcessed(
            msg.sender,
            airdropIds,
            totalAmount,
            block.timestamp
        );
    }

    /**
     * @dev Get registered airdrop info
     */
    function getAirdropReference(uint256 airdropId)
        public
        view
        returns (AirdropReference memory)
    {
        return registeredAirdrops[airdropId];
    }
}

interface IAirdropManager {
    function getAllocation(uint256 airdropId, address recipient)
        external
        view
        returns (uint256);

    function hasClaimed(uint256 airdropId, address recipient)
        external
        view
        returns (
            bool claimed,
            uint256 amount,
            uint256 claimTime
        );

    function claimTokens(uint256 airdropId) external;
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title NFTAirdropManager
 * @notice Manages ERC721 and ERC1155 NFT airdrops with metadata and batch distribution
 * @dev Supports both single NFTs (ERC721) and multi-copy NFTs (ERC1155)
 */
contract NFTAirdropManager is Ownable, ReentrancyGuard, Pausable {
    
    enum NFTType { ERC721, ERC1155 }
    
    struct NFTAirdrop {
        address nftContract;
        NFTType nftType;
        string name;
        string description;
        uint256 totalNFTs;
        uint256 claimedNFTs;
        uint256 startTime;
        uint256 endTime;
        bool active;
    }
    
    struct NFTAllocation {
        uint256 airdropId;
        address recipient;
        uint256 tokenId;
        uint256 quantity; // for ERC1155
        bool claimed;
    }
    
    struct NFTMetadata {
        uint256 tokenId;
        string name;
        string description;
        string imageURI;
        string rarity; // common, uncommon, rare, epic, legendary
    }
    
    mapping(uint256 => NFTAirdrop) public airdrops;
    mapping(uint256 => mapping(address => NFTAllocation[])) public allocations;
    mapping(uint256 => mapping(uint256 => NFTMetadata)) public metadata;
    mapping(uint256 => mapping(address => bool)) public claimed;
    
    uint256 public airdropCounter;
    
    event NFTAirdropCreated(
        uint256 indexed airdropId,
        address indexed nftContract,
        NFTType nftType,
        uint256 totalNFTs,
        uint256 startTime
    );
    
    event NFTAllocated(
        uint256 indexed airdropId,
        address indexed recipient,
        uint256 tokenId,
        uint256 quantity
    );
    
    event NFTClaimed(
        uint256 indexed airdropId,
        address indexed recipient,
        uint256 tokenId,
        uint256 quantity
    );
    
    event MetadataSet(
        uint256 indexed airdropId,
        uint256 indexed tokenId,
        string name,
        string rarity
    );
    
    /**
     * @notice Create a new NFT airdrop campaign
     * @param nftContract Address of the ERC721 or ERC1155 contract
     * @param nftType Type of NFT contract (ERC721 or ERC1155)
     * @param name Campaign name
     * @param description Campaign description
     * @param totalNFTs Total NFTs to distribute
     * @param startTime Campaign start time
     * @param endTime Campaign end time
     * @return airdropId The ID of the created airdrop
     */
    function createNFTAirdrop(
        address nftContract,
        NFTType nftType,
        string memory name,
        string memory description,
        uint256 totalNFTs,
        uint256 startTime,
        uint256 endTime
    ) external onlyOwner returns (uint256) {
        require(nftContract != address(0), "Invalid NFT contract");
        require(startTime < endTime, "Invalid time range");
        require(totalNFTs > 0, "Must have at least 1 NFT");
        
        uint256 airdropId = airdropCounter++;
        
        airdrops[airdropId] = NFTAirdrop({
            nftContract: nftContract,
            nftType: nftType,
            name: name,
            description: description,
            totalNFTs: totalNFTs,
            claimedNFTs: 0,
            startTime: startTime,
            endTime: endTime,
            active: true
        });
        
        emit NFTAirdropCreated(airdropId, nftContract, nftType, totalNFTs, startTime);
        return airdropId;
    }
    
    /**
     * @notice Set metadata for NFT tokens in an airdrop
     * @param airdropId The airdrop ID
     * @param tokenIds Array of token IDs
     * @param names Array of token names
     * @param imageURIs Array of image URIs
     * @param rarities Array of rarity levels
     */
    function setNFTMetadata(
        uint256 airdropId,
        uint256[] calldata tokenIds,
        string[] calldata names,
        string[] calldata imageURIs,
        string[] calldata rarities
    ) external onlyOwner {
        require(tokenIds.length == names.length, "Array length mismatch");
        require(tokenIds.length == imageURIs.length, "Array length mismatch");
        require(tokenIds.length == rarities.length, "Array length mismatch");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            metadata[airdropId][tokenIds[i]] = NFTMetadata({
                tokenId: tokenIds[i],
                name: names[i],
                description: string(abi.encodePacked("Token #", _uint2str(tokenIds[i]))),
                imageURI: imageURIs[i],
                rarity: rarities[i]
            });
            
            emit MetadataSet(airdropId, tokenIds[i], names[i], rarities[i]);
        }
    }
    
    /**
     * @notice Allocate NFTs to recipients
     * @param airdropId The airdrop ID
     * @param recipients Array of recipient addresses
     * @param tokenIds Array of token IDs to distribute
     * @param quantities Array of quantities (for ERC1155)
     */
    function batchAllocateNFTs(
        uint256 airdropId,
        address[] calldata recipients,
        uint256[] calldata tokenIds,
        uint256[] calldata quantities
    ) external onlyOwner {
        require(recipients.length == tokenIds.length, "Array length mismatch");
        require(recipients.length <= 500, "Too many allocations");
        require(airdrops[airdropId].active, "Airdrop not active");
        
        NFTAirdrop storage airdrop = airdrops[airdropId];
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            
            uint256 qty = airdrop.nftType == NFTType.ERC721 ? 1 : quantities[i];
            
            allocations[airdropId][recipients[i]].push(NFTAllocation({
                airdropId: airdropId,
                recipient: recipients[i],
                tokenId: tokenIds[i],
                quantity: qty,
                claimed: false
            }));
            
            emit NFTAllocated(airdropId, recipients[i], tokenIds[i], qty);
        }
    }
    
    /**
     * @notice Claim allocated NFTs
     * @param airdropId The airdrop ID
     */
    function claimNFTs(uint256 airdropId) external nonReentrant whenNotPaused {
        require(!claimed[airdropId][msg.sender], "Already claimed");
        require(block.timestamp >= airdrops[airdropId].startTime, "Airdrop not started");
        require(block.timestamp <= airdrops[airdropId].endTime, "Airdrop ended");
        
        NFTAllocation[] storage userAllocations = allocations[airdropId][msg.sender];
        require(userAllocations.length > 0, "No NFTs allocated");
        
        NFTAirdrop storage airdrop = airdrops[airdropId];
        
        for (uint256 i = 0; i < userAllocations.length; i++) {
            require(!userAllocations[i].claimed, "NFT already claimed");
            
            userAllocations[i].claimed = true;
            airdrop.claimedNFTs += userAllocations[i].quantity;
            
            _transferNFT(airdrop, msg.sender, userAllocations[i].tokenId, userAllocations[i].quantity);
            
            emit NFTClaimed(airdropId, msg.sender, userAllocations[i].tokenId, userAllocations[i].quantity);
        }
        
        claimed[airdropId][msg.sender] = true;
    }
    
    /**
     * @notice Get user's NFT allocations for an airdrop
     * @param airdropId The airdrop ID
     * @param user User address
     * @return User's NFT allocations
     */
    function getUserNFTAllocations(uint256 airdropId, address user)
        external
        view
        returns (NFTAllocation[] memory)
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
        returns (NFTAirdrop memory)
    {
        return airdrops[airdropId];
    }
    
    /**
     * @notice Get NFT metadata
     * @param airdropId The airdrop ID
     * @param tokenId The token ID
     * @return NFT metadata
     */
    function getNFTMetadata(uint256 airdropId, uint256 tokenId)
        external
        view
        returns (NFTMetadata memory)
    {
        return metadata[airdropId][tokenId];
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
     * @notice Recover NFTs from contract (emergency only)
     * @param nftContract NFT contract address
     * @param nftType Type of NFT
     * @param tokenId Token ID to recover
     * @param quantity Quantity (for ERC1155)
     */
    function recoverNFT(
        address nftContract,
        NFTType nftType,
        uint256 tokenId,
        uint256 quantity
    ) external onlyOwner {
        if (nftType == NFTType.ERC721) {
            IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        } else {
            IERC1155(nftContract).safeTransferFrom(
                address(this),
                msg.sender,
                tokenId,
                quantity,
                ""
            );
        }
    }
    
    // Internal Functions
    
    function _transferNFT(
        NFTAirdrop storage airdrop,
        address to,
        uint256 tokenId,
        uint256 quantity
    ) internal {
        if (airdrop.nftType == NFTType.ERC721) {
            IERC721(airdrop.nftContract).transferFrom(address(this), to, tokenId);
        } else {
            IERC1155(airdrop.nftContract).safeTransferFrom(
                address(this),
                to,
                tokenId,
                quantity,
                ""
            );
        }
    }
    
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
    
    // ERC1155 Receiver
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC1155Received.selector;
    }
    
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}

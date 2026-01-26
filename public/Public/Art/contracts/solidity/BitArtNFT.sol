// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title BitArtNFT
 * @dev NFT contract for BitArt Market with royalty support and metadata storage
 */
contract BitArtNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    // Token ID counter
    Counters.Counter private tokenIdCounter;

    // Royalty information
    struct RoyaltyInfo {
        address creator;
        uint256 royaltyPercentage; // In basis points (e.g., 1000 = 10%)
    }

    // NFT Metadata
    struct NFTMetadata {
        address creator;
        string name;
        string description;
        string category;
        uint256 royaltyPercentage;
        uint256 createdAt;
    }

    // Mappings
    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(uint256 => RoyaltyInfo) public royalties;
    mapping(address => uint256[]) public creatorTokens;
    mapping(address => bool) public admins;

    // Events
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        address indexed owner,
        string name,
        uint256 royaltyPercentage
    );

    event MetadataUpdated(
        uint256 indexed tokenId,
        string name,
        string description,
        string category
    );

    event RoyaltyUpdated(
        uint256 indexed tokenId,
        uint256 royaltyPercentage
    );

    // Modifiers
    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    modifier validRoyalty(uint256 percentage) {
        require(percentage <= 5000, "Royalty too high"); // Max 50%
        _;
    }

    constructor() ERC721("BitArt", "BITA") {
        admins[msg.sender] = true;
    }

    /**
     * @dev Mint a new NFT
     * @param to Recipient address
     * @param uri Token URI
     * @param name NFT name
     * @param description NFT description
     * @param category NFT category
     * @param royaltyPercentage Royalty percentage in basis points
     */
    function mint(
        address to,
        string memory uri,
        string memory name,
        string memory description,
        string memory category,
        uint256 royaltyPercentage
    ) public validRoyalty(royaltyPercentage) returns (uint256) {
        require(to != address(0), "Invalid recipient");
        require(bytes(uri).length > 0, "URI required");

        uint256 tokenId = tokenIdCounter.current();
        tokenIdCounter.increment();

        // Mint token
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        // Store metadata
        nftMetadata[tokenId] = NFTMetadata({
            creator: msg.sender,
            name: name,
            description: description,
            category: category,
            royaltyPercentage: royaltyPercentage,
            createdAt: block.timestamp
        });

        // Store royalty info
        royalties[tokenId] = RoyaltyInfo({
            creator: msg.sender,
            royaltyPercentage: royaltyPercentage
        });

        // Track creator tokens
        creatorTokens[msg.sender].push(tokenId);

        emit NFTMinted(tokenId, msg.sender, to, name, royaltyPercentage);

        return tokenId;
    }

    /**
     * @dev Update NFT metadata
     * @param tokenId Token ID
     * @param name New name
     * @param description New description
     * @param category New category
     */
    function updateMetadata(
        uint256 tokenId,
        string memory name,
        string memory description,
        string memory category
    ) public {
        require(_exists(tokenId), "Token does not exist");
        require(nftMetadata[tokenId].creator == msg.sender, "Not creator");

        nftMetadata[tokenId].name = name;
        nftMetadata[tokenId].description = description;
        nftMetadata[tokenId].category = category;

        emit MetadataUpdated(tokenId, name, description, category);
    }

    /**
     * @dev Update royalty percentage
     * @param tokenId Token ID
     * @param newRoyaltyPercentage New royalty percentage
     */
    function updateRoyalty(uint256 tokenId, uint256 newRoyaltyPercentage)
        public
        validRoyalty(newRoyaltyPercentage)
    {
        require(_exists(tokenId), "Token does not exist");
        require(nftMetadata[tokenId].creator == msg.sender, "Not creator");

        royalties[tokenId].royaltyPercentage = newRoyaltyPercentage;
        nftMetadata[tokenId].royaltyPercentage = newRoyaltyPercentage;

        emit RoyaltyUpdated(tokenId, newRoyaltyPercentage);
    }

    /**
     * @dev Get NFT metadata
     * @param tokenId Token ID
     */
    function getMetadata(uint256 tokenId)
        public
        view
        returns (NFTMetadata memory)
    {
        require(_exists(tokenId), "Token does not exist");
        return nftMetadata[tokenId];
    }

    /**
     * @dev Get royalty information
     * @param tokenId Token ID
     */
    function getRoyaltyInfo(uint256 tokenId)
        public
        view
        returns (RoyaltyInfo memory)
    {
        require(_exists(tokenId), "Token does not exist");
        return royalties[tokenId];
    }

    /**
     * @dev Get all tokens created by an address
     * @param creator Creator address
     */
    function getCreatorTokens(address creator)
        public
        view
        returns (uint256[] memory)
    {
        return creatorTokens[creator];
    }

    /**
     * @dev Get total supply
     */
    function totalSupply() public view returns (uint256) {
        return tokenIdCounter.current();
    }

    /**
     * @dev Add admin address
     * @param admin Address to add as admin
     */
    function addAdmin(address admin) public onlyOwner {
        admins[admin] = true;
    }

    /**
     * @dev Remove admin address
     * @param admin Address to remove from admins
     */
    function removeAdmin(address admin) public onlyOwner {
        admins[admin] = false;
    }

    /**
     * @dev Check if address is admin
     * @param account Address to check
     */
    function isAdmin(address account) public view returns (bool) {
        return admins[account];
    }

    /**
     * @dev EIP-2981 royalty standard
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        public
        view
        returns (address receiver, uint256 royaltyAmount)
    {
        require(_exists(tokenId), "Token does not exist");

        RoyaltyInfo memory info = royalties[tokenId];
        uint256 amount = (salePrice * info.royaltyPercentage) / 10000;

        return (info.creator, amount);
    }

    /**
     * @dev Supports interface
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override
        returns (bool)
    {
        return
            super.supportsInterface(interfaceId) ||
            interfaceId == 0x2a55205a; // EIP2981 interface ID
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BitArtMarketplace
 * @dev NFT marketplace for buying and selling with royalty distribution
 */
contract BitArtMarketplace is Ownable, ReentrancyGuard {
    // Listing struct
    struct Listing {
        address seller;
        uint256 price;
        uint256 quantity;
        uint256 listedAt;
        uint256 expiresAt;
        bool active;
    }

    // NFT contract interface
    interface IRoyaltyInfo {
        function royaltyInfo(uint256 tokenId, uint256 salePrice)
            external
            view
            returns (address receiver, uint256 royaltyAmount);

        function ownerOf(uint256 tokenId) external view returns (address);

        function transferFrom(
            address from,
            address to,
            uint256 tokenId
        ) external;
    }

    // State variables
    IRoyaltyInfo public nftContract;
    uint256 public platformFeePercentage = 250; // 2.5% in basis points
    address public feeRecipient;
    uint256 public listingCounter;

    // Mappings
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => bool) public isListed;
    mapping(address => uint256) public sellerBalance;
    mapping(address => bool) public admins;

    // Events
    event ListingCreated(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        uint256 quantity
    );

    event ListingUpdated(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        uint256 newPrice
    );

    event ListingCanceled(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed seller
    );

    event Purchase(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed buyer,
        address seller,
        uint256 price,
        uint256 royaltyPaid
    );

    event PlatformFeeUpdated(uint256 newFee);
    event FeeRecipientUpdated(address newRecipient);

    // Modifiers
    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor(address _nftContract) {
        nftContract = IRoyaltyInfo(_nftContract);
        feeRecipient = msg.sender;
        admins[msg.sender] = true;
    }

    /**
     * @dev List an NFT for sale
     * @param tokenId NFT token ID
     * @param price Sale price in wei
     * @param quantity Number of copies (for fungible tokens, 1 for ERC721)
     * @param duration Listing duration in seconds
     */
    function listNFT(
        uint256 tokenId,
        uint256 price,
        uint256 quantity,
        uint256 duration
    ) public returns (uint256) {
        require(price > 0, "Invalid price");
        require(quantity > 0, "Invalid quantity");
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not owner");
        require(!isListed[tokenId], "Already listed");

        uint256 listingId = listingCounter++;

        listings[listingId] = Listing({
            seller: msg.sender,
            price: price,
            quantity: quantity,
            listedAt: block.timestamp,
            expiresAt: block.timestamp + duration,
            active: true
        });

        isListed[tokenId] = true;

        emit ListingCreated(listingId, tokenId, msg.sender, price, quantity);

        return listingId;
    }

    /**
     * @dev Update listing price
     * @param listingId Listing ID
     * @param newPrice New price in wei
     */
    function updateListingPrice(uint256 listingId, uint256 newPrice) public {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not seller");
        require(newPrice > 0, "Invalid price");
        require(listing.active, "Listing not active");

        listing.price = newPrice;

        emit ListingUpdated(listingId, listingId, newPrice);
    }

    /**
     * @dev Cancel a listing
     * @param listingId Listing ID
     */
    function cancelListing(uint256 listingId) public {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not seller");
        require(listing.active, "Listing not active");

        listing.active = false;
        isListed[listingId] = false;

        emit ListingCanceled(listingId, listingId, msg.sender);
    }

    /**
     * @dev Buy an NFT from a listing
     * @param listingId Listing ID
     */
    function buyNFT(uint256 listingId) public payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(block.timestamp <= listing.expiresAt, "Listing expired");
        require(msg.value >= listing.price, "Insufficient payment");

        address seller = listing.seller;
        uint256 price = listing.price;

        // Mark as no longer listed
        listing.active = false;
        isListed[listingId] = false;

        // Calculate fees
        (address royaltyReceiver, uint256 royaltyAmount) = nftContract
            .royaltyInfo(listingId, price);
        uint256 platformFee = (price * platformFeePercentage) / 10000;
        uint256 sellerProceeds = price - royaltyAmount - platformFee;

        // Update balances
        sellerBalance[seller] += sellerProceeds;
        if (royaltyAmount > 0) {
            sellerBalance[royaltyReceiver] += royaltyAmount;
        }
        sellerBalance[feeRecipient] += platformFee;

        // Transfer NFT to buyer
        nftContract.transferFrom(seller, msg.sender, listingId);

        // Handle overpayment
        if (msg.value > price) {
            (bool success, ) = msg.sender.call{value: msg.value - price}("");
            require(success, "Refund failed");
        }

        emit Purchase(
            listingId,
            listingId,
            msg.sender,
            seller,
            price,
            royaltyAmount
        );
    }

    /**
     * @dev Withdraw seller balance
     */
    function withdrawBalance() public nonReentrant {
        uint256 balance = sellerBalance[msg.sender];
        require(balance > 0, "No balance");

        sellerBalance[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Get listing information
     * @param listingId Listing ID
     */
    function getListing(uint256 listingId)
        public
        view
        returns (Listing memory)
    {
        return listings[listingId];
    }

    /**
     * @dev Update platform fee
     * @param newFee New fee in basis points
     */
    function setPlatformFee(uint256 newFee) public onlyAdmin {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFeePercentage = newFee;
        emit PlatformFeeUpdated(newFee);
    }

    /**
     * @dev Update fee recipient
     * @param newRecipient New recipient address
     */
    function setFeeRecipient(address newRecipient) public onlyOwner {
        require(newRecipient != address(0), "Invalid address");
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
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
     * @dev Get seller balance
     * @param seller Seller address
     */
    function getBalance(address seller) public view returns (uint256) {
        return sellerBalance[seller];
    }
}

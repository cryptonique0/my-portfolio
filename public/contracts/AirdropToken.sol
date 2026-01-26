// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AirdropToken
 * @dev ERC20 Token for Airdrop System on Base Chain
 */
contract AirdropToken is ERC20, ERC20Burnable, Ownable {
    // Events
    event TokenURIUpdated(string newURI);

    // State variables
    string private _tokenURI;

    constructor() ERC20("AirStack Token", "AIRST") Ownable(msg.sender) {
        _tokenURI = "https://airstack.io/token-metadata.json";
        // Mint 1 billion tokens with 6 decimals (1000000000 * 10^6)
        _mint(msg.sender, 1000000000 * 10 ** 6);
    }

    /**
     * @dev Returns the token URI metadata
     */
    function getTokenURI() public view returns (string memory) {
        return _tokenURI;
    }

    /**
     * @dev Set token URI
     */
    function setTokenURI(string memory newURI) public onlyOwner {
        _tokenURI = newURI;
        emit TokenURIUpdated(newURI);
    }

    /**
     * @dev Mint tokens (owner only)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens
     */
    function burn(uint256 amount) public override {
        require(amount > 0, "Amount must be greater than 0");
        super.burn(amount);
    }

    /**
     * @dev Override decimals to return 6
     */
    function decimals() public pure override returns (uint8) {
        return 6;
    }
}

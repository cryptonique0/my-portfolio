// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Rewards is ERC20 {
    address public owner;
    mapping(address => uint256) public claimable;

    constructor() ERC20("WCTDemo", "WCTD") {
        owner = msg.sender;
        _mint(msg.sender, 1000 * 10 ** decimals());
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function setClaimable(address user, uint256 amount) external onlyOwner {
        claimable[user] = amount;
    }

    function claim() external {
        uint256 v = claimable[msg.sender];
        require(v > 0, "nothing to claim");
        claimable[msg.sender] = 0;
        _mint(msg.sender, v);
    }
}

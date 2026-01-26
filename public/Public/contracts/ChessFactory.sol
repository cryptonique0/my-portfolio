// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Chess.sol";

/**
 * @title ChessFactory
 * @dev Factory contract for creating and managing chess games
 */
contract ChessFactory {
    Chess public chessContract;
    
    struct GameListing {
        uint256 gameId;
        address creator;
        uint256 wager;
        uint256 timestamp;
        bool filled;
    }
    
    GameListing[] public openGames;
    mapping(uint256 => uint256) public gameIdToListingIndex;
    
    event GameListingCreated(uint256 indexed gameId, address indexed creator, uint256 wager);
    event GameListingFilled(uint256 indexed gameId, address indexed joiner);
    
    constructor(address _chessContract) {
        chessContract = Chess(_chessContract);
    }
    
    /**
     * @dev Create a new open game listing
     */
    function createOpenGame() external payable returns (uint256) {
        uint256 gameId = chessContract.createGame{value: msg.value}(address(0));
        
        gameIdToListingIndex[gameId] = openGames.length;
        openGames.push(GameListing({
            gameId: gameId,
            creator: msg.sender,
            wager: msg.value,
            timestamp: block.timestamp,
            filled: false
        }));
        
        emit GameListingCreated(gameId, msg.sender, msg.value);
        return gameId;
    }
    
    /**
     * @dev Join an open game
     */
    function joinOpenGame(uint256 gameId) external payable {
        uint256 listingIndex = gameIdToListingIndex[gameId];
        require(listingIndex < openGames.length, "Game listing not found");
        require(!openGames[listingIndex].filled, "Game already filled");
        require(msg.value == openGames[listingIndex].wager, "Incorrect wager");
        
        chessContract.joinGame{value: msg.value}(gameId);
        openGames[listingIndex].filled = true;
        
        emit GameListingFilled(gameId, msg.sender);
    }
    
    /**
     * @dev Get all open games
     */
    function getOpenGames() external view returns (GameListing[] memory) {
        uint256 openCount = 0;
        for (uint256 i = 0; i < openGames.length; i++) {
            if (!openGames[i].filled) {
                openCount++;
            }
        }
        
        GameListing[] memory result = new GameListing[](openCount);
        uint256 index = 0;
        for (uint256 i = 0; i < openGames.length; i++) {
            if (!openGames[i].filled) {
                result[index] = openGames[i];
                index++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Create a private game with specific opponent
     */
    function createPrivateGame(address opponent) external payable returns (uint256) {
        return chessContract.createGame{value: msg.value}(opponent);
    }
}

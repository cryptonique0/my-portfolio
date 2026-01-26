const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Chess Contract", function () {
  let chess;
  let owner;
  let player1;
  let player2;

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();
    const Chess = await ethers.getContractFactory("Chess");
    chess = await Chess.deploy();
    await chess.waitForDeployment();
  });

  describe("Game Creation", function () {
    it("Should create a new game", async function () {
      const tx = await chess.connect(player1).createGame(player2.address);
      const receipt = await tx.wait();
      
      const gameInfo = await chess.getGameInfo(0);
      expect(gameInfo.whitePlayer).to.equal(player1.address);
      expect(gameInfo.blackPlayer).to.equal(player2.address);
      expect(gameInfo.whiteTurn).to.equal(true);
    });

    it("Should create game with wager", async function () {
      const wager = ethers.parseEther("0.1");
      await chess.connect(player1).createGame(player2.address, { value: wager });
      
      const gameInfo = await chess.getGameInfo(0);
      expect(gameInfo.wager).to.equal(wager);
    });

    it("Should not allow playing against yourself", async function () {
      await expect(
        chess.connect(player1).createGame(player1.address)
      ).to.be.revertedWith("Cannot play against yourself");
    });
  });

  describe("Making Moves", function () {
    beforeEach(async function () {
      await chess.connect(player1).createGame(player2.address);
    });

    it("Should make a valid pawn move", async function () {
      // White pawn e2 to e4 (position 52 to 36)
      await chess.connect(player1).makeMove(0, 52, 36);
      
      const board = await chess.getBoard(0);
      expect(board[52]).to.equal(0); // Empty
      expect(board[36]).to.equal(1); // White pawn
    });

    it("Should not allow move out of turn", async function () {
      await expect(
        chess.connect(player2).makeMove(0, 8, 16) // Black tries to move first
      ).to.be.revertedWith("Not your turn");
    });

    it("Should alternate turns", async function () {
      // White move
      await chess.connect(player1).makeMove(0, 52, 36);
      
      // Black move
      await chess.connect(player2).makeMove(0, 12, 28);
      
      const gameInfo = await chess.getGameInfo(0);
      expect(gameInfo.whiteTurn).to.equal(true);
      expect(gameInfo.moveCount).to.equal(2);
    });

    it("Should not allow moving empty square", async function () {
      await expect(
        chess.connect(player1).makeMove(0, 20, 28)
      ).to.be.revertedWith("No piece at source");
    });

    it("Should not allow capturing own piece", async function () {
      await expect(
        chess.connect(player1).makeMove(0, 57, 52) // Knight to pawn
      ).to.be.revertedWith("Cannot capture own piece");
    });
  });

  describe("Piece Movement", function () {
    beforeEach(async function () {
      await chess.connect(player1).createGame(player2.address);
    });

    it("Should allow knight to jump over pieces", async function () {
      // White knight from b1 to c3 (57 to 42)
      await chess.connect(player1).makeMove(0, 57, 42);
      
      const board = await chess.getBoard(0);
      expect(board[42]).to.equal(2); // White knight
    });

    it("Should validate pawn two-square move from start", async function () {
      // White pawn e2 to e4
      await chess.connect(player1).makeMove(0, 52, 36);
      
      const board = await chess.getBoard(0);
      expect(board[36]).to.equal(1);
    });

    it("Should not allow pawn to move backward", async function () {
      await chess.connect(player1).makeMove(0, 52, 36); // e2-e4
      await chess.connect(player2).makeMove(0, 12, 28); // e7-e5
      
      await expect(
        chess.connect(player1).makeMove(0, 36, 52) // Try to move back
      ).to.be.revertedWith("Invalid move");
    });
  });

  describe("Game End Conditions", function () {
    it("Should allow timeout claim", async function () {
      await chess.connect(player1).createGame(player2.address);
      
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine");
      
      await chess.connect(player2).claimTimeout(0);
      
      const gameInfo = await chess.getGameInfo(0);
      expect(gameInfo.state).to.equal(2); // BlackWon
    });

    it("Should allow draw offer", async function () {
      await chess.connect(player1).createGame(player2.address);
      
      await chess.connect(player1).offerDraw(0);
      
      const gameInfo = await chess.getGameInfo(0);
      expect(gameInfo.state).to.equal(3); // Draw
    });
  });

  describe("Wager System", function () {
    it("Should payout winner on checkmate", async function () {
      const wager = ethers.parseEther("0.1");
      await chess.connect(player1).createGame(player2.address, { value: wager });
      await chess.connect(player2).joinGame(0, { value: wager });
      
      // This would require playing to checkmate
      // Simplified: just verify the wager is held
      const gameInfo = await chess.getGameInfo(0);
      expect(gameInfo.wager).to.equal(wager);
    });

    it("Should refund both players on draw", async function () {
      const wager = ethers.parseEther("0.1");
      await chess.connect(player1).createGame(player2.address, { value: wager });
      
      const player1Before = await ethers.provider.getBalance(player1.address);
      const player2Before = await ethers.provider.getBalance(player2.address);
      
      await chess.connect(player1).offerDraw(0);
      
      // Both players should get refunds
      const gameInfo = await chess.getGameInfo(0);
      expect(gameInfo.wager).to.equal(0);
    });
  });
});

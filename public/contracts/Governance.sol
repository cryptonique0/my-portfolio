// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Governance
 * @dev Governance and DAO contract for community voting on airdrop parameters
 */
contract Governance is Ownable {
    // Custom errors
    error ProposalNotFound();
    error AlreadyVoted();
    error VotingClosed();
    error NotEligible();

    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint256 startTime,
        uint256 endTime
    );
    event VoteCasted(
        uint256 indexed proposalId,
        address indexed voter,
        bool position,
        uint256 votingPower
    );
    event ProposalExecuted(uint256 indexed proposalId);
    event GovernanceTokensAllocated(address indexed holder, uint256 amount);
    event GovernanceActiveStatusChanged(bool isActive);

    // Data structures
    struct Proposal {
        string title;
        string description;
        address proposer;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        bool active;
    }

    struct Vote {
        bool voted;
        bool position; // true = yes, false = no
        uint256 voteTime;
        uint256 votingPower;
    }

    // State variables
    uint256 private proposalCounter;
    bool private governanceActive = true;

    mapping(uint256 => Proposal) private proposals;
    mapping(uint256 => mapping(address => Vote)) private votes;
    mapping(address => uint256) private governanceTokens;

    constructor() Ownable(msg.sender) {}

    // ==================== Read-Only Functions ====================

    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 proposalId)
        public
        view
        returns (Proposal memory)
    {
        require(proposals[proposalId].proposer != address(0), "Proposal not found");
        return proposals[proposalId];
    }

    /**
     * @dev Check if address has voted on proposal
     */
    function hasVoted(uint256 proposalId, address voter)
        public
        view
        returns (bool)
    {
        return votes[proposalId][voter].voted;
    }

    /**
     * @dev Get vote details
     */
    function getVote(uint256 proposalId, address voter)
        public
        view
        returns (Vote memory)
    {
        return votes[proposalId][voter];
    }

    /**
     * @dev Get governance token balance
     */
    function getGovernanceBalance(address holder)
        public
        view
        returns (uint256)
    {
        return governanceTokens[holder];
    }

    /**
     * @dev Check if proposal is still active for voting
     */
    function isProposalActive(uint256 proposalId) public view returns (bool) {
        Proposal memory proposal = proposals[proposalId];
        return (proposal.active && block.timestamp < proposal.endTime);
    }

    /**
     * @dev Get proposal status (PASSED or FAILED)
     */
    function getProposalStatus(uint256 proposalId)
        public
        view
        returns (string memory)
    {
        Proposal memory proposal = proposals[proposalId];
        require(proposal.proposer != address(0), "Proposal not found");

        if (proposal.yesVotes > proposal.noVotes) {
            return "PASSED";
        } else if (proposal.noVotes > proposal.yesVotes) {
            return "FAILED";
        } else {
            return "TIE";
        }
    }

    /**
     * @dev Get proposal counter
     */
    function getProposalCounter() public view returns (uint256) {
        return proposalCounter;
    }

    /**
     * @dev Check if governance is active
     */
    function isGovernanceActive() public view returns (bool) {
        return governanceActive;
    }

    // ==================== Public Functions ====================

    /**
     * @dev Create a new proposal
     */
    function createProposal(
        string memory title,
        string memory description,
        uint256 duration
    ) public returns (uint256) {
        require(governanceActive, "Governance is inactive");
        require(governanceTokens[msg.sender] > 0, "Not eligible to propose");
        require(bytes(title).length > 0, "Title required");
        require(duration > 0, "Invalid duration");
        require(duration <= 30 days, "Duration too long");

        proposalCounter++;
        uint256 newProposalId = proposalCounter;

        uint256 startTime = block.timestamp;
        uint256 endTime = block.timestamp + duration;

        proposals[newProposalId] = Proposal({
            title: title,
            description: description,
            proposer: msg.sender,
            yesVotes: 0,
            noVotes: 0,
            startTime: startTime,
            endTime: endTime,
            executed: false,
            active: true
        });

        emit ProposalCreated(newProposalId, msg.sender, title, startTime, endTime);

        return newProposalId;
    }

    /**
     * @dev Vote on a proposal
     */
    function vote(uint256 proposalId, bool position) public {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.proposer != address(0), "Proposal not found");
        require(!votes[proposalId][msg.sender].voted, "Already voted");
        require(isProposalActive(proposalId), "Voting closed");
        require(governanceTokens[msg.sender] > 0, "Not eligible");

        uint256 votingPower = governanceTokens[msg.sender];

        votes[proposalId][msg.sender] = Vote({
            voted: true,
            position: position,
            voteTime: block.timestamp,
            votingPower: votingPower
        });

        if (position) {
            proposal.yesVotes += votingPower;
        } else {
            proposal.noVotes += votingPower;
        }

        emit VoteCasted(proposalId, msg.sender, position, votingPower);
    }

    /**
     * @dev Allocate governance tokens to an address
     */
    function allocateGovernanceTokens(address holder, uint256 amount)
        public
        onlyOwner
    {
        require(holder != address(0), "Invalid address");
        require(amount > 0, "Invalid amount");

        governanceTokens[holder] = amount;

        emit GovernanceTokensAllocated(holder, amount);
    }

    /**
     * @dev Batch allocate governance tokens
     */
    function batchAllocateGovernanceTokens(
        address[] calldata holders,
        uint256[] calldata amounts
    ) public onlyOwner {
        require(holders.length == amounts.length, "Length mismatch");
        require(holders.length <= 500, "Too many holders");

        for (uint256 i = 0; i < holders.length; i++) {
            require(holders[i] != address(0), "Invalid address");
            require(amounts[i] > 0, "Invalid amount");

            governanceTokens[holders[i]] = amounts[i];

            emit GovernanceTokensAllocated(holders[i], amounts[i]);
        }
    }

    /**
     * @dev Execute a proposal (close voting)
     */
    function executeProposal(uint256 proposalId) public onlyOwner {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.proposer != address(0), "Proposal not found");
        require(proposal.active, "Proposal already executed");
        require(block.timestamp > proposal.endTime, "Voting still active");

        proposal.executed = true;
        proposal.active = false;

        emit ProposalExecuted(proposalId);
    }

    /**
     * @dev Toggle governance active status
     */
    function toggleGovernanceStatus() public onlyOwner {
        governanceActive = !governanceActive;
        emit GovernanceActiveStatusChanged(governanceActive);
    }
}

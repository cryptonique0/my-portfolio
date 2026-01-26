// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title VestingSchedule
 * @dev Allows for time-locked token distributions with cliff and linear vesting
 */
contract VestingSchedule is Ownable, ReentrancyGuard {
    // Custom errors
    error ScheduleNotFound();
    error AlreadyExists();
    error NothingToClaim();
    error InvalidSchedule();

    // Events
    event VestingScheduleCreated(
        uint256 indexed scheduleId,
        address indexed beneficiary,
        uint256 totalAmount,
        uint256 startTime,
        uint256 cliffTime,
        uint256 endTime
    );
    event TokensClaimed(
        uint256 indexed scheduleId,
        address indexed beneficiary,
        uint256 amount,
        uint256 claimedTime
    );
    event VestingScheduleUpdated(
        uint256 indexed scheduleId,
        address indexed beneficiary
    );

    // Data structures
    struct Schedule {
        address beneficiary;
        uint256 totalAmount;
        uint256 claimedAmount;
        uint256 startTime;
        uint256 cliffTime;
        uint256 endTime;
        address tokenContract;
        bool active;
    }

    struct ScheduleClaim {
        uint256 claimedAmount;
        uint256 lastClaimTime;
    }

    // State variables
    uint256 private scheduleCounter;
    mapping(uint256 => Schedule) private vestingSchedules;
    mapping(uint256 => ScheduleClaim) private scheduleClaims;

    constructor() Ownable(msg.sender) {}

    // ==================== Read-Only Functions ====================

    /**
     * @dev Get vesting schedule details
     */
    function getVestingSchedule(uint256 scheduleId)
        public
        view
        returns (Schedule memory)
    {
        require(vestingSchedules[scheduleId].beneficiary != address(0), "Schedule not found");
        return vestingSchedules[scheduleId];
    }

    /**
     * @dev Get claimed amount for a schedule
     */
    function getClaimedAmount(uint256 scheduleId)
        public
        view
        returns (ScheduleClaim memory)
    {
        return scheduleClaims[scheduleId];
    }

    /**
     * @dev Calculate vested amount based on schedule
     */
    function calculateVested(uint256 scheduleId) public view returns (uint256) {
        Schedule memory schedule = vestingSchedules[scheduleId];
        require(schedule.beneficiary != address(0), "Schedule not found");

        if (block.timestamp < schedule.cliffTime) {
            return 0;
        }

        if (block.timestamp >= schedule.endTime) {
            return schedule.totalAmount;
        }

        uint256 elapsed = block.timestamp - schedule.cliffTime;
        uint256 totalDuration = schedule.endTime - schedule.cliffTime;
        uint256 vested = (schedule.totalAmount * elapsed) / totalDuration;

        return vested;
    }

    /**
     * @dev Get claimable amount (vested - already claimed)
     */
    function getClaimableAmount(uint256 scheduleId)
        public
        view
        returns (uint256)
    {
        Schedule memory schedule = vestingSchedules[scheduleId];
        require(schedule.beneficiary != address(0), "Schedule not found");

        uint256 vested = calculateVested(scheduleId);
        uint256 alreadyClaimed = scheduleClaims[scheduleId].claimedAmount;

        return vested > alreadyClaimed ? vested - alreadyClaimed : 0;
    }

    /**
     * @dev Get schedule counter
     */
    function getScheduleCounter() public view returns (uint256) {
        return scheduleCounter;
    }

    // ==================== Public Functions ====================

    /**
     * @dev Create a new vesting schedule
     */
    function createVestingSchedule(
        address tokenContract,
        address beneficiary,
        uint256 totalAmount,
        uint256 startTime,
        uint256 cliffTime,
        uint256 endTime
    ) public onlyOwner returns (uint256) {
        require(tokenContract != address(0), "Invalid token contract");
        require(beneficiary != address(0), "Invalid beneficiary");
        require(totalAmount > 0, "Amount must be greater than 0");
        require(startTime < cliffTime, "Start must be before cliff");
        require(cliffTime < endTime, "Cliff must be before end");
        require(startTime >= block.timestamp, "Start time must be in future");

        scheduleCounter++;
        uint256 newScheduleId = scheduleCounter;

        vestingSchedules[newScheduleId] = Schedule({
            beneficiary: beneficiary,
            totalAmount: totalAmount,
            claimedAmount: 0,
            startTime: startTime,
            cliffTime: cliffTime,
            endTime: endTime,
            tokenContract: tokenContract,
            active: true
        });

        emit VestingScheduleCreated(
            newScheduleId,
            beneficiary,
            totalAmount,
            startTime,
            cliffTime,
            endTime
        );

        return newScheduleId;
    }

    /**
     * @dev Claim vested tokens
     */
    function claimVestedTokens(uint256 scheduleId) public nonReentrant {
        Schedule storage schedule = vestingSchedules[scheduleId];
        require(schedule.beneficiary != address(0), "Schedule not found");
        require(schedule.active, "Schedule is inactive");
        require(msg.sender == schedule.beneficiary, "Not beneficiary");

        uint256 claimableAmount = getClaimableAmount(scheduleId);
        require(claimableAmount > 0, "Nothing to claim");

        schedule.claimedAmount += claimableAmount;
        scheduleClaims[scheduleId].claimedAmount += claimableAmount;
        scheduleClaims[scheduleId].lastClaimTime = block.timestamp;

        require(
            IERC20(schedule.tokenContract).transfer(
                msg.sender,
                claimableAmount
            ),
            "Transfer failed"
        );

        emit TokensClaimed(scheduleId, msg.sender, claimableAmount, block.timestamp);
    }

    /**
     * @dev Update vesting schedule (owner only)
     */
    function updateVestingSchedule(
        uint256 scheduleId,
        uint256 newEndTime
    ) public onlyOwner {
        Schedule storage schedule = vestingSchedules[scheduleId];
        require(schedule.beneficiary != address(0), "Schedule not found");
        require(newEndTime > schedule.cliffTime, "Invalid end time");
        require(newEndTime > block.timestamp, "End time must be in future");

        schedule.endTime = newEndTime;

        emit VestingScheduleUpdated(scheduleId, schedule.beneficiary);
    }

    /**
     * @dev Deactivate a schedule
     */
    function deactivateSchedule(uint256 scheduleId) public onlyOwner {
        Schedule storage schedule = vestingSchedules[scheduleId];
        require(schedule.beneficiary != address(0), "Schedule not found");
        schedule.active = false;
    }
}

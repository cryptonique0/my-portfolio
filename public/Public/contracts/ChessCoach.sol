// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ChessCoach
 * @dev Platform for certified coaches to offer lessons and coaching sessions
 */
contract ChessCoach {
    
    enum SessionType { OneOnOne, Group, Analysis, Opening, Endgame }
    enum SessionStatus { Scheduled, Completed, Cancelled, Disputed }
    
    struct Coach {
        address wallet;
        string name;
        string bio;
        string certificationURI; // IPFS URI for credentials
        uint256 hourlyRate; // in wei
        uint256 rating; // 0-5000 (allows decimals via /100)
        uint256 totalSessions;
        uint256 totalStudents;
        uint256 totalEarnings;
        bool isActive;
        bool isCertified;
        uint256 joinedTimestamp;
        uint256[] specialties; // Indices to specialty strings
    }
    
    struct Student {
        address wallet;
        uint256 totalSessionsBooked;
        uint256 totalSpent;
        mapping(address => bool) hasRatedCoach;
    }
    
    struct CoachingSession {
        uint256 sessionId;
        address coach;
        address student;
        SessionType sessionType;
        SessionStatus status;
        uint256 scheduledTime;
        uint256 duration; // in minutes
        uint256 price;
        string contentURI; // IPFS URI for session notes/materials
        uint256 completedTimestamp;
        bool isPaid;
        uint256 rating; // 0-500 (5 stars * 100)
        string feedback;
    }
    
    struct Certification {
        string name;
        string issuer;
        uint256 issuedDate;
        string credentialURI;
        bool isValid;
    }
    
    // State variables
    mapping(address => Coach) public coaches;
    mapping(address => Student) public students;
    mapping(uint256 => CoachingSession) public sessions;
    mapping(address => Certification[]) public coachCertifications;
    mapping(address => uint256[]) public coachSessions;
    mapping(address => uint256[]) public studentSessions;
    
    address[] public activeCoaches;
    string[] public specialtyList;
    
    uint256 public sessionCounter;
    uint256 public platformFeePercentage = 10; // 10%
    address public platformWallet;
    address public admin;
    
    // Escrow for session payments
    mapping(uint256 => uint256) public sessionEscrow;
    
    // Events
    event CoachRegistered(address indexed coach, string name);
    event CoachCertified(address indexed coach, string certificationName);
    event SessionBooked(uint256 indexed sessionId, address indexed coach, address indexed student, uint256 price);
    event SessionCompleted(uint256 indexed sessionId, address coach, address student);
    event SessionCancelled(uint256 indexed sessionId, address canceller);
    event CoachRated(address indexed coach, address indexed student, uint256 rating);
    event PaymentReleased(uint256 indexed sessionId, address coach, uint256 amount);
    event DisputeRaised(uint256 indexed sessionId, address raiser);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    modifier onlyCoach() {
        require(coaches[msg.sender].isActive, "Not an active coach");
        _;
    }
    
    modifier onlyCertifiedCoach() {
        require(coaches[msg.sender].isCertified, "Coach not certified");
        _;
    }
    
    constructor(address _platformWallet) {
        admin = msg.sender;
        platformWallet = _platformWallet;
        
        // Initialize default specialties
        specialtyList.push("Opening Theory");
        specialtyList.push("Middlegame Strategy");
        specialtyList.push("Endgame Technique");
        specialtyList.push("Tactical Training");
        specialtyList.push("Positional Play");
        specialtyList.push("Blitz & Rapid");
        specialtyList.push("Tournament Preparation");
        specialtyList.push("Beginner Fundamentals");
    }
    
    /**
     * @dev Register as a coach
     */
    function registerAsCoach(
        string memory name,
        string memory bio,
        uint256 hourlyRate,
        uint256[] memory specialtyIndices
    ) external {
        require(!coaches[msg.sender].isActive, "Already registered");
        require(hourlyRate > 0, "Rate must be positive");
        
        Coach storage coach = coaches[msg.sender];
        coach.wallet = msg.sender;
        coach.name = name;
        coach.bio = bio;
        coach.hourlyRate = hourlyRate;
        coach.isActive = true;
        coach.isCertified = false;
        coach.joinedTimestamp = block.timestamp;
        coach.specialties = specialtyIndices;
        
        activeCoaches.push(msg.sender);
        
        emit CoachRegistered(msg.sender, name);
    }
    
    /**
     * @dev Add certification for a coach (admin or self-submitted)
     */
    function addCertification(
        address coachAddress,
        string memory name,
        string memory issuer,
        string memory credentialURI
    ) external {
        require(msg.sender == admin || msg.sender == coachAddress, "Not authorized");
        require(coaches[coachAddress].isActive, "Coach not registered");
        
        Certification memory cert = Certification({
            name: name,
            issuer: issuer,
            issuedDate: block.timestamp,
            credentialURI: credentialURI,
            isValid: msg.sender == admin // Admin-added certs are auto-verified
        });
        
        coachCertifications[coachAddress].push(cert);
        
        emit CoachCertified(coachAddress, name);
    }
    
    /**
     * @dev Certify a coach (admin only)
     */
    function certifyCoach(address coachAddress) external onlyAdmin {
        require(coaches[coachAddress].isActive, "Coach not registered");
        coaches[coachAddress].isCertified = true;
    }
    
    /**
     * @dev Book a coaching session
     */
    function bookSession(
        address coachAddress,
        SessionType sessionType,
        uint256 scheduledTime,
        uint256 duration
    ) external payable returns (uint256) {
        require(coaches[coachAddress].isCertified, "Coach not certified");
        require(scheduledTime > block.timestamp, "Invalid time");
        require(duration > 0, "Invalid duration");
        
        Coach storage coach = coaches[coachAddress];
        uint256 price = (coach.hourlyRate * duration) / 60;
        require(msg.value >= price, "Insufficient payment");
        
        uint256 sessionId = sessionCounter++;
        CoachingSession storage session = sessions[sessionId];
        
        session.sessionId = sessionId;
        session.coach = coachAddress;
        session.student = msg.sender;
        session.sessionType = sessionType;
        session.status = SessionStatus.Scheduled;
        session.scheduledTime = scheduledTime;
        session.duration = duration;
        session.price = price;
        session.isPaid = false;
        
        // Store payment in escrow
        sessionEscrow[sessionId] = price;
        
        // Update records
        coachSessions[coachAddress].push(sessionId);
        studentSessions[msg.sender].push(sessionId);
        students[msg.sender].totalSessionsBooked++;
        students[msg.sender].totalSpent += price;
        
        // Refund excess payment
        if (msg.value > price) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - price}("");
            require(success, "Refund failed");
        }
        
        emit SessionBooked(sessionId, coachAddress, msg.sender, price);
        return sessionId;
    }
    
    /**
     * @dev Complete a session (called by coach)
     */
    function completeSession(uint256 sessionId, string memory contentURI) external {
        CoachingSession storage session = sessions[sessionId];
        require(session.coach == msg.sender, "Not session coach");
        require(session.status == SessionStatus.Scheduled, "Invalid status");
        require(block.timestamp >= session.scheduledTime, "Session not yet scheduled");
        
        session.status = SessionStatus.Completed;
        session.completedTimestamp = block.timestamp;
        session.contentURI = contentURI;
        
        emit SessionCompleted(sessionId, session.coach, session.student);
        
        // Auto-release payment after 24 hours grace period for disputes
        // In production, this would be handled by a keeper or time-lock
    }
    
    /**
     * @dev Rate a coach after session completion
     */
    function rateCoach(uint256 sessionId, uint256 rating, string memory feedback) external {
        CoachingSession storage session = sessions[sessionId];
        require(session.student == msg.sender, "Not session student");
        require(session.status == SessionStatus.Completed, "Session not completed");
        require(rating <= 500, "Rating must be 0-500");
        require(!students[msg.sender].hasRatedCoach[session.coach], "Already rated");
        
        session.rating = rating;
        session.feedback = feedback;
        students[msg.sender].hasRatedCoach[session.coach] = true;
        
        // Update coach rating (weighted average)
        Coach storage coach = coaches[session.coach];
        uint256 totalRating = coach.rating * coach.totalSessions;
        coach.totalSessions++;
        coach.rating = (totalRating + rating) / coach.totalSessions;
        
        emit CoachRated(session.coach, msg.sender, rating);
    }
    
    /**
     * @dev Release payment to coach (after session completion + grace period)
     */
    function releasePayment(uint256 sessionId) external {
        CoachingSession storage session = sessions[sessionId];
        require(
            msg.sender == session.student || msg.sender == admin,
            "Not authorized"
        );
        require(session.status == SessionStatus.Completed, "Session not completed");
        require(!session.isPaid, "Already paid");
        require(
            block.timestamp >= session.completedTimestamp + 24 hours,
            "Grace period not ended"
        );
        
        uint256 amount = sessionEscrow[sessionId];
        uint256 platformFee = (amount * platformFeePercentage) / 100;
        uint256 coachPayment = amount - platformFee;
        
        session.isPaid = true;
        sessionEscrow[sessionId] = 0;
        
        Coach storage coach = coaches[session.coach];
        coach.totalEarnings += coachPayment;
        
        // Transfer payments
        (bool successCoach, ) = payable(session.coach).call{value: coachPayment}("");
        require(successCoach, "Coach payment failed");
        (bool successPlatform, ) = payable(platformWallet).call{value: platformFee}("");
        require(successPlatform, "Platform fee failed");
        
        emit PaymentReleased(sessionId, session.coach, coachPayment);
    }
    
    /**
     * @dev Cancel a session (before scheduled time)
     */
    function cancelSession(uint256 sessionId) external {
        CoachingSession storage session = sessions[sessionId];
        require(
            msg.sender == session.student || msg.sender == session.coach,
            "Not authorized"
        );
        require(session.status == SessionStatus.Scheduled, "Cannot cancel");
        
        session.status = SessionStatus.Cancelled;
        
        // Refund logic based on cancellation timing
        uint256 refundAmount = sessionEscrow[sessionId];
        if (msg.sender == session.coach) {
            // Coach cancels - full refund
            (bool success, ) = payable(session.student).call{value: refundAmount}("");
            require(success, "Refund failed");
        } else {
            // Student cancels
            uint256 timeUntilSession = session.scheduledTime - block.timestamp;
            if (timeUntilSession > 24 hours) {
                // More than 24h notice - full refund
                (bool success, ) = payable(session.student).call{value: refundAmount}("");
                require(success, "Refund failed");
            } else if (timeUntilSession > 2 hours) {
                // 2-24h notice - 50% refund
                (bool successStudent, ) = payable(session.student).call{value: refundAmount / 2}("");
                require(successStudent, "Student refund failed");
                (bool successCoach, ) = payable(session.coach).call{value: refundAmount / 2}("");
                require(successCoach, "Coach payment failed");
            } else {
                // Less than 2h notice - no refund
                (bool success, ) = payable(session.coach).call{value: refundAmount}("");
                require(success, "Coach payment failed");
            }
        }
        
        sessionEscrow[sessionId] = 0;
        emit SessionCancelled(sessionId, msg.sender);
    }
    
    /**
     * @dev Raise a dispute (admin will resolve)
     */
    function raiseDispute(uint256 sessionId) external {
        CoachingSession storage session = sessions[sessionId];
        require(
            msg.sender == session.student || msg.sender == session.coach,
            "Not authorized"
        );
        require(
            session.status == SessionStatus.Scheduled || 
            session.status == SessionStatus.Completed,
            "Invalid status"
        );
        
        session.status = SessionStatus.Disputed;
        emit DisputeRaised(sessionId, msg.sender);
    }
    
    /**
     * @dev Resolve dispute (admin only)
     */
    function resolveDispute(
        uint256 sessionId,
        uint256 studentRefundPercentage // 0-100
    ) external onlyAdmin {
        CoachingSession storage session = sessions[sessionId];
        require(session.status == SessionStatus.Disputed, "Not disputed");
        require(studentRefundPercentage <= 100, "Invalid percentage");
        
        uint256 amount = sessionEscrow[sessionId];
        uint256 studentRefund = (amount * studentRefundPercentage) / 100;
        uint256 coachPayment = amount - studentRefund;
        
        session.isPaid = true;
        sessionEscrow[sessionId] = 0;
        
        if (studentRefund > 0) {
            (bool successStudent, ) = payable(session.student).call{value: studentRefund}("");
            require(successStudent, "Student refund failed");
        }
        if (coachPayment > 0) {
            (bool successCoach, ) = payable(session.coach).call{value: coachPayment}("");
            require(successCoach, "Coach payment failed");
        }
        
        session.status = SessionStatus.Completed;
    }
    
    /**
     * @dev Update coach hourly rate
     */
    function updateHourlyRate(uint256 newRate) external onlyCoach {
        require(newRate > 0, "Rate must be positive");
        coaches[msg.sender].hourlyRate = newRate;
    }
    
    /**
     * @dev Update coach profile
     */
    function updateCoachProfile(
        string memory bio,
        uint256[] memory specialtyIndices
    ) external onlyCoach {
        Coach storage coach = coaches[msg.sender];
        coach.bio = bio;
        coach.specialties = specialtyIndices;
    }
    
    /**
     * @dev Get coach sessions
     */
    function getCoachSessions(address coachAddress) external view returns (uint256[] memory) {
        return coachSessions[coachAddress];
    }
    
    /**
     * @dev Get student sessions
     */
    function getStudentSessions(address studentAddress) external view returns (uint256[] memory) {
        return studentSessions[studentAddress];
    }
    
    /**
     * @dev Get coach specialties
     */
    function getCoachSpecialties(address coachAddress) external view returns (uint256[] memory) {
        return coaches[coachAddress].specialties;
    }
    
    /**
     * @dev Get all active coaches
     */
    function getActiveCoaches() external view returns (address[] memory) {
        return activeCoaches;
    }
    
    /**
     * @dev Get specialty list
     */
    function getSpecialtyList() external view returns (string[] memory) {
        return specialtyList;
    }
    
    /**
     * @dev Add specialty (admin only)
     */
    function addSpecialty(string memory specialty) external onlyAdmin {
        specialtyList.push(specialty);
    }
    
    /**
     * @dev Update platform fee (admin only)
     */
    function updatePlatformFee(uint256 newFeePercentage) external onlyAdmin {
        require(newFeePercentage <= 30, "Fee too high");
        platformFeePercentage = newFeePercentage;
    }
    
    /**
     * @dev Get coach certifications
     */
    function getCoachCertifications(address coachAddress) external view returns (Certification[] memory) {
        return coachCertifications[coachAddress];
    }
}

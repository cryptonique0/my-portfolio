/**
 * Session-Based Approvals Integration Functions
 * Production-ready JavaScript utilities for managing spending sessions
 * 
 * Usage:
 * const sessionManager = new SessionBasedApprovalsManager(vaultAddress, signer);
 * const sessionId = await sessionManager.createDailyBudget(100e18, "Marketing");
 * await sessionManager.spend(sessionId, token, amount, recipient, "reason");
 */

const ethers = require('ethers');

class SessionBasedApprovalsManager {
  constructor(vaultAddress, signerOrProvider) {
    this.vaultAddress = vaultAddress;
    this.provider = signerOrProvider;

    this.abi = [
      'function createSession(uint256 duration, uint256 totalApproved, string purpose, bool requiresApproval, address[] recipients) returns (bytes32)',
      'function approveSession(bytes32 sessionId)',
      'function spendFromSession(bytes32 sessionId, address token, uint256 amount, address recipient, string reason)',
      'function deactivateSession(bytes32 sessionId, string reason)',
      'function expireSession(bytes32 sessionId)',
      'function addSessionRecipient(bytes32 sessionId, address recipient)',
      'function removeSessionRecipient(bytes32 sessionId, address recipient)',
      'function setMinSessionDuration(uint256 duration)',
      'function setMaxSessionDuration(uint256 duration)',
      'function setDefaultApprovalQuorum(uint256 quorum)',
      'function updateGuardianToken(address _newAddress)',
      'function getSession(bytes32 sessionId) returns (tuple(bytes32 sessionId, address initiator, uint256 createdAt, uint256 expiresAt, uint256 totalApproved, uint256 totalSpent, address[] allowedRecipients, bool requiresApproval, bool isActive, string purpose, uint256 approvalsReceived, uint256 approvalsRequired, address[] approvers))',
      'function getSessionSpends(bytes32 sessionId) returns (tuple(bytes32 sessionId, address token, uint256 amount, address recipient, uint256 timestamp, string reason)[])',
      'function getSessionRemaining(bytes32 sessionId) returns (uint256)',
      'function isSessionValid(bytes32 sessionId) returns (bool)',
      'function getSessionTimeRemaining(bytes32 sessionId) returns (uint256)',
      'function getActiveSessions() returns (bytes32[])',
      'function getSessionRecipients(bytes32 sessionId) returns (address[])',
      'function isRecipientAllowed(bytes32 sessionId, address recipient) returns (bool)',
      'function getSessionTokenSpent(bytes32 sessionId, address token) returns (uint256)',
      'function getETHBalance() returns (uint256)',
      'function getTokenBalance(address token) returns (uint256)',
      'function deposit(address token, uint256 amount)',
      'function minSessionDuration() returns (uint256)',
      'function maxSessionDuration() returns (uint256)',
      'function defaultApprovalQuorum() returns (uint256)',
      'function getSessionHistoryLength() returns (uint256)',
      'function getSessionByIndex(uint256 index) returns (bytes32)',
    ];

    this.contract = new ethers.Contract(vaultAddress, this.abi, signerOrProvider);
  }

  /**
   * Create a daily budget session
   * @param {BigNumber} amount Total amount to approve
   * @param {string} purpose Reason for budget
   * @param {Array<string>} recipients Allowed recipients (empty = all)
   * @returns {string} Session ID
   */
  async createDailyBudget(amount, purpose, recipients = []) {
    console.log(`📅 Creating daily budget session...`);
    console.log(`   Amount: ${ethers.formatEther(amount)}`);
    console.log(`   Purpose: ${purpose}`);

    try {
      const tx = await this.contract.createSession(
        24 * 60 * 60,    // 1 day
        amount,
        purpose,
        false,           // Auto-spend allowed
        recipients
      );

      const receipt = await tx.wait();
      console.log(`✅ Daily budget created`);
      return receipt;
    } catch (error) {
      console.error('Error creating daily budget:', error.message);
      throw error;
    }
  }

  /**
   * Create a weekly budget session
   * @param {BigNumber} amount Total amount to approve
   * @param {string} purpose Reason for budget
   * @param {Array<string>} recipients Allowed recipients
   * @returns {Object} Transaction receipt
   */
  async createWeeklyBudget(amount, purpose, recipients = []) {
    console.log(`📅 Creating weekly budget session...`);

    try {
      const tx = await this.contract.createSession(
        7 * 24 * 60 * 60, // 7 days
        amount,
        purpose,
        false,
        recipients
      );

      const receipt = await tx.wait();
      console.log(`✅ Weekly budget created`);
      return receipt;
    } catch (error) {
      console.error('Error creating weekly budget:', error.message);
      throw error;
    }
  }

  /**
   * Create a custom duration budget
   * @param {number} durationSeconds Duration in seconds
   * @param {BigNumber} amount Amount to approve
   * @param {string} purpose Purpose
   * @param {Array<string>} recipients Recipients
   * @returns {Object} Transaction receipt
   */
  async createCustomBudget(durationSeconds, amount, purpose, recipients = []) {
    console.log(`📅 Creating custom budget...`);
    console.log(`   Duration: ${durationSeconds} seconds`);
    console.log(`   Amount: ${ethers.formatEther(amount)}`);

    try {
      const tx = await this.contract.createSession(
        durationSeconds,
        amount,
        purpose,
        false,
        recipients
      );

      const receipt = await tx.wait();
      console.log(`✅ Custom budget created`);
      return receipt;
    } catch (error) {
      console.error('Error creating budget:', error.message);
      throw error;
    }
  }

  /**
   * Create an emergency session with short duration
   * @param {BigNumber} amount Amount to approve
   * @param {number} durationSeconds Short duration (default: 1 hour)
   * @returns {Object} Transaction receipt
   */
  async createEmergencySession(amount, durationSeconds = 60 * 60) {
    console.log(`🚨 Creating emergency session...`);
    console.log(`   Amount: ${ethers.formatEther(amount)}`);
    console.log(`   Duration: ${durationSeconds} seconds`);

    try {
      const tx = await this.contract.createSession(
        durationSeconds,
        amount,
        "Emergency Operations",
        false,
        []  // Any recipient
      );

      const receipt = await tx.wait();
      console.log(`✅ Emergency session created`);
      return receipt;
    } catch (error) {
      console.error('Error creating emergency session:', error.message);
      throw error;
    }
  }

  /**
   * Approve a pending session
   * @param {string} sessionId Session ID to approve
   */
  async approveSession(sessionId) {
    console.log(`✅ Approving session ${sessionId.slice(0, 10)}...`);

    try {
      const tx = await this.contract.approveSession(sessionId);
      const receipt = await tx.wait();

      console.log(`✅ Session approved`);
      return receipt;
    } catch (error) {
      console.error('Error approving session:', error.message);
      throw error;
    }
  }

  /**
   * Execute spending from a session
   * @param {string} sessionId Session ID
   * @param {string} token Token address (0x0 for ETH)
   * @param {BigNumber} amount Amount to spend
   * @param {string} recipient Recipient address
   * @param {string} reason Reason for spending
   */
  async spend(sessionId, token, amount, recipient, reason) {
    console.log(`💸 Spending from session...`);
    console.log(`   Amount: ${ethers.formatEther(amount)}`);
    console.log(`   To: ${recipient}`);
    console.log(`   Reason: ${reason}`);

    try {
      const tx = await this.contract.spendFromSession(
        sessionId,
        token,
        amount,
        recipient,
        reason
      );

      const receipt = await tx.wait();
      console.log(`✅ Spending executed`);
      return receipt;
    } catch (error) {
      console.error('Error executing spending:', error.message);
      throw error;
    }
  }

  /**
   * Spend in batch from a session
   * @param {string} sessionId Session ID
   * @param {Array<{token, amount, recipient, reason}>} spends Array of spends
   */
  async spendBatch(sessionId, spends) {
    console.log(`💸 Executing batch spending...`);

    const results = [];
    for (const spend of spends) {
      try {
        console.log(`  → ${spend.reason}`);
        const result = await this.spend(
          sessionId,
          spend.token,
          spend.amount,
          spend.recipient,
          spend.reason
        );
        results.push({ status: 'success', ...result });
      } catch (error) {
        console.error(`  ✗ Failed: ${error.message}`);
        results.push({ status: 'failed', error: error.message });
      }
    }

    return results;
  }

  /**
   * Deactivate a session
   * @param {string} sessionId Session ID to deactivate
   * @param {string} reason Why deactivating
   */
  async deactivateSession(sessionId, reason) {
    console.log(`⛔ Deactivating session ${sessionId.slice(0, 10)}...`);
    console.log(`   Reason: ${reason}`);

    try {
      const tx = await this.contract.deactivateSession(sessionId, reason);
      const receipt = await tx.wait();

      console.log(`✅ Session deactivated`);
      return receipt;
    } catch (error) {
      console.error('Error deactivating session:', error.message);
      throw error;
    }
  }

  /**
   * Expire a session (claim it as expired)
   * @param {string} sessionId Session ID to expire
   */
  async expireSession(sessionId) {
    console.log(`⏰ Expiring session ${sessionId.slice(0, 10)}...`);

    try {
      const tx = await this.contract.expireSession(sessionId);
      const receipt = await tx.wait();

      console.log(`✅ Session expired`);
      return receipt;
    } catch (error) {
      console.error('Error expiring session:', error.message);
      throw error;
    }
  }

  /**
   * Add recipient to session
   * @param {string} sessionId Session ID
   * @param {string} recipient Recipient to add
   */
  async addRecipient(sessionId, recipient) {
    console.log(`👤 Adding recipient ${recipient.slice(0, 10)}...`);

    try {
      const tx = await this.contract.addSessionRecipient(sessionId, recipient);
      const receipt = await tx.wait();

      console.log(`✅ Recipient added`);
      return receipt;
    } catch (error) {
      console.error('Error adding recipient:', error.message);
      throw error;
    }
  }

  /**
   * Remove recipient from session
   * @param {string} sessionId Session ID
   * @param {string} recipient Recipient to remove
   */
  async removeRecipient(sessionId, recipient) {
    console.log(`🗑️ Removing recipient ${recipient.slice(0, 10)}...`);

    try {
      const tx = await this.contract.removeSessionRecipient(sessionId, recipient);
      const receipt = await tx.wait();

      console.log(`✅ Recipient removed`);
      return receipt;
    } catch (error) {
      console.error('Error removing recipient:', error.message);
      throw error;
    }
  }

  /**
   * Get session details
   * @param {string} sessionId Session ID
   * @returns {Object} Session data
   */
  async getSession(sessionId) {
    try {
      const session = await this.contract.getSession(sessionId);

      return {
        id: session.sessionId,
        initiator: session.initiator,
        createdAt: new Date(session.createdAt.toNumber() * 1000),
        expiresAt: new Date(session.expiresAt.toNumber() * 1000),
        totalApproved: ethers.formatEther(session.totalApproved),
        totalSpent: ethers.formatEther(session.totalSpent),
        allowedRecipients: session.allowedRecipients,
        requiresApproval: session.requiresApproval,
        isActive: session.isActive,
        purpose: session.purpose,
        approvalsReceived: session.approvalsReceived.toNumber(),
        approvalsRequired: session.approvalsRequired.toNumber(),
        approvers: session.approvers
      };
    } catch (error) {
      console.error('Error getting session:', error.message);
      throw error;
    }
  }

  /**
   * Check if session is valid
   * @param {string} sessionId Session ID
   * @returns {boolean} Is valid
   */
  async isSessionValid(sessionId) {
    try {
      return await this.contract.isSessionValid(sessionId);
    } catch (error) {
      console.error('Error checking session validity:', error.message);
      throw error;
    }
  }

  /**
   * Get remaining budget
   * @param {string} sessionId Session ID
   * @returns {string} Remaining amount in ether
   */
  async getRemaining(sessionId) {
    try {
      const remaining = await this.contract.getSessionRemaining(sessionId);
      return ethers.formatEther(remaining);
    } catch (error) {
      console.error('Error getting remaining budget:', error.message);
      throw error;
    }
  }

  /**
   * Get time remaining
   * @param {string} sessionId Session ID
   * @returns {number} Seconds remaining
   */
  async getTimeRemaining(sessionId) {
    try {
      const remaining = await this.contract.getSessionTimeRemaining(sessionId);
      return remaining.toNumber();
    } catch (error) {
      console.error('Error getting time remaining:', error.message);
      throw error;
    }
  }

  /**
   * Get all active sessions
   * @returns {Array<string>} Active session IDs
   */
  async getActiveSessions() {
    try {
      return await this.contract.getActiveSessions();
    } catch (error) {
      console.error('Error getting active sessions:', error.message);
      throw error;
    }
  }

  /**
   * Get session spending records
   * @param {string} sessionId Session ID
   * @returns {Array<Object>} Spending records
   */
  async getSpends(sessionId) {
    try {
      const spends = await this.contract.getSessionSpends(sessionId);

      return spends.map(spend => ({
        token: spend.token,
        amount: ethers.formatEther(spend.amount),
        recipient: spend.recipient,
        timestamp: new Date(spend.timestamp.toNumber() * 1000),
        reason: spend.reason
      }));
    } catch (error) {
      console.error('Error getting spends:', error.message);
      throw error;
    }
  }

  /**
   * Get allowed recipients
   * @param {string} sessionId Session ID
   * @returns {Array<string>} Recipient addresses
   */
  async getRecipients(sessionId) {
    try {
      return await this.contract.getSessionRecipients(sessionId);
    } catch (error) {
      console.error('Error getting recipients:', error.message);
      throw error;
    }
  }

  /**
   * Check if recipient is allowed
   * @param {string} sessionId Session ID
   * @param {string} recipient Recipient address
   * @returns {boolean} Is allowed
   */
  async isRecipientAllowed(sessionId, recipient) {
    try {
      return await this.contract.isRecipientAllowed(sessionId, recipient);
    } catch (error) {
      console.error('Error checking recipient:', error.message);
      throw error;
    }
  }

  /**
   * Get spending by token
   * @param {string} sessionId Session ID
   * @param {string} token Token address
   * @returns {string} Amount spent in ether
   */
  async getTokenSpent(sessionId, token) {
    try {
      const spent = await this.contract.getSessionTokenSpent(sessionId, token);
      return ethers.formatEther(spent);
    } catch (error) {
      console.error('Error getting token spent:', error.message);
      throw error;
    }
  }

  /**
   * Generate comprehensive session report
   * @param {string} sessionId Session ID
   * @returns {Object} Full report
   */
  async generateReport(sessionId) {
    console.log(`📊 Generating session report...\n`);

    try {
      const session = await this.getSession(sessionId);
      const isValid = await this.isSessionValid(sessionId);
      const remaining = await this.getRemaining(sessionId);
      const timeRemaining = await this.getTimeRemaining(sessionId);
      const spends = await this.getSpends(sessionId);
      const recipients = await this.getRecipients(sessionId);

      const report = {
        session,
        status: {
          isValid,
          timeRemainingSeconds: timeRemaining,
          timeRemainingHours: (timeRemaining / 3600).toFixed(2),
          remainingBudget: remaining,
          percentUsed: ((parseFloat(session.totalSpent) / parseFloat(session.totalApproved)) * 100).toFixed(1)
        },
        spending: {
          records: spends,
          totalSpends: spends.length,
          totalSpent: session.totalSpent,
          totalApproved: session.totalApproved
        },
        recipients: {
          allowed: recipients,
          restricted: recipients.length > 0
        },
        approvals: {
          received: session.approvalsReceived,
          required: session.approvalsRequired,
          approvers: session.approvers
        }
      };

      this._displayReport(report);
      return report;
    } catch (error) {
      console.error('Error generating report:', error.message);
      throw error;
    }
  }

  /**
   * Display report in console
   */
  _displayReport(report) {
    console.log(`📋 SESSION REPORT\n`);
    console.log(`Purpose: ${report.session.purpose}`);
    console.log(`Status: ${report.status.isValid ? '✅ ACTIVE' : '⛔ INACTIVE'}`);
    console.log(`\n💰 BUDGET`);
    console.log(`  Approved: ${report.session.totalApproved} ETH`);
    console.log(`  Spent: ${report.session.totalSpent} ETH`);
    console.log(`  Remaining: ${report.status.remainingBudget} ETH`);
    console.log(`  Used: ${report.status.percentUsed}%`);
    console.log(`\n⏱️ TIME`);
    console.log(`  Created: ${report.session.createdAt.toLocaleString()}`);
    console.log(`  Expires: ${report.session.expiresAt.toLocaleString()}`);
    console.log(`  Remaining: ${report.status.timeRemainingHours} hours`);
    console.log(`\n📝 TRANSACTIONS: ${report.spending.totalSpends}`);
    report.spending.records.forEach((spend, i) => {
      console.log(`  ${i + 1}. ${spend.amount} to ${spend.recipient.slice(0, 6)}... (${spend.reason})`);
    });
    console.log(`\n👥 RECIPIENTS: ${report.recipients.restricted ? 'RESTRICTED' : 'UNRESTRICTED'}`);
    if (report.recipients.allowed.length > 0) {
      report.recipients.allowed.forEach(r => console.log(`  • ${r}`));
    } else {
      console.log(`  • All recipients allowed`);
    }
    console.log(`\n✅ APPROVALS: ${report.approvals.received}/${report.approvals.required}`);
    console.log();
  }

  /**
   * Set minimum session duration
   * @param {number} seconds Minimum duration in seconds
   */
  async setMinDuration(seconds) {
    console.log(`⚙️ Setting minimum session duration to ${seconds} seconds...`);

    try {
      const tx = await this.contract.setMinSessionDuration(seconds);
      await tx.wait();
      console.log(`✅ Minimum duration set`);
    } catch (error) {
      console.error('Error setting minimum duration:', error.message);
      throw error;
    }
  }

  /**
   * Set maximum session duration
   * @param {number} seconds Maximum duration in seconds
   */
  async setMaxDuration(seconds) {
    console.log(`⚙️ Setting maximum session duration to ${seconds} seconds...`);

    try {
      const tx = await this.contract.setMaxSessionDuration(seconds);
      await tx.wait();
      console.log(`✅ Maximum duration set`);
    } catch (error) {
      console.error('Error setting maximum duration:', error.message);
      throw error;
    }
  }

  /**
   * Set default approval quorum
   * @param {number} quorum Number of approvals required
   */
  async setApprovalQuorum(quorum) {
    console.log(`⚙️ Setting approval quorum to ${quorum}...`);

    try {
      const tx = await this.contract.setDefaultApprovalQuorum(quorum);
      await tx.wait();
      console.log(`✅ Approval quorum set`);
    } catch (error) {
      console.error('Error setting quorum:', error.message);
      throw error;
    }
  }

  /**
   * Get vault balance
   * @returns {Object} ETH and token balances
   */
  async getVaultBalance() {
    try {
      const ethBalance = await this.contract.getETHBalance();

      return {
        eth: ethers.formatEther(ethBalance),
        formattedEth: `${ethers.formatEther(ethBalance)} ETH`
      };
    } catch (error) {
      console.error('Error getting vault balance:', error.message);
      throw error;
    }
  }

  /**
   * Deposit tokens to vault
   * @param {string} token Token address
   * @param {BigNumber} amount Amount to deposit
   */
  async depositToken(token, amount) {
    console.log(`💳 Depositing ${ethers.formatEther(amount)} tokens...`);

    try {
      const tx = await this.contract.deposit(token, amount);
      const receipt = await tx.wait();

      console.log(`✅ Tokens deposited`);
      return receipt;
    } catch (error) {
      console.error('Error depositing:', error.message);
      throw error;
    }
  }
}

/**
 * Example Usage
 */
async function exampleUsage() {
  const vaultAddress = '0x...';
  const signer = ethers.Wallet.fromMnemonic(process.env.MNEMONIC);
  
  const manager = new SessionBasedApprovalsManager(vaultAddress, signer);

  // Example 1: Create daily marketing budget
  const sessionId = await manager.createDailyBudget(
    ethers.parseEther('100'),
    'Daily Marketing',
    ['0xVendorA', '0xVendorB']
  );

  // Example 2: Spend from session
  await manager.spend(
    sessionId,
    ethers.constants.AddressZero,  // ETH
    ethers.parseEther('10'),
    '0xRecipient',
    'Ad campaign'
  );

  // Example 3: Get report
  await manager.generateReport(sessionId);

  // Example 4: Check remaining
  const remaining = await manager.getRemaining(sessionId);
  console.log(`Remaining: ${remaining} ETH`);
}

module.exports = SessionBasedApprovalsManager;

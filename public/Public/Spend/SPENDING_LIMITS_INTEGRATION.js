// Spending Limits Integration Examples
// Frontend/Backend implementation patterns

const ethers = require("ethers");

// ============ 1. SETUP: Configure Guardian Limits ============

async function configureGuardianLimits(
  limitsContract,
  vaultAddress,
  guardianLimitsConfig
) {
  /**
   * guardianLimitsConfig: [
   *   { address: "0x...", daily: 10000e6, weekly: 50000e6, monthly: 200000e6, role: "CEO" },
   *   { address: "0x...", daily: 5000e6, weekly: 25000e6, monthly: 100000e6, role: "CFO" },
   *   { address: "0x...", daily: 2000e6, weekly: 10000e6, monthly: 50000e6, role: "Treasurer" }
   * ]
   */
  
  const tokenAddress = "0x..."; // USDC or other token
  
  for (const guardian of guardianLimitsConfig) {
    await limitsContract.setGuardianLimit(
      vaultAddress,
      tokenAddress,
      guardian.address,
      guardian.daily,
      guardian.weekly,
      guardian.monthly
    );
    
    console.log(`Set limits for ${guardian.role}:`);
    console.log(`  Daily:   ${guardian.daily / 1e6}`);
    console.log(`  Weekly:  ${guardian.weekly / 1e6}`);
    console.log(`  Monthly: ${guardian.monthly / 1e6}`);
  }
}

// Usage
const guardianLimits = [
  { address: "0xCEO...", daily: 10000e6, weekly: 50000e6, monthly: 200000e6, role: "CEO" },
  { address: "0xCFO...", daily: 5000e6, weekly: 25000e6, monthly: 100000e6, role: "CFO" },
  { address: "0xTreasurer...", daily: 2000e6, weekly: 10000e6, monthly: 50000e6, role: "Treasurer" }
];

await configureGuardianLimits(limitsContract, vaultAddress, guardianLimits);

// ============ 2. SETUP: Configure Vault-Level Limits ============

async function configureVaultLimits(
  limitsContract,
  vaultAddress,
  tokenAddress,
  dailyLimit,
  weeklyLimit,
  monthlyLimit
) {
  /**
   * vaultAddress: Address of the vault
   * tokenAddress: Token address (0x... for ERC-20, address(0) for ETH)
   * dailyLimit: Max daily withdrawal across all guardians
   * weeklyLimit: Max weekly withdrawal across all guardians
   * monthlyLimit: Max monthly withdrawal across all guardians
   */
  
  await limitsContract.setVaultLimit(
    vaultAddress,
    tokenAddress,
    dailyLimit,
    weeklyLimit,
    monthlyLimit
  );
  
  console.log("Vault limits configured:");
  console.log(`  Daily:   ${ethers.formatUnits(dailyLimit, 6)}`);
  console.log(`  Weekly:  ${ethers.formatUnits(weeklyLimit, 6)}`);
  console.log(`  Monthly: ${ethers.formatUnits(monthlyLimit, 6)}`);
}

// Usage
await configureVaultLimits(
  limitsContract,
  vaultAddress,
  usdcAddress,
  ethers.parseUnits("100000", 6),  // $100k daily
  ethers.parseUnits("400000", 6),  // $400k weekly
  ethers.parseUnits("1500000", 6)  // $1.5M monthly
);

// ============ 3. CHECK: Guardian Limit Before Withdrawal ============

async function checkGuardianSpendingLimit(
  limitsContract,
  vaultAddress,
  tokenAddress,
  guardianAddress,
  withdrawalAmount
) {
  const [allowed, reason] = await limitsContract.checkGuardianLimit(
    vaultAddress,
    tokenAddress,
    guardianAddress,
    withdrawalAmount
  );
  
  if (!allowed) {
    console.log(`❌ Withdrawal DENIED: ${reason}`);
    return false;
  }
  
  console.log(`✅ Withdrawal allowed`);
  return true;
}

// Usage
const allowed = await checkGuardianSpendingLimit(
  limitsContract,
  vaultAddress,
  usdcAddress,
  ceoAddress,
  ethers.parseUnits("10000", 6)  // $10k
);

// ============ 4. CHECK: Vault-Level Limit ============

async function checkVaultSpendingLimit(
  limitsContract,
  vaultAddress,
  tokenAddress,
  withdrawalAmount
) {
  const [allowed, reason] = await limitsContract.checkVaultLimit(
    vaultAddress,
    tokenAddress,
    withdrawalAmount
  );
  
  if (!allowed) {
    console.log(`❌ Vault limit EXCEEDED: ${reason}`);
    return false;
  }
  
  console.log(`✅ Vault limit OK`);
  return true;
}

// ============ 5. QUERY: Guardian Spending Status ============

async function getGuardianSpendingStatus(
  limitsContract,
  vaultAddress,
  tokenAddress,
  guardianAddress
) {
  // Get spending
  const [dailySpent, weeklySpent, monthlySpent] = await limitsContract.getGuardianSpending(
    vaultAddress,
    tokenAddress,
    guardianAddress
  );
  
  // Get remaining
  const [dailyRem, weeklyRem, monthlyRem] = await limitsContract.getGuardianRemaining(
    vaultAddress,
    tokenAddress,
    guardianAddress
  );
  
  return {
    spent: {
      daily: ethers.formatUnits(dailySpent, 6),
      weekly: ethers.formatUnits(weeklySpent, 6),
      monthly: ethers.formatUnits(monthlySpent, 6)
    },
    remaining: {
      daily: ethers.formatUnits(dailyRem, 6),
      weekly: ethers.formatUnits(weeklyRem, 6),
      monthly: ethers.formatUnits(monthlyRem, 6)
    }
  };
}

// Usage
const status = await getGuardianSpendingStatus(
  limitsContract,
  vaultAddress,
  usdcAddress,
  ceoAddress
);

console.log("Guardian Spending Status:");
console.log(`Daily:   $${status.spent.daily} / remaining $${status.remaining.daily}`);
console.log(`Weekly:  $${status.spent.weekly} / remaining $${status.remaining.weekly}`);
console.log(`Monthly: $${status.spent.monthly} / remaining $${status.remaining.monthly}`);

// ============ 6. QUERY: Vault Spending Status ============

async function getVaultSpendingStatus(
  limitsContract,
  vaultAddress,
  tokenAddress
) {
  const [dailySpent, weeklySpent, monthlySpent] = await limitsContract.getVaultSpending(
    vaultAddress,
    tokenAddress
  );
  
  const [dailyRem, weeklyRem, monthlyRem] = await limitsContract.getVaultRemaining(
    vaultAddress,
    tokenAddress
  );
  
  return {
    spent: {
      daily: ethers.formatUnits(dailySpent, 6),
      weekly: ethers.formatUnits(weeklySpent, 6),
      monthly: ethers.formatUnits(monthlySpent, 6)
    },
    remaining: {
      daily: ethers.formatUnits(dailyRem, 6),
      weekly: ethers.formatUnits(weeklyRem, 6),
      monthly: ethers.formatUnits(monthlyRem, 6)
    }
  };
}

// ============ 7. EXECUTE: Withdrawal with Limit Checking ============

async function executeWithdrawalWithLimitCheck(
  vaultContract,
  limitsContract,
  withdrawalParams,
  guardianAddresses
) {
  const { token, amount, recipient, reason } = withdrawalParams;
  const vaultAddress = vaultContract.address;
  
  // Step 1: Check each guardian's limit
  console.log("Checking guardian limits...");
  for (const guardian of guardianAddresses) {
    const allowed = await checkGuardianSpendingLimit(
      limitsContract,
      vaultAddress,
      token,
      guardian,
      amount
    );
    
    if (!allowed) {
      throw new Error(`Guardian ${guardian} limit exceeded`);
    }
  }
  
  // Step 2: Check vault total limit
  console.log("Checking vault limit...");
  const vaultAllowed = await checkVaultSpendingLimit(
    limitsContract,
    vaultAddress,
    token,
    amount
  );
  
  if (!vaultAllowed) {
    throw new Error("Vault limit exceeded");
  }
  
  // Step 3: Execute withdrawal
  console.log("Executing withdrawal...");
  const tx = await vaultContract.withdrawWithLimits(
    token,
    amount,
    recipient,
    reason,
    [] // signatures (placeholder)
  );
  
  await tx.wait();
  console.log(`✅ Withdrawal successful: ${tx.hash}`);
  
  return tx.hash;
}

// ============ 8. MONITOR: Track Limit Status ============

async function monitorGuardianLimits(
  limitsContract,
  vaultAddress,
  tokenAddress,
  guardians
) {
  console.log("\n📊 SPENDING LIMIT STATUS REPORT\n");
  console.log("═".repeat(60));
  
  for (const guardian of guardians) {
    const status = await getGuardianSpendingStatus(
      limitsContract,
      vaultAddress,
      tokenAddress,
      guardian.address
    );
    
    const dailyPercent = (
      (parseFloat(status.spent.daily) / parseFloat(status.spent.daily) + parseFloat(status.remaining.daily)) * 100
    ).toFixed(1);
    
    const weeklyPercent = (
      (parseFloat(status.spent.weekly) / parseFloat(status.spent.weekly) + parseFloat(status.remaining.weekly)) * 100
    ).toFixed(1);
    
    console.log(`\n${guardian.role} (${guardian.address})`);
    console.log(`  Daily:   $${status.spent.daily} / $${parseFloat(status.spent.daily) + parseFloat(status.remaining.daily)} (${dailyPercent}%)`);
    console.log(`  Weekly:  $${status.spent.weekly} / $${parseFloat(status.spent.weekly) + parseFloat(status.remaining.weekly)} (${weeklyPercent}%)`);
    console.log(`  Monthly: $${status.spent.monthly} / $${parseFloat(status.spent.monthly) + parseFloat(status.remaining.monthly)}`);
  }
  
  console.log("\n" + "═".repeat(60));
}

// ============ 9. MANAGE: Update Guardian Limits ============

async function updateGuardianLimit(
  limitsContract,
  vaultAddress,
  tokenAddress,
  guardianAddress,
  newLimits
) {
  const { daily, weekly, monthly } = newLimits;
  
  await limitsContract.setGuardianLimit(
    vaultAddress,
    tokenAddress,
    guardianAddress,
    daily,
    weekly,
    monthly
  );
  
  console.log(`Updated limits for ${guardianAddress}`);
  console.log(`  Daily:   ${ethers.formatUnits(daily, 6)}`);
  console.log(`  Weekly:  ${ethers.formatUnits(weekly, 6)}`);
  console.log(`  Monthly: ${ethers.formatUnits(monthly, 6)}`);
}

// Usage: Promote CFO to Acting CEO
await updateGuardianLimit(
  limitsContract,
  vaultAddress,
  usdcAddress,
  cfoAddress,
  {
    daily: ethers.parseUnits("10000", 6),   // Increased from 5000
    weekly: ethers.parseUnits("50000", 6),  // Increased from 25000
    monthly: ethers.parseUnits("200000", 6) // Increased from 100000
  }
);

// ============ 10. MANAGE: Remove Guardian Limits ============

async function removeGuardianLimits(
  limitsContract,
  vaultAddress,
  tokenAddress,
  guardianAddress
) {
  await limitsContract.removeGuardianLimit(
    vaultAddress,
    tokenAddress,
    guardianAddress
  );
  
  console.log(`Removed limits for ${guardianAddress}`);
}

// ============ 11. REPORT: Generate Spending Report ============

async function generateSpendingReport(
  limitsContract,
  vaultAddress,
  tokenAddress,
  guardians
) {
  let report = `
╔════════════════════════════════════════════════════════════════╗
║              SPENDING LIMITS STATUS REPORT                     ║
╚════════════════════════════════════════════════════════════════╝

Vault: ${vaultAddress}
Token: ${tokenAddress}
Date:  ${new Date().toISOString()}

GUARDIAN BREAKDOWN:
─────────────────────────────────────────────────────────────────`;

  for (const guardian of guardians) {
    const status = await getGuardianSpendingStatus(
      limitsContract,
      vaultAddress,
      tokenAddress,
      guardian.address
    );
    
    const totalDaily = parseFloat(status.spent.daily) + parseFloat(status.remaining.daily);
    const totalWeekly = parseFloat(status.spent.weekly) + parseFloat(status.remaining.weekly);
    const totalMonthly = parseFloat(status.spent.monthly) + parseFloat(status.remaining.monthly);
    
    const dailyPct = (parseFloat(status.spent.daily) / totalDaily * 100).toFixed(1);
    const weeklyPct = (parseFloat(status.spent.weekly) / totalWeekly * 100).toFixed(1);
    const monthlyPct = (parseFloat(status.spent.monthly) / totalMonthly * 100).toFixed(1);
    
    report += `

${guardian.role}
  Address: ${guardian.address}
  
  Daily:   $${status.spent.daily.padStart(10)} / $${totalDaily.toString().padStart(10)} (${dailyPct}%)
  Weekly:  $${status.spent.weekly.padStart(10)} / $${totalWeekly.toString().padStart(10)} (${weeklyPct}%)
  Monthly: $${status.spent.monthly.padStart(10)} / $${totalMonthly.toString().padStart(10)} (${monthlyPct}%)`;
  }
  
  // Vault totals
  const vaultStatus = await getVaultSpendingStatus(limitsContract, vaultAddress, tokenAddress);
  
  const totalDaily = parseFloat(vaultStatus.spent.daily) + parseFloat(vaultStatus.remaining.daily);
  const totalWeekly = parseFloat(vaultStatus.spent.weekly) + parseFloat(vaultStatus.remaining.weekly);
  const totalMonthly = parseFloat(vaultStatus.spent.monthly) + parseFloat(vaultStatus.remaining.monthly);
  
  report += `

VAULT TOTALS:
─────────────────────────────────────────────────────────────────
  Daily:   $${vaultStatus.spent.daily.padStart(10)} / $${totalDaily.toString().padStart(10)}
  Weekly:  $${vaultStatus.spent.weekly.padStart(10)} / $${totalWeekly.toString().padStart(10)}
  Monthly: $${vaultStatus.spent.monthly.padStart(10)} / $${totalMonthly.toString().padStart(10)}

╚════════════════════════════════════════════════════════════════╝`;

  return report;
}

// ============ 12. EVENTS: Listen for Limit Changes ============

async function setupLimitEventListeners(limitsContract, vaultAddress) {
  // Listen for guardian limit changes
  limitsContract.on("GuardianLimitSet", (vault, token, guardian, daily, weekly, monthly) => {
    if (vault === vaultAddress) {
      console.log(`📝 Guardian limit updated: ${guardian}`);
      console.log(`   Daily:   ${ethers.formatUnits(daily, 6)}`);
      console.log(`   Weekly:  ${ethers.formatUnits(weekly, 6)}`);
      console.log(`   Monthly: ${ethers.formatUnits(monthly, 6)}`);
    }
  });
  
  // Listen for withdrawals that exceed limits
  limitsContract.on("GuardianLimitExceeded", (vault, token, guardian, limitType, spent, limit, requested) => {
    if (vault === vaultAddress) {
      console.log(`⚠️  LIMIT EXCEEDED: ${guardian}`);
      console.log(`   Type:      ${limitType}`);
      console.log(`   Current:   ${ethers.formatUnits(spent, 6)}`);
      console.log(`   Limit:     ${ethers.formatUnits(limit, 6)}`);
      console.log(`   Requested: ${ethers.formatUnits(requested, 6)}`);
    }
  });
  
  // Listen for vault limit exceeded
  limitsContract.on("VaultLimitExceeded", (vault, token, limitType, spent, limit, requested) => {
    if (vault === vaultAddress) {
      console.log(`🚨 VAULT LIMIT EXCEEDED`);
      console.log(`   Type:      ${limitType}`);
      console.log(`   Spent:     ${ethers.formatUnits(spent, 6)}`);
      console.log(`   Limit:     ${ethers.formatUnits(limit, 6)}`);
    }
  });
  
  // Listen for successful withdrawals
  limitsContract.on(
    "GuardianWithdrawal",
    (vault, token, guardian, amount, dailySpent, weeklySpent, monthlySpent) => {
      if (vault === vaultAddress) {
        console.log(`💰 Withdrawal recorded: ${guardian}`);
        console.log(`   Amount:  ${ethers.formatUnits(amount, 6)}`);
        console.log(`   Daily:   ${ethers.formatUnits(dailySpent, 6)} spent`);
        console.log(`   Weekly:  ${ethers.formatUnits(weeklySpent, 6)} spent`);
        console.log(`   Monthly: ${ethers.formatUnits(monthlySpent, 6)} spent`);
      }
    }
  );
}

// ============ EXPORT ============

module.exports = {
  configureGuardianLimits,
  configureVaultLimits,
  checkGuardianSpendingLimit,
  checkVaultSpendingLimit,
  getGuardianSpendingStatus,
  getVaultSpendingStatus,
  executeWithdrawalWithLimitCheck,
  monitorGuardianLimits,
  updateGuardianLimit,
  removeGuardianLimits,
  generateSpendingReport,
  setupLimitEventListeners
};

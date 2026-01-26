// Integration Examples for Guardian Roles
// Frontend/Backend implementation patterns

// ============ CONTRACT INTERACTIONS ============

// 1. ASSIGN A GUARDIAN WITH A ROLE
async function assignGuardianRole(
  guardianRolesContract,
  vaultAddress,
  guardianAddress,
  roleId, // 1=SIGNER, 2=OBSERVER, 3=EMERGENCY_ONLY
  expirationDays = 0 // 0 = no expiration
) {
  const expiresAt = expirationDays > 0 
    ? Math.floor(Date.now() / 1000) + (expirationDays * 24 * 60 * 60)
    : 0;

  const tx = await guardianRolesContract.assignRole(
    vaultAddress,
    guardianAddress,
    roleId,
    expiresAt
  );
  
  return tx.wait();
}

// Example usage
await assignGuardianRole(
  guardianRolesContract,
  "0x...", // vault
  "0x...", // guardian
  1,       // SIGNER
  365      // 1 year expiration
);

// ============ 2. REVOKE A GUARDIAN'S ROLE ============

async function revokeGuardianRole(
  guardianRolesContract,
  vaultAddress,
  guardianAddress
) {
  const tx = await guardianRolesContract.revokeRole(
    vaultAddress,
    guardianAddress
  );
  
  return tx.wait();
}

// ============ 3. GET ALL GUARDIANS FOR A VAULT ============

async function getVaultGuardians(guardianRolesContract, vaultAddress) {
  const guardianAddresses = await guardianRolesContract.getActiveGuardians(
    vaultAddress
  );

  // Map addresses to role info
  const guardians = await Promise.all(
    guardianAddresses.map(async (address) => {
      const roleInfo = await guardianRolesContract.getGuardianRoleInfo(
        vaultAddress,
        address
      );
      
      const roleNames = ["NONE", "SIGNER", "OBSERVER", "EMERGENCY_ONLY"];
      
      return {
        address,
        role: roleNames[roleInfo.role],
        roleId: roleInfo.role,
        assignedAt: new Date(roleInfo.assignedAt * 1000),
        expiresAt: roleInfo.expiresAt > 0 
          ? new Date(roleInfo.expiresAt * 1000)
          : null,
        isActive: roleInfo.isActive,
        isExpired: roleInfo.expiresAt > 0 && roleInfo.expiresAt < Math.floor(Date.now() / 1000)
      };
    })
  );

  return guardians;
}

// ============ 4. CHECK IF GUARDIAN CAN APPROVE WITHDRAWAL ============

async function canGuardianApproveWithdrawal(
  guardianRolesContract,
  vaultAddress,
  guardianAddress,
  withdrawalAmount,
  isEmergency = false
) {
  if (isEmergency) {
    return await guardianRolesContract.canApproveEmergencyWithdrawal(
      vaultAddress,
      guardianAddress,
      withdrawalAmount
    );
  } else {
    return await guardianRolesContract.canApproveRegularWithdrawal(
      vaultAddress,
      guardianAddress,
      withdrawalAmount
    );
  }
}

// ============ 5. GET ELIGIBLE SIGNERS FOR A WITHDRAWAL ============

async function getEligibleSigners(
  guardianRolesContract,
  vaultAddress,
  withdrawalAmount,
  isEmergency = false
) {
  const allGuardians = await getVaultGuardians(guardianRolesContract, vaultAddress);
  
  const eligibleSigners = await Promise.all(
    allGuardians
      .filter(g => g.isActive && !g.isExpired)
      .map(async (guardian) => {
        const canApprove = isEmergency
          ? await guardianRolesContract.canApproveEmergencyWithdrawal(
              vaultAddress,
              guardian.address,
              withdrawalAmount
            )
          : await guardianRolesContract.canApproveRegularWithdrawal(
              vaultAddress,
              guardian.address,
              withdrawalAmount
            );
        
        return {
          ...guardian,
          canApprove
        };
      })
  );

  return eligibleSigners.filter(g => g.canApprove);
}

// ============ 6. EXECUTE WITHDRAWAL WITH ROLE-BASED SIGNATURES ============

async function executeRoleBasedWithdrawal(
  vaultContract,
  withdrawalParams,
  selectedGuardianSigners,
  isEmergency = false
) {
  const {
    token,
    amount,
    recipient,
    reason
  } = withdrawalParams;

  // Get signatures from each guardian
  const signatures = await Promise.all(
    selectedGuardianSigners.map(async (signer) => {
      const domain = {
        name: "SpendGuard",
        version: "1",
        chainId: (await signer.provider.getNetwork()).chainId,
        verifyingContract: vaultContract.address
      };

      const types = {
        Withdrawal: [
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "recipient", type: "address" },
          { name: "nonce", type: "uint256" },
          { name: "reason", type: "bytes32" },
          { name: "category", type: "bytes32" },
          { name: "createdAt", type: "uint256" }
        ]
      };

      const nonce = await vaultContract.nonce();
      const value = {
        token,
        amount,
        recipient,
        nonce: nonce.toString(),
        reason: ethers.id(reason),
        category: ethers.id(isEmergency ? "emergency" : "regular"),
        createdAt: Math.floor(Date.now() / 1000)
      };

      return signer.signTypedData(domain, types, value);
    })
  );

  // Execute withdrawal
  const tx = await vaultContract.withdrawWithRoles(
    token,
    amount,
    recipient,
    reason,
    isEmergency,
    signatures
  );

  return tx.wait();
}

// Example usage
const withdrawal = {
  token: "0x0000000000000000000000000000000000000000", // ETH
  amount: ethers.parseEther("10"),
  recipient: "0x...",
  reason: "Monthly household expenses"
};

const signers = await getEligibleSigners(
  guardianRolesContract,
  vaultAddress,
  withdrawal.amount,
  false
);

const selectedSigners = signers.slice(0, 2); // Pick 2 signers

await executeRoleBasedWithdrawal(
  vaultContract,
  withdrawal,
  selectedSigners,
  false
);

// ============ 7. HANDLE EXPIRING ROLES ============

async function getExpiringRoles(
  guardianRolesContract,
  vaultAddress,
  daysUntilWarning = 30
) {
  const guardians = await getVaultGuardians(guardianRolesContract, vaultAddress);
  const now = Math.floor(Date.now() / 1000);
  const warningThreshold = now + (daysUntilWarning * 24 * 60 * 60);

  return guardians
    .filter(g => {
      if (!g.expiresAt) return false;
      return g.expiresAt.getTime() / 1000 <= warningThreshold && 
             g.expiresAt.getTime() / 1000 > now;
    })
    .map(g => ({
      ...g,
      daysUntilExpiration: Math.ceil(
        (g.expiresAt.getTime() / 1000 - now) / (24 * 60 * 60)
      )
    }));
}

// ============ 8. UPDATE ROLE PERMISSIONS (ADMIN ONLY) ============

async function updateRolePermissions(
  guardianRolesContract,
  roleId, // 1=SIGNER, 2=OBSERVER, 3=EMERGENCY_ONLY
  permissions
) {
  const {
    canApproveRegular = true,
    canApproveEmergency = true,
    canView = true,
    canUpdateGuardians = false,
    maxWithdrawalAmount = ethers.parseEther("0"), // 0 = unlimited
    maxDailyWithdrawals = 0 // 0 = unlimited
  } = permissions;

  const tx = await guardianRolesContract.updateRolePermissions(
    roleId,
    canApproveRegular,
    canApproveEmergency,
    canView,
    canUpdateGuardians,
    maxWithdrawalAmount,
    maxDailyWithdrawals
  );

  return tx.wait();
}

// ============ 9. CHECK ROLE STATUS WITH EXPIRATION HANDLING ============

async function getGuardianRoleStatus(
  guardianRolesContract,
  vaultAddress,
  guardianAddress
) {
  const roleInfo = await guardianRolesContract.getGuardianRoleInfo(
    vaultAddress,
    guardianAddress
  );

  const roleNames = ["NONE", "SIGNER", "OBSERVER", "EMERGENCY_ONLY"];
  const now = Math.floor(Date.now() / 1000);
  const isExpired = roleInfo.expiresAt > 0 && roleInfo.expiresAt < now;

  return {
    role: roleNames[roleInfo.role],
    roleId: roleInfo.role,
    assignedAt: new Date(roleInfo.assignedAt * 1000),
    expiresAt: roleInfo.expiresAt > 0 
      ? new Date(roleInfo.expiresAt * 1000)
      : null,
    isActive: roleInfo.isActive && !isExpired,
    isExpired,
    daysRemaining: roleInfo.expiresAt > 0
      ? Math.ceil((roleInfo.expiresAt - now) / (24 * 60 * 60))
      : null
  };
}

// ============ 10. FRONTEND COMPONENT STATE ============

// React component state example
const [vaultGuardians, setVaultGuardians] = useState([]);
const [eligibleSigners, setEligibleSigners] = useState([]);
const [selectedSigners, setSelectedSigners] = useState([]);
const [expiringRoles, setExpiringRoles] = useState([]);

useEffect(() => {
  async function loadGuardians() {
    const guardians = await getVaultGuardians(
      guardianRolesContract,
      vaultAddress
    );
    setVaultGuardians(guardians);

    const expiring = await getExpiringRoles(
      guardianRolesContract,
      vaultAddress,
      30
    );
    setExpiringRoles(expiring);
  }

  loadGuardians();
}, [vaultAddress]);

// Update eligible signers when withdrawal amount changes
useEffect(() => {
  async function updateEligibleSigners() {
    const signers = await getEligibleSigners(
      guardianRolesContract,
      vaultAddress,
      withdrawalAmount,
      isEmergency
    );
    setEligibleSigners(signers);
  }

  updateEligibleSigners();
}, [withdrawalAmount, isEmergency]);

// ============ 11. EVENT LISTENING FOR ROLE CHANGES ============

async function setupRoleEventListeners(guardianRolesContract, vaultAddress) {
  // Listen for role assignments
  guardianRolesContract.on(
    "RoleAssigned",
    (vault, guardian, role, expiresAt) => {
      if (vault.toLowerCase() === vaultAddress.toLowerCase()) {
        console.log(`✅ Role assigned to ${guardian}`);
        // Update UI
        refreshGuardiansList();
      }
    }
  );

  // Listen for role revocations
  guardianRolesContract.on(
    "RoleRevoked",
    (vault, guardian, previousRole) => {
      if (vault.toLowerCase() === vaultAddress.toLowerCase()) {
        console.log(`❌ Role revoked for ${guardian}`);
        // Update UI
        refreshGuardiansList();
      }
    }
  );

  // Listen for role expirations
  guardianRolesContract.on(
    "RoleExpired",
    (vault, guardian, role) => {
      if (vault.toLowerCase() === vaultAddress.toLowerCase()) {
        console.log(`⏰ Role expired for ${guardian}`);
        // Update UI and warn
        showNotification(`${guardian}'s role has expired`);
        refreshGuardiansList();
      }
    }
  );

  // Listen for guardian activations/deactivations
  guardianRolesContract.on(
    "GuardianActivated",
    (vault, guardian) => {
      if (vault.toLowerCase() === vaultAddress.toLowerCase()) {
        console.log(`🟢 Guardian activated: ${guardian}`);
        refreshGuardiansList();
      }
    }
  );

  guardianRolesContract.on(
    "GuardianDeactivated",
    (vault, guardian) => {
      if (vault.toLowerCase() === vaultAddress.toLowerCase()) {
        console.log(`🔴 Guardian deactivated: ${guardian}`);
        refreshGuardiansList();
      }
    }
  );
}

// ============ 12. BATCH OPERATIONS ============

async function assignMultipleGuardians(
  guardianRolesContract,
  vaultAddress,
  guardianAssignments // Array of {address, role, expirationDays}
) {
  const txs = [];
  
  for (const assignment of guardianAssignments) {
    const tx = await assignGuardianRole(
      guardianRolesContract,
      vaultAddress,
      assignment.address,
      assignment.role,
      assignment.expirationDays
    );
    txs.push(tx);
  }

  return txs;
}

// Example: Set up family structure
await assignMultipleGuardians(
  guardianRolesContract,
  familyVaultAddress,
  [
    { address: dadAddress, role: 1, expirationDays: 0 },        // SIGNER
    { address: momAddress, role: 1, expirationDays: 0 },        // SIGNER
    { address: sonAddress, role: 3, expirationDays: 365 },      // EMERGENCY_ONLY, 1 year
    { address: lawyerAddress, role: 2, expirationDays: 0 },    // OBSERVER
  ]
);

// ============ 13. ROLE TRANSITION HELPER ============

async function upgradeGuardianRole(
  guardianRolesContract,
  vaultAddress,
  guardianAddress,
  newRoleId,
  newExpirationDays = 0
) {
  // Revoke old role
  await revokeGuardianRole(guardianRolesContract, vaultAddress, guardianAddress);

  // Assign new role
  await assignGuardianRole(
    guardianRolesContract,
    vaultAddress,
    guardianAddress,
    newRoleId,
    newExpirationDays
  );
}

// ============ 14. GUARDIAN STATUS DASHBOARD ============

async function generateGuardianStatusReport(
  guardianRolesContract,
  vaultAddress
) {
  const guardians = await getVaultGuardians(guardianRolesContract, vaultAddress);
  
  return {
    totalGuardians: guardians.length,
    active: guardians.filter(g => g.isActive).length,
    expiring30Days: guardians.filter(g => {
      if (!g.expiresAt) return false;
      const daysUntil = Math.ceil(
        (g.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      );
      return daysUntil <= 30 && daysUntil > 0;
    }).length,
    expired: guardians.filter(g => g.isExpired).length,
    byRole: {
      SIGNER: guardians.filter(g => g.role === "SIGNER").length,
      OBSERVER: guardians.filter(g => g.role === "OBSERVER").length,
      EMERGENCY_ONLY: guardians.filter(g => g.role === "EMERGENCY_ONLY").length,
    },
    guardians
  };
}

// Export all functions for use in other modules
module.exports = {
  assignGuardianRole,
  revokeGuardianRole,
  getVaultGuardians,
  canGuardianApproveWithdrawal,
  getEligibleSigners,
  executeRoleBasedWithdrawal,
  getExpiringRoles,
  updateRolePermissions,
  getGuardianRoleStatus,
  setupRoleEventListeners,
  assignMultipleGuardians,
  upgradeGuardianRole,
  generateGuardianStatusReport
};

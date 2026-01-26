// This script scans on-chain events and mints badges for eligible guardians.
// Run with: npx tsx scripts/mintBadges.ts
import { ethers } from "ethers";
import GuardianBadgeABI from "../lib/abis/GuardianBadge.json";
import GuardianSBTABI from "../lib/abis/GuardianSBT.json";
import SpendVaultABI from "../lib/abis/SpendVault.json";
import dotenv from "dotenv";
dotenv.config();

const GUARDIAN_BADGE_ADDRESS = process.env.GUARDIAN_BADGE_ADDRESS!;
const GUARDIAN_SBT_ADDRESS = process.env.GUARDIAN_SBT_ADDRESS!;
const SPEND_VAULT_ADDRESS = process.env.SPEND_VAULT_ADDRESS!;
const PROVIDER_URL = process.env.RPC_URL!;
const PRIVATE_KEY = process.env.MINTER_PRIVATE_KEY!;

const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const badgeContract = new ethers.Contract(GUARDIAN_BADGE_ADDRESS, GuardianBadgeABI.default ?? GuardianBadgeABI, signer);
const guardianSBT = new ethers.Contract(GUARDIAN_SBT_ADDRESS, GuardianSBTABI, provider);
const spendVault = new ethers.Contract(SPEND_VAULT_ADDRESS, SpendVaultABI, provider);

async function main() {
  // 1. Get all GuardianAdded events
  const guardianAddedFilter = guardianSBT.filters?.GuardianAdded || guardianSBT.interface.getEventTopic('GuardianAdded');
  const addedEvents = await guardianSBT.queryFilter(guardianAddedFilter, 0, 'latest');

  // 2. Get all GuardianRemoved events
  const guardianRemovedFilter = guardianSBT.filters?.GuardianRemoved || guardianSBT.interface.getEventTopic('GuardianRemoved');
  const removedEvents = await guardianSBT.queryFilter(guardianRemovedFilter, 0, 'latest');

  // 3. Build current guardian set
  const removedSet = new Set(removedEvents.map(e => e.args.guardian.toLowerCase()));
  const guardians = addedEvents
    .filter(e => !removedSet.has(e.args.guardian.toLowerCase()))
    .map(e => ({
      address: e.args.guardian,
      tokenId: e.args.tokenId,
      addedAt: (await provider.getBlock(e.blockNumber)).timestamp * 1000,
    }));

  // 4. For each guardian, scan SpendVault Withdrawn events for approvals
  const withdrawnFilter = spendVault.filters?.Withdrawn || spendVault.interface.getEventTopic('Withdrawn');
  const withdrawnEvents = await spendVault.queryFilter(withdrawnFilter, 0, 'latest');

  for (const guardian of guardians) {
    // Approvals: count how many times this guardian signed/approved a withdrawal (assume event has guardian info in args if available)
    // For demo, count all withdrawals as approvals (replace with real logic if guardian address is in event args)
    const approvals = withdrawnEvents.length;

    // Response time: calculate average time between withdrawal request and approval (not available in Withdrawn event, so set dummy value)
    const avgResponseTime = 1800; // TODO: Replace with real calculation if possible

    // Longevity: time since added
    const now = Date.now();
    const days = (now - guardian.addedAt) / (1000 * 60 * 60 * 24);

    // Badge levels
    const approvalLevel = approvals >= 50 ? 3 : approvals >= 20 ? 2 : approvals >= 5 ? 1 : 0;
    const responseLevel = avgResponseTime <= 600 ? 3 : avgResponseTime <= 1800 ? 2 : avgResponseTime <= 3600 ? 1 : 0;
    const longevityLevel = days >= 365 ? 3 : days >= 90 ? 2 : days >= 30 ? 1 : 0;

    // Check which badges are already minted
    const badges = await badgeContract.getBadges(guardian.address);
    const hasApprovalBadge = badges.some((b: any) => Number(b.badgeType) === 0);
    const hasResponseBadge = badges.some((b: any) => Number(b.badgeType) === 1);
    const hasLongevityBadge = badges.some((b: any) => Number(b.badgeType) === 2);

    // Mint badges if eligible and not already minted
    if (approvalLevel > 0 && !hasApprovalBadge) {
      const tx = await badgeContract.mintBadge(guardian.address, 0, approvalLevel);
      await tx.wait();
      console.log(`Minted Approvals badge (level ${approvalLevel}) for ${guardian.address}`);
    }
    if (responseLevel > 0 && !hasResponseBadge) {
      const tx = await badgeContract.mintBadge(guardian.address, 1, responseLevel);
      await tx.wait();
      console.log(`Minted ResponseTime badge (level ${responseLevel}) for ${guardian.address}`);
    }
    if (longevityLevel > 0 && !hasLongevityBadge) {
      const tx = await badgeContract.mintBadge(guardian.address, 2, longevityLevel);
      await tx.wait();
      console.log(`Minted Longevity badge (level ${longevityLevel}) for ${guardian.address}`);
    }
  }
  console.log("Badge minting complete.");
}

main().catch(console.error);

# 🔒 Security & Limitations

## Security Considerations

### ✅ Implemented Protections

**Smart Contract Security**
- ✅ **Deterministic Reputation Calculation**: Score calculated purely from on-chain data, no external dependencies
- ✅ **No Centralized Authority**: Reputation algorithm is transparent, on-chain, and auditable
- ✅ **Immutable Credentials**: Once stored on blockchain, credentials cannot be modified
- ✅ **Access Control**: Owner-only functions use `require(msg.sender == owner)`
- ✅ **Multi-Signature Support**: Credentials can require 2+ verifiers (extensible)
- ✅ **Test Coverage**: 23 comprehensive tests covering scoring, edge cases, and integration

**Frontend Security**
- ✅ **Wallet Connection Required**: All write operations require wallet signature (wagmi)
- ✅ **JSON Validation**: Resume data validated before IPFS upload
- ✅ **Address Matching**: Wallet address must match profile owner
- ✅ **HTTPS/TLS**: All API communications encrypted in transit

**IPFS & Storage**
- ✅ **Hash Verification**: Content hash stored on-chain, IPFS guarantees content integrity
- ✅ **Multi-Provider Support**: Not locked into single IPFS provider (Pinata, NFT.Storage, Infura)
- ✅ **No Private Data On-Chain**: Sensitive info stays on IPFS, only hash on blockchain

### ⚠️ Known Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| **Smart Contract Bugs** | High | 23 tests, external audit recommended |
| **Private Key Compromise** | Critical | Educate users on wallet security |
| **IPFS Provider Outage** | Medium | Multiple provider options + fallback gateways |
| **Malicious Verifier** | Medium | Multi-sig requirement (2+ verifiers) |
| **Sybil Attacks** | Medium | Wallet-based identity (still prone to new wallets) |
| **Frontend XSS** | Low | Use Next.js 14 security defaults + React escaping |

---

## Known Limitations

### Version 0.2.0 Limitations

**Reputation System**
- ⚠️ Base reputation is simple (no decay for inactive profiles)
- ⚠️ No reputation floor or penalties (only additions)
- ⚠️ Verifier count-based scoring (no quality weighting)
- ⚠️ No negative reputation for failed verifications

**Credentials**
- ⚠️ No automatic expiry enforcement (verifications can reference expired credentials)
- ⚠️ Issuer verification is simple (no multi-factor verification)
- ⚠️ No revocation mechanism (credentials cannot be recalled)
- ⚠️ Credential metadata is minimal (no detailed issuance conditions)

**Multi-Chain**
- ⚠️ No automatic synchronization between Base & Stacks
- ⚠️ Users must manually create profiles on each chain
- ⚠️ No cross-chain credential verification (isolated by network)
- ⚠️ No unified view of cross-chain reputation

**Verification**
- ⚠️ Verifier selection is manual (no algorithmic matching)
- ⚠️ No verifier reputation system
- ⚠️ No verifier staking/slashing (free to verify)
- ⚠️ No dispute resolution mechanism

**User Experience**
- ⚠️ Requires wallet connection (ETH address = identity)
- ⚠️ No social recovery or account backup
- ⚠️ Profile deletion would leave on-chain data
- ⚠️ No profile privacy controls (all data public)

### Version 0.3.0+ Roadmap

**Planned Improvements**
- [ ] Reputation decay for inactive profiles (lose 1 point per month)
- [ ] Revocation mechanism for credentials
- [ ] Cross-chain reputation aggregation (Base + Stacks unified score)
- [ ] Verifier reputation system with performance scoring
- [ ] Automatic credential expiry enforcement
- [ ] Social recovery via guardians
- [ ] Profile privacy tiers (public/private credentials)
- [ ] Negative scoring for unverified claims
- [ ] Cross-chain credential bridging

---

## Audit & Deployment Status

### Code Quality
- ✅ **TypeScript**: 100% type safety across frontend
- ✅ **Solidity**: 0.8.19 (latest stable at time of development)
- ✅ **Hardhat**: Full compilation + testing framework
- ✅ **Linting**: ESLint configured for code quality
- ✅ **Test Coverage**: 23 comprehensive tests, all passing

### Deployment Readiness
- ✅ **Base Mainnet**: OnChainResume.sol deployed (contract address in `.env`)
- ✅ **Base Sepolia**: Testnet version available for testing
- ✅ **Stacks Mainnet**: OnChainResume.clar deployed (same logic in Clarity)
- ✅ **Stacks Testnet**: Development & testing available

### External Audit
- ⚠️ Not professionally audited (recommended for production)
- ⚠️ Community review recommended before mainnet use
- ⚠️ Bug bounty program not yet established

---

## Security Best Practices for Users

### For Profile Owners
1. **Secure Your Wallet**: Never share private keys or seed phrases
2. **Verify Contract Address**: Always check `NEXT_PUBLIC_CONTRACT_ADDRESS` before interacting
3. **Review Credentials**: Only connect with verified issuers
4. **Backup Wallet**: Use hardware wallet for mainnet profiles
5. **Check IPFS Content**: Verify your resume JSON before uploading

### For Credential Verifiers
1. **Verify Claims**: Don't verify credentials you can't independently confirm
2. **Limit Verifications**: Don't accept payment for verifications (compromises trust)
3. **Track Your Reputation**: Monitor verifications you've signed
4. **Dispute Falsified Claims**: Report bad actors to community

### For Platform Operators
1. **Monitor Smart Contract**: Watch for unusual patterns
2. **Backup IPFS Hashes**: Maintain copies of critical resumes
3. **Verifier Vetting**: Develop criteria for trusted verifiers
4. **Community Guidelines**: Publish expectations for credential types
5. **Emergency Procedures**: Have process for compromised verifiers

---

## Comparison: Traditional vs Web3 Resume Risks

| Aspect | Traditional Resume | Web3 Resume |
|--------|-------------------|-----------
| **Data Integrity** | ⚠️ Easily modified | ✅ Cryptographically signed |
| **Platform Risk** | ⚠️ Company can change terms | ✅ Owned by user forever |
| **Verification Trust** | ⚠️ Assumed from brand | ✅ Provable via signatures |
| **Account Lockout** | ⚠️ Platform decision | ✅ Only by wallet loss |
| **Cost of Trust** | 💰 Platform tax | ✅ Minimal (gas only) |
| **Data Privacy** | ⚠️ Platform can see all | ✅ Decentralized (public choice) |

---

## Responsible Disclosure

If you discover a security vulnerability, please:
1. **Do NOT** post publicly
2. Email security@onchainresume.xyz with details
3. Include proof-of-concept only if necessary
4. Allow 30 days for response before disclosure
5. Use PGP encryption if possible

Security issues will be prioritized and addressed promptly.

---

## Version History

**v0.2.0** (Current)
- Reputation scoring with 23 tests
- IPFS integration (Pinata/NFT.Storage/Infura)
- Credential verification system
- Achievement badges (ERC1155)
- Base + Stacks deployment
- Soulbound NFT support

**v0.1.0** (Initial)
- Basic profile creation
- Simple credential storage
- Early reputation scoring

---

**Last Updated**: January 5, 2026  
**Maintained By**: cryptonique0  
**License**: MIT

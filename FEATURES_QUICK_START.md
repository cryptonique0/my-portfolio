# Quick Start: New Features

## 1. Resume Upload Component

Upload structured resume data to IPFS with Pinata pinning.

### Usage

```tsx
import { ResumeUploadComponent } from '@/components/ResumeUploadComponent';

export default function UploadResumePage() {
  return (
    <ResumeUploadComponent
      onUploadSuccess={(ipfsHash) => {
        console.log('Resume uploaded:', ipfsHash);
        // Store IPFS hash on-chain via createProfile()
      }}
      onUploadError={(error) => {
        console.error('Upload failed:', error);
      }}
    />
  );
}
```

### Features
- ✅ Multi-section builder (experience, education, projects, skills)
- ✅ Tab-based interface for easy navigation
- ✅ Add/remove items dynamically
- ✅ Real-time validation
- ✅ Direct IPFS upload with Pinata pinning
- ✅ Wallet connection verification

---

## 2. Animated Timeline Component

Display professional history with smooth animations and credential verification.

### Usage

```tsx
import { AnimatedTimeline, TimelineEvent } from '@/components/AnimatedTimeline';

export default function ProfilePage() {
  const events: TimelineEvent[] = [
    {
      id: '1',
      title: 'Senior React Developer',
      description: '5+ years of experience building scalable web applications',
      date: '2023-01-15',
      type: 'experience',
      verified: true,
      verifier: '0x1234...',
      verificationDate: '2024-01-10',
      issuer: 'Acme Corp',
      category: 'work'
    },
    {
      id: '2',
      title: 'AWS Solutions Architect',
      description: 'Professional certification in cloud architecture',
      date: '2022-06-20',
      type: 'credential',
      verified: true,
      issuer: 'Amazon Web Services',
      expiryDate: '2027-06-20',
      proofUrl: 'https://credentials.example.com/...',
      category: 'certification'
    }
  ];

  return (
    <AnimatedTimeline
      events={events}
      groupByCategory={true}
      highlightVerified={true}
    />
  );
}
```

### Features
- ✅ Vertical timeline with smooth animations
- ✅ Category grouping (experience, education, projects, credentials, achievements)
- ✅ Visual verification badges
- ✅ Expandable categories
- ✅ Date formatting and expiry tracking
- ✅ Proof URL links
- ✅ Fully responsive and accessible

### Event Types
- `experience` - Job positions
- `education` - Degrees and coursework
- `project` - Portfolio projects
- `credential` - Certificates and licenses
- `achievement` - Badges and awards
- `milestone` - Important dates

---

## 3. Enhanced Leaderboard

Display top profiles ranked by reputation with pagination and filtering.

### Usage

```tsx
import { Leaderboard } from '@/components/Leaderboard';

export default function LeaderboardPage() {
  return (
    <Leaderboard
      limit={50}
      showPagination={true}
      showCurrentUserRank={true}
    />
  );
}
```

### Features
- ✅ Paginated ranking (10 per page)
- ✅ Sort by reputation or achievements
- ✅ Medal icons for top 3 (🥇 🥈 🥉)
- ✅ Highlight current user's rank
- ✅ Reputation tier system (Platinum, Gold, Silver, Bronze)
- ✅ Verified badge indicator
- ✅ Last active timestamp
- ✅ Smooth animations

### Query Parameters
```
GET /api/leaderboard?limit=50&page=1&sortBy=reputation&minReputation=0
```

---

## 4. Custom Hooks

### useIPFSResume()
Upload resume data to IPFS.

```tsx
import { useIPFSResume } from '@/hooks/useIPFSResume';

function MyComponent() {
  const { uploadResume, isLoading, error, success, ipfsHash } = useIPFSResume();

  const handleUpload = async () => {
    const hash = await uploadResume({
      name: 'John Doe',
      bio: 'Full-stack developer',
      skills: ['React', 'Node.js', 'Solidity'],
      experience: [],
      education: [],
      projects: []
    });

    if (hash) {
      console.log('Uploaded:', hash);
    }
  };

  return (
    <button onClick={handleUpload} disabled={isLoading}>
      {isLoading ? 'Uploading...' : 'Upload Resume'}
    </button>
  );
}
```

### useCredentialVerification()
Verify credentials as an issuer.

```tsx
import { useCredentialVerification } from '@/hooks/useIPFSResume';

function VerifyButton({ userAddress, credentialIndex }) {
  const { verifyCredential, isLoading, error } = useCredentialVerification();

  const handleVerify = async () => {
    const success = await verifyCredential(userAddress, credentialIndex);
    if (success) {
      console.log('Credential verified!');
    }
  };

  return (
    <button onClick={handleVerify} disabled={isLoading}>
      Verify Credential
    </button>
  );
}
```

### useLeaderboard()
Fetch and display leaderboard data.

```tsx
import { useLeaderboard } from '@/hooks/useIPFSResume';

function LeaderboardWidget() {
  const { entries, isLoading, error, userRank, refetch } = useLeaderboard(
    50,        // limit
    'reputation' // sortBy
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {userRank && (
        <div>Your Rank: #{userRank.rank} ({userRank.reputation} pts)</div>
      )}
      <div>
        {entries.map(entry => (
          <div key={entry.address}>
            {entry.rank}. {entry.handle} - {entry.reputation} pts
          </div>
        ))}
      </div>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

---

## 5. Integration Example

Complete profile creation flow:

```tsx
'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useContractProfile } from '@/hooks/useContractProfile';
import { useIPFSResume } from '@/hooks/useIPFSResume';
import { ResumeUploadComponent } from '@/components/ResumeUploadComponent';

export default function CreateProfilePage() {
  const { address, isConnected } = useAccount();
  const { createProfile, isLoading: isContractLoading } = useContractProfile();
  const { uploadResume } = useIPFSResume();
  const [handle, setHandle] = useState('');

  const handleResumeUpload = async (ipfsHash: string) => {
    // Step 1: Resume uploaded to IPFS
    console.log('Resume IPFS hash:', ipfsHash);

    // Step 2: Create profile on-chain with IPFS hash
    const tx = await createProfile(handle, ipfsHash);
    console.log('Profile created:', tx);
  };

  return (
    <div className="space-y-8">
      <div className="p-6 bg-white rounded-lg shadow">
        <input
          type="text"
          placeholder="Choose your handle"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <ResumeUploadComponent
        onUploadSuccess={handleResumeUpload}
        onUploadError={(error) => console.error('Upload error:', error)}
      />
    </div>
  );
}
```

---

## 6. API Examples

### Upload Resume to IPFS

```bash
curl -X POST http://localhost:3000/api/ipfs/upload \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x...",
    "name": "John Doe",
    "bio": "Full-stack developer",
    "skills": ["React", "Solidity"],
    "experience": [
      {
        "title": "Senior Developer",
        "company": "Tech Corp",
        "startDate": "2020-01-01",
        "description": "Led team of 5 developers"
      }
    ],
    "education": [],
    "projects": [],
    "timestamp": 1704297600000
  }'
```

### Verify Credential

```bash
curl -X POST http://localhost:3000/api/credentials/verify \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0x...",
    "credentialIndex": 0,
    "issuerAddress": "0x..."
  }'
```

### Get Leaderboard

```bash
curl "http://localhost:3000/api/leaderboard?limit=10&page=1&sortBy=reputation"
```

---

## 7. Environment Setup

Add to your `.env.local`:

```env
# Pinata IPFS Pinning
PINATA_API_KEY=your_key_here
PINATA_SECRET_KEY=your_secret_here
# OR use JWT
PINATA_JWT=your_jwt_here

NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud

# Wallet Connection
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Contract
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NETWORK=base
NEXT_PUBLIC_CHAIN_ID=8453
```

---

## 8. Testing Checklist

- [ ] Resume upload to IPFS completes successfully
- [ ] IPFS hash is retrievable from multiple gateways
- [ ] Timeline displays events with correct colors
- [ ] Verified credentials show checkmark
- [ ] Timeline groups by category correctly
- [ ] Leaderboard pagination works
- [ ] User rank highlights correctly
- [ ] Credential verification calls API successfully
- [ ] All components are responsive on mobile
- [ ] Dark mode works correctly

---

**For detailed implementation information, see [FEATURE_IMPLEMENTATION.md](./FEATURE_IMPLEMENTATION.md)**

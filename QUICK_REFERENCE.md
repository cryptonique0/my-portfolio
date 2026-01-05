# 🚀 Quick Reference Card

## Components

### AnimatedTimeline
```tsx
import { AnimatedTimeline } from '@/components/AnimatedTimeline';

<AnimatedTimeline
  events={events}
  groupByCategory={true}
  highlightVerified={true}
/>
```

**Props**:
- `events: TimelineEvent[]` - Array of timeline events
- `groupByCategory?: boolean` - Group by event type
- `highlightVerified?: boolean` - Show verification badges

---

### ResumeUploadComponent
```tsx
import { ResumeUploadComponent } from '@/components/ResumeUploadComponent';

<ResumeUploadComponent
  onUploadSuccess={(hash) => console.log(hash)}
  onUploadError={(error) => console.error(error)}
/>
```

**Features**: Multi-section form, IPFS upload, validation

---

### Leaderboard
```tsx
import { Leaderboard } from '@/components/Leaderboard';

<Leaderboard
  limit={50}
  showPagination={true}
  showCurrentUserRank={true}
/>
```

---

## Hooks

### useIPFSResume
```tsx
const { uploadResume, isLoading, error, success, ipfsHash } = useIPFSResume();

const hash = await uploadResume({
  name, bio, skills, experience, education, projects
});
```

---

### useCredentialVerification
```tsx
const { verifyCredential, isLoading, error } = useCredentialVerification();

await verifyCredential(userAddress, credentialIndex, issuerSignature);
```

---

### useLeaderboard
```tsx
const { entries, isLoading, error, userRank, refetch } = useLeaderboard(50, 'reputation');
```

---

## API Endpoints

### Upload Resume
```bash
POST /api/ipfs/upload
{
  "address": "0x...",
  "name": "John Doe",
  "bio": "...",
  "skills": [...],
  "experience": [...],
  "education": [...],
  "projects": [...]
}
```

Returns: `{ ipfsHash, gateway, pinned }`

---

### Verify Credential
```bash
POST /api/credentials/verify
{
  "userAddress": "0x...",
  "credentialIndex": 0,
  "issuerAddress": "0x...",
  "issuerSignature": "..."
}
```

---

### Get Leaderboard
```bash
GET /api/leaderboard?limit=50&page=1&sortBy=reputation
```

Returns: `{ data: LeaderboardEntry[], pagination }`

---

## Types

### TimelineEvent
```typescript
interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'achievement' | 'credential' | 'milestone' | 'education' | 'experience' | 'project';
  verified?: boolean;
  issuer?: string;
  expiryDate?: string;
  proofUrl?: string;
}
```

---

### LeaderboardEntry
```typescript
interface LeaderboardEntry {
  rank: number;
  address: string;
  handle: string;
  reputation: number;
  reputationTier: string;
  achievementCount: number;
  credentialCount: number;
  verified: boolean;
}
```

---

## Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Set env variables
cp .env.example .env.local

# Add to .env.local:
PINATA_API_KEY=...
PINATA_SECRET_KEY=...
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud

# Run dev server
npm run dev
```

---

## Common Tasks

### Upload Resume
```tsx
const { uploadResume } = useIPFSResume();
const hash = await uploadResume(resumeData);
// Store hash on-chain via createProfile()
```

### Display Profile Timeline
```tsx
<AnimatedTimeline events={profileData} groupByCategory={true} />
```

### Show Top Profiles
```tsx
<Leaderboard limit={10} showCurrentUserRank={true} />
```

### Verify Credential
```tsx
const { verifyCredential } = useCredentialVerification();
await verifyCredential(userAddress, 0);
```

---

## Reputation Scoring

| Action | Points |
|--------|--------|
| Profile created | 10 |
| Profile verified | +25 |
| Credential (unverified) | +5 |
| Credential (verified 2+) | +15 |
| Achievement | +10 |
| Profile updated | +3 |

---

## Event Types & Colors

| Type | Color | Icon |
|------|-------|------|
| achievement | Purple→Pink | 🏆 |
| credential | Blue→Cyan | 📜 |
| milestone | Green→Emerald | 🎯 |
| education | Indigo→Blue | 🎓 |
| experience | Orange→Red | 💼 |
| project | Violet→Purple | 🚀 |

---

## Tiers

| Tier | Points | Badge |
|------|--------|-------|
| Platinum | 9000+ | 🏆 |
| Gold | 7000+ | 🥇 |
| Silver | 5000+ | 🥈 |
| Bronze | 3000+ | 🥉 |

---

## Documentation Links

- [FEATURE_IMPLEMENTATION.md](./FEATURE_IMPLEMENTATION.md) - Full technical guide
- [FEATURES_QUICK_START.md](./FEATURES_QUICK_START.md) - Quick start examples
- [PHASE_2_COMPLETION_REPORT.md](./PHASE_2_COMPLETION_REPORT.md) - Implementation summary
- [README.md](./README.md) - Project overview

---

## Error Handling

All components handle errors gracefully:

```tsx
if (error) {
  return <div className="text-red-600">{error}</div>;
}

if (isLoading) {
  return <div>Loading...</div>;
}
```

---

## Dark Mode Support

All components support dark mode via Tailwind:
```tsx
className="dark:bg-gray-800 dark:text-white"
```

---

**Version**: 0.2.0  
**Last Updated**: January 4, 2026  
**Status**: Production Ready ✅

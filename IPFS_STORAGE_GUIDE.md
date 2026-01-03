# IPFS Resume Storage System

## Overview

This project uses **IPFS (InterPlanetary File System)** with **Pinata** for decentralized resume storage. All resume data is stored as JSON on IPFS and pinned for persistent availability.

## Architecture

```
User → API Routes → IPFS Library → Pinata → IPFS Network
                                       ↓
                              On-chain IPFS Hash
```

## Features

✅ **Decentralized Storage** - Resume data stored on IPFS  
✅ **Persistent Pinning** - Content pinned via Pinata for reliability  
✅ **Multiple Gateways** - Fetches from multiple gateways for availability  
✅ **Structured Data** - Standardized resume JSON format  
✅ **On-chain References** - IPFS hashes stored in smart contract  
✅ **Update Support** - Ability to update IPFS hash on-chain  

---

## Setup

### 1. Get Pinata Credentials

1. Sign up at [Pinata.cloud](https://pinata.cloud)
2. Go to **API Keys** in your account
3. Create a new API key with permissions:
   - `pinFileToIPFS`
   - `pinJSONToIPFS`
   - `unpin`
   - `pinList`

### 2. Configure Environment Variables

Add to your `.env.local`:

```bash
# Pinata Configuration (use JWT or API Key + Secret)
PINATA_JWT=your_pinata_jwt_token_here

# OR use API Key + Secret
PINATA_API_KEY=your_api_key_here
PINATA_SECRET_KEY=your_secret_key_here

# IPFS Gateway (optional, defaults to Pinata)
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud
```

**Note**: JWT is recommended over API Key + Secret for better security.

---

## Resume Data Structure

### JSON Format

```typescript
{
  "address": "0x1234...5678",           // User wallet address
  "name": "John Doe",                   // Full name
  "bio": "Web3 Developer...",           // Professional bio
  "skills": ["Solidity", "React"],      // Skills array
  "experience": [                       // Work experience
    {
      "title": "Senior Developer",
      "company": "Web3 Corp",
      "startDate": "2022-01",
      "endDate": "2024-01",
      "description": "Built smart contracts..."
    }
  ],
  "education": [                        // Education history
    {
      "degree": "B.S. Computer Science",
      "institution": "MIT",
      "graduationDate": "2020-05",
      "field": "Computer Science"
    }
  ],
  "projects": [                         // Portfolio projects
    {
      "title": "DeFi Protocol",
      "description": "Decentralized exchange...",
      "url": "https://github.com/...",
      "technologies": ["Solidity", "React"],
      "date": "2023-06"
    }
  ],
  "timestamp": 1704326400000            // Upload timestamp
}
```

---

## API Routes

### 1. Upload Resume

**Endpoint**: `POST /api/ipfs/upload`

**Description**: Upload resume JSON to IPFS with Pinata pinning

**Request Body**:
```json
{
  "address": "0x1234...5678",
  "name": "John Doe",
  "bio": "Web3 Developer",
  "skills": ["Solidity", "React"],
  "experience": [...],
  "education": [...],
  "projects": [...]
}
```

**Response** (Success 200):
```json
{
  "success": true,
  "ipfsHash": "bafybeig...",
  "cid": "bafybeig...",
  "size": 2048,
  "pinned": true,
  "gateway": "https://gateway.pinata.cloud/ipfs/bafybeig...",
  "timestamp": 1704326400000,
  "message": "Resume uploaded and pinned to IPFS successfully"
}
```

**Response** (Error 400):
```json
{
  "error": "Address and name are required",
  "details": "Missing required fields"
}
```

**Example Usage**:
```typescript
const response = await fetch('/api/ipfs/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: '0x1234...5678',
    name: 'John Doe',
    bio: 'Web3 Developer',
    skills: ['Solidity', 'React'],
    experience: [],
    education: [],
    projects: []
  })
});

const data = await response.json();
console.log('IPFS Hash:', data.ipfsHash);
```

---

### 2. Fetch Resume

**Endpoint**: `GET /api/ipfs/fetch/[hash]`

**Description**: Fetch resume data from IPFS using multiple gateways

**Parameters**:
- `hash` - IPFS CID (e.g., `bafybeig...`)

**Response** (Success 200):
```json
{
  "success": true,
  "data": {
    "address": "0x1234...5678",
    "name": "John Doe",
    ...
  },
  "ipfsHash": "bafybeig...",
  "gateway": "https://gateway.pinata.cloud/ipfs/bafybeig...",
  "cached": true
}
```

**Response** (Error 404):
```json
{
  "error": "Data not found on IPFS",
  "details": "Content could not be retrieved from any gateway",
  "hash": "bafybeig..."
}
```

**Example Usage**:
```typescript
const hash = 'bafybeig...';
const response = await fetch(`/api/ipfs/fetch/${hash}`);
const { data } = await response.json();
console.log('Resume:', data);
```

---

### 3. Check Pin Status

**Endpoint**: `GET /api/ipfs/pin/[hash]`

**Description**: Check if content is pinned on Pinata

**Response** (Success 200):
```json
{
  "success": true,
  "ipfsHash": "bafybeig...",
  "pinned": true,
  "message": "Content is pinned"
}
```

**Example Usage**:
```typescript
const hash = 'bafybeig...';
const response = await fetch(`/api/ipfs/pin/${hash}`);
const { pinned } = await response.json();
console.log('Is Pinned:', pinned);
```

---

### 4. Unpin Content

**Endpoint**: `DELETE /api/ipfs/pin/[hash]`

**Description**: Remove pin from Pinata (admin operation)

**Response** (Success 200):
```json
{
  "success": true,
  "ipfsHash": "bafybeig...",
  "message": "Content unpinned successfully"
}
```

**Example Usage**:
```typescript
const hash = 'bafybeig...';
const response = await fetch(`/api/ipfs/pin/${hash}`, {
  method: 'DELETE'
});
const { success } = await response.json();
```

---

### 5. List Pinned Content

**Endpoint**: `GET /api/ipfs/pin/list/[address]`

**Description**: Get all pinned resumes for an address

**Response** (Success 200):
```json
{
  "success": true,
  "address": "0x1234...5678",
  "count": 3,
  "ipfsHashes": [
    "bafybeig...",
    "bafybeih...",
    "bafybeii..."
  ],
  "message": "Found 3 pinned resume(s)"
}
```

**Example Usage**:
```typescript
const address = '0x1234...5678';
const response = await fetch(`/api/ipfs/pin/list/${address}`);
const { ipfsHashes } = await response.json();
console.log('Pinned Resumes:', ipfsHashes);
```

---

## IPFS Library Functions

### Core Functions

#### `uploadResumeToIPFS(resumeData: ResumeData)`

Upload and pin resume to IPFS via Pinata.

```typescript
import { uploadResumeToIPFS } from '@/lib/ipfs';

const result = await uploadResumeToIPFS({
  address: '0x...',
  name: 'John Doe',
  bio: '...',
  skills: [],
  experience: [],
  education: [],
  projects: [],
  timestamp: Date.now()
});

console.log('CID:', result.cid);
console.log('Pinned:', result.pinned);
```

#### `fetchResumeFromIPFS(ipfsHash: string)`

Fetch resume from IPFS using multiple gateways.

```typescript
import { fetchResumeFromIPFS } from '@/lib/ipfs';

const resume = await fetchResumeFromIPFS('bafybeig...');
if (resume) {
  console.log('Name:', resume.name);
}
```

#### `isPinned(ipfsHash: string)`

Check if content is pinned on Pinata.

```typescript
import { isPinned } from '@/lib/ipfs';

const pinned = await isPinned('bafybeig...');
console.log('Pinned:', pinned);
```

#### `unpinFromIPFS(ipfsHash: string)`

Remove pin from Pinata.

```typescript
import { unpinFromIPFS } from '@/lib/ipfs';

const success = await unpinFromIPFS('bafybeig...');
```

#### `getPinnedContent(address: string)`

Get all pinned content for an address.

```typescript
import { getPinnedContent } from '@/lib/ipfs';

const hashes = await getPinnedContent('0x...');
console.log('Pinned Hashes:', hashes);
```

#### `uploadJSONToIPFS(data: any, metadata?)`

Upload any JSON data to IPFS.

```typescript
import { uploadJSONToIPFS } from '@/lib/ipfs';

const result = await uploadJSONToIPFS(
  { key: 'value' },
  { 
    name: 'my-data.json',
    keyvalues: { type: 'custom' }
  }
);
```

---

## Integration with Smart Contract

### Store IPFS Hash On-Chain

After uploading to IPFS, store the hash in the smart contract:

```typescript
import { uploadResumeToIPFS } from '@/lib/ipfs';
import { useContractWrite } from 'wagmi';

// 1. Upload to IPFS
const result = await uploadResumeToIPFS(resumeData);

// 2. Store hash on-chain
const { write } = useContractWrite({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: 'createProfile',
  args: ['username', result.cid]
});

await write();
```

### Update IPFS Hash

```typescript
import { uploadResumeToIPFS } from '@/lib/ipfs';
import { useContractWrite } from 'wagmi';

// 1. Upload new version to IPFS
const result = await uploadResumeToIPFS(updatedResumeData);

// 2. Update hash on-chain
const { write } = useContractWrite({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: 'updateProfile',
  args: [result.cid]
});

await write();
```

### Fetch Resume from On-Chain Hash

```typescript
import { fetchResumeFromIPFS } from '@/lib/ipfs';
import { useContractRead } from 'wagmi';

// 1. Get IPFS hash from contract
const { data: profile } = useContractRead({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: 'getProfile',
  args: [userAddress]
});

// 2. Fetch from IPFS
if (profile?.ipfsHash) {
  const resume = await fetchResumeFromIPFS(profile.ipfsHash);
}
```

---

## Complete Workflow Example

### Creating a Profile with Resume

```typescript
'use client';

import { useState } from 'react';
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi';
import { uploadResumeToIPFS } from '@/lib/ipfs';

export default function CreateProfile() {
  const { address } = useAccount();
  const [uploading, setUploading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState('');

  const { write: createProfile, data: txData } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'createProfile',
  });

  const { isLoading: isTxLoading } = useWaitForTransaction({
    hash: txData?.hash,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // 1. Prepare resume data
      const resumeData = {
        address: address!,
        name: formData.get('name') as string,
        bio: formData.get('bio') as string,
        skills: (formData.get('skills') as string).split(','),
        experience: [],
        education: [],
        projects: [],
        timestamp: Date.now()
      };

      // 2. Upload to IPFS
      const result = await uploadResumeToIPFS(resumeData);
      setIpfsHash(result.cid);

      // 3. Store on-chain
      await createProfile({
        args: [formData.get('username'), result.cid]
      });

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" placeholder="Username" required />
      <input name="name" placeholder="Full Name" required />
      <textarea name="bio" placeholder="Bio" required />
      <input name="skills" placeholder="Skills (comma-separated)" />
      
      <button type="submit" disabled={uploading || isTxLoading}>
        {uploading ? 'Uploading to IPFS...' :
         isTxLoading ? 'Creating Profile...' :
         'Create Profile'}
      </button>

      {ipfsHash && (
        <div>
          <p>IPFS Hash: {ipfsHash}</p>
          <a href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`} target="_blank">
            View on IPFS
          </a>
        </div>
      )}
    </form>
  );
}
```

### Viewing a Profile

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useContractRead } from 'wagmi';
import { fetchResumeFromIPFS } from '@/lib/ipfs';

export default function ViewProfile({ address }: { address: string }) {
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { data: profile } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getProfile',
    args: [address]
  });

  useEffect(() => {
    async function loadResume() {
      if (profile?.ipfsHash) {
        setLoading(true);
        const data = await fetchResumeFromIPFS(profile.ipfsHash);
        setResume(data);
        setLoading(false);
      }
    }
    loadResume();
  }, [profile?.ipfsHash]);

  if (loading) return <div>Loading resume...</div>;
  if (!resume) return <div>Resume not found</div>;

  return (
    <div>
      <h1>{resume.name}</h1>
      <p>{resume.bio}</p>
      
      <h2>Skills</h2>
      <ul>
        {resume.skills.map((skill: string, i: number) => (
          <li key={i}>{skill}</li>
        ))}
      </ul>

      <h2>Experience</h2>
      {resume.experience.map((exp: any, i: number) => (
        <div key={i}>
          <h3>{exp.title} at {exp.company}</h3>
          <p>{exp.startDate} - {exp.endDate || 'Present'}</p>
          <p>{exp.description}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Gateway Configuration

The library uses multiple IPFS gateways for reliability:

1. **Pinata Gateway** (Primary) - `https://gateway.pinata.cloud`
2. **IPFS.io** - `https://ipfs.io`
3. **Cloudflare** - `https://cloudflare-ipfs.com`

If one gateway fails, it automatically tries the next.

---

## Best Practices

### 1. Data Validation

Always validate resume data before uploading:

```typescript
import { validateResumeData } from '@/lib/ipfs';

if (!validateResumeData(data)) {
  throw new Error('Invalid resume structure');
}
```

### 2. Error Handling

Handle IPFS upload errors gracefully:

```typescript
try {
  const result = await uploadResumeToIPFS(data);
} catch (error) {
  if (error.message.includes('credentials')) {
    // Handle Pinata auth error
  } else {
    // Handle network error
  }
}
```

### 3. Cache Management

IPFS content is immutable, so cache aggressively:

```typescript
// API route with caching
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
  }
});
```

### 4. Version Control

Store multiple versions by creating new IPFS uploads:

```typescript
// Old version still accessible
const v1Hash = 'bafybeig...';

// New version
const v2Result = await uploadResumeToIPFS(updatedData);
await updateProfile(v2Result.cid);

// Both versions remain on IPFS
```

---

## Security Considerations

### API Key Protection

- ✅ **Never expose** Pinata credentials in client-side code
- ✅ **Use server-side** API routes for all Pinata operations
- ✅ **Store credentials** in `.env.local` (never commit)
- ✅ **Use JWT** instead of API Key + Secret when possible

### Data Privacy

- ⚠️ **IPFS is public** - don't store sensitive data
- ✅ **Use encryption** for private information
- ✅ **Store references** on-chain, not full data
- ✅ **Control access** via smart contract permissions

---

## Troubleshooting

### Upload Fails

```bash
Error: Failed to upload to IPFS: Pinata credentials not configured
```

**Solution**: Add Pinata credentials to `.env.local`

### Fetch Returns Null

```bash
Error: Data not found on IPFS
```

**Solutions**:
1. Check hash is valid CID
2. Content may not be pinned
3. Try different gateway
4. Wait for content to propagate

### Pin Status False

```bash
{ pinned: false }
```

**Solutions**:
1. Content was unpinned
2. Uploaded via different service
3. Check Pinata dashboard

---

## Cost Estimation

### Pinata Free Tier

- **Storage**: 1 GB free
- **Bandwidth**: 100 GB/month free
- **Pins**: Unlimited

### Typical Resume Sizes

- **Minimal**: ~1-2 KB
- **Average**: ~5-10 KB
- **Detailed**: ~20-50 KB

**Example**: 1 GB = ~20,000-50,000 detailed resumes

---

## Monitoring & Analytics

### Check Pin Usage

Visit Pinata dashboard to monitor:
- Total pins
- Storage used
- Bandwidth consumed
- API requests

### Track On-Chain

Query smart contract events:
```typescript
const events = await contract.queryFilter(
  contract.filters.ProfileUpdated()
);

events.forEach(event => {
  console.log('New IPFS Hash:', event.args.ipfsHash);
});
```

---

## Migration Guide

### From Direct IPFS to Pinata

```typescript
// Old: Direct IPFS
import { create } from 'ipfs-http-client';
const ipfs = create({ ... });
const result = await ipfs.add(data);

// New: Pinata
import { uploadResumeToIPFS } from '@/lib/ipfs';
const result = await uploadResumeToIPFS(data);
```

### From NFT.Storage to Pinata

Replace NFT.Storage calls with Pinata equivalents. The API structure is similar.

---

## Future Enhancements

Potential improvements:

1. **IPFS Clustering** - Add redundancy with multiple pinning services
2. **File Attachments** - Support PDF resume uploads
3. **Encryption** - Encrypt sensitive resume sections
4. **Versioning** - Track resume version history
5. **Search Index** - Index resume content for search
6. **Analytics** - Track resume views and interactions

---

## Summary

The IPFS resume storage system provides:

✅ **Decentralized** - No central server required  
✅ **Persistent** - Content pinned for reliability  
✅ **Efficient** - JSON format optimized for size  
✅ **Scalable** - IPFS network handles distribution  
✅ **Verifiable** - On-chain references prove authenticity  
✅ **Immutable** - Content-addressed, tamper-proof  

**Result**: A robust, decentralized resume storage solution that works seamlessly with on-chain profiles.

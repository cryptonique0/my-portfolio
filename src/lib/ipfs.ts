import { create } from 'ipfs-http-client';

const PINATA_BASE_URL = 'https://api.pinata.cloud';
const NFT_STORAGE_UPLOAD_URL = 'https://api.nft.storage/upload';

const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud';

interface IPFSUploadResult {
  path: string;
  cid: string;
  size: number;
}

interface ResumeData {
  address: string;
  name: string;
  bio: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  timestamp: number;
}

interface ExperienceEntry {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string;
}

interface EducationEntry {
  degree: string;
  institution: string;
  graduationDate: string;
  field: string;
}

interface ProjectEntry {
  title: string;
  description: string;
  url?: string;
  technologies: string[];
  date: string;
}

/**
 * Upload resume data to IPFS
 */
export async function uploadResumeToIPFS(resumeData: ResumeData): Promise<string> {
  try {
    const ipfs = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
    });

    const file = {
      path: `resume-${resumeData.address}.json`,
      content: JSON.stringify(resumeData),
    };

    const result = await ipfs.add(file);
    return result.path;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
}

type IpfsProvider = 'pinata' | 'nftstorage' | 'infura';

interface UploadResponse {
  hash: string;
  url: string;
  provider: IpfsProvider;
}

/**
 * Upload resume JSON to a selected provider (Pinata, NFT.Storage, or Infura IPFS)
 */
export async function uploadResume(resumeData: ResumeData, provider: IpfsProvider = 'pinata'): Promise<UploadResponse> {
  if (provider === 'pinata') {
    const { hash, url } = await uploadJSONToIPFS(resumeData);
    return { hash, url, provider };
  }

  if (provider === 'nftstorage') {
    const { hash, url } = await uploadJSONToNFTStorage(resumeData);
    return { hash, url, provider };
  }

  const hash = await uploadResumeToIPFS(resumeData);
  return { hash, url: `${IPFS_GATEWAY}/ipfs/${hash}`, provider: 'infura' };
}

/**
 * Fetch resume data from IPFS
 */
export async function fetchResumeFromIPFS(ipfsHash: string): Promise<ResumeData | null> {
  try {
    const response = await fetch(`${IPFS_GATEWAY}/ipfs/${ipfsHash}`);
    if (!response.ok) {
      throw new Error('Failed to fetch from IPFS');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    return null;
  }
}

/**
 * Get IPFS gateway URL for a hash
 */
export function getIPFSGatewayUrl(ipfsHash: string): string {
  return `${IPFS_GATEWAY}/ipfs/${ipfsHash}`;
}

/**
 * Upload JSON data to IPFS via Pinata
 */
export async function uploadJSONToIPFS(data: any): Promise<{ hash: string; url: string }> {
  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': process.env.PINATA_API_KEY || '',
        'pinata_secret_api_key': process.env.PINATA_SECRET_KEY || '',
      },
      body: JSON.stringify({
        pinataContent: data,
        pinataMetadata: {
          name: `resume-${Date.now()}.json`,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to upload to IPFS');
    }

    const result = await response.json();
    return {
      hash: result.IpfsHash,
      url: `${IPFS_GATEWAY}/ipfs/${result.IpfsHash}`,
    };
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
}

/**
 * Upload JSON to NFT.Storage
 */
export async function uploadJSONToNFTStorage(data: any): Promise<{ hash: string; url: string }> {
  const token = process.env.NFT_STORAGE_TOKEN || '';
  if (!token) {
    throw new Error('NFT_STORAGE_TOKEN is required');
  }

  const body = typeof data === 'string' ? data : JSON.stringify(data);

  const response = await fetch(NFT_STORAGE_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`NFT.Storage upload failed: ${text}`);
  }

  const result = await response.json();
  const cid = result?.value?.cid || result?.cid;
  if (!cid) {
    throw new Error('NFT.Storage response missing cid');
  }

  return {
    hash: cid,
    url: `${IPFS_GATEWAY}/ipfs/${cid}`,
  };
}

/**
 * Pin resume to IPFS (persistent storage)
 */
export async function pinResumeToIPFS(resumeData: ResumeData): Promise<string> {
  try {
    const ipfs = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
    });

    const file = {
      path: `resume-${resumeData.address}.json`,
      content: JSON.stringify(resumeData),
    };

    const result = await ipfs.add(file, {
      pin: true,
      progress: (prog) => console.log(`Progress: ${prog}`),
    });

    return result.path;
  } catch (error) {
    console.error('Error pinning to IPFS:', error);
    throw error;
  }
}

/**
 * Check pin status from Pinata
 */
export async function checkPinStatus(hash: string): Promise<{ pinned: boolean; status: string }> {
  const apiKey = process.env.PINATA_API_KEY || '';
  const secretKey = process.env.PINATA_SECRET_KEY || '';
  if (!apiKey || !secretKey) {
    throw new Error('Pinata API keys are required');
  }

  const url = `${PINATA_BASE_URL}/data/pinList?hashContains=${hash}`;
  const response = await fetch(url, {
    headers: {
      'pinata_api_key': apiKey,
      'pinata_secret_api_key': secretKey,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to check pin status: ${text}`);
  }

  const result = await response.json();
  const rows = result?.rows || [];
  const matched = rows.find((row: any) => row.ipfs_pin_hash === hash);
  const status = matched?.ipfs_pin_status || 'not_pinned';
  return { pinned: status === 'pinned', status };
}

/**
 * Unpin content from Pinata
 */
export async function unpinFromPinata(hash: string): Promise<boolean> {
  const apiKey = process.env.PINATA_API_KEY || '';
  const secretKey = process.env.PINATA_SECRET_KEY || '';
  if (!apiKey || !secretKey) {
    throw new Error('Pinata API keys are required');
  }

  const response = await fetch(`${PINATA_BASE_URL}/pinning/unpin/${hash}`, {
    method: 'DELETE',
    headers: {
      'pinata_api_key': apiKey,
      'pinata_secret_api_key': secretKey,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Unpin failed:', text);
    return false;
  }

  return true;
}

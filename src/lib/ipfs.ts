import { create } from 'ipfs-http-client';
import axios from 'axios';

const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud';
const PINATA_API_KEY = process.env.PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY || '';
const PINATA_JWT = process.env.PINATA_JWT || '';

// Pinata API endpoints
const PINATA_PIN_JSON_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
const PINATA_PIN_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
const PINATA_UNPIN_URL = 'https://api.pinata.cloud/pinning/unpin';
const PINATA_PIN_LIST_URL = 'https://api.pinata.cloud/data/pinList';

interface IPFSUploadResult {
  path: string;
  cid: string;
  size: number;
  pinned: boolean;
  gateway: string;
}

interface PinataUploadResult {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
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
 * Upload resume data to IPFS with Pinata pinning
 * Uses Pinata for reliable persistent storage
 */
export async function uploadResumeToIPFS(resumeData: ResumeData): Promise<IPFSUploadResult> {
  try {
    // Validate Pinata credentials
    if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_SECRET_KEY)) {
      throw new Error('Pinata credentials not configured');
    }

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
    }

    // Prepare metadata
    const metadata = {
      name: `resume-${resumeData.address}-${Date.now()}.json`,
      keyvalues: {
        address: resumeData.address,
        timestamp: resumeData.timestamp.toString(),
        type: 'resume',
      },
    };

    // Upload to Pinata
    const response = await axios.post(
      PINATA_PIN_JSON_URL,
      {
        pinataContent: resumeData,
        pinataMetadata: metadata,
        pinataOptions: {
          cidVersion: 1,
        },
      },
      { headers }
    );

    const result: PinataUploadResult = response.data;

    return {
      path: result.IpfsHash,
      cid: result.IpfsHash,
      size: result.PinSize,
      pinned: true,
      gateway: `${IPFS_GATEWAY}/ipfs/${result.IpfsHash}`,
    };
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error(`Failed to upload to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch resume data from IPFS
 * Tries multiple gateways for reliability
 */
export async function fetchResumeFromIPFS(ipfsHash: string): Promise<ResumeData | null> {
  const gateways = [
    `${IPFS_GATEWAY}/ipfs/${ipfsHash}`,
    `https://ipfs.io/ipfs/${ipfsHash}`,
    `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
    `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
  ];

  // Try each gateway until one succeeds
  for (const gateway of gateways) {
    try {
      const response = await fetch(gateway, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.warn(`Failed to fetch from gateway ${gateway}:`, error);
      continue;
    }
  }

  console.error('All gateways failed for IPFS hash:', ipfsHash);
  return null;
}

/**
 * Get IPFS gateway URL for a hash
 */
export function getIPFSGatewayUrl(ipfsHash: string): string {
  return `${IPFS_GATEWAY}/ipfs/${ipfsHash}`;
}

/**
 * Upload any JSON data to IPFS via Pinata
 */
export async function uploadJSONToIPFS(
  data: any,
  metadata?: { name?: string; keyvalues?: Record<string, string> }
): Promise<IPFSUploadResult> {
  try {
    if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_SECRET_KEY)) {
      throw new Error('Pinata credentials not configured');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
    }

    const pinataMetadata = {
      name: metadata?.name || `data-${Date.now()}.json`,
      keyvalues: metadata?.keyvalues || {},
    };

    const response = await axios.post(
      PINATA_PIN_JSON_URL,
      {
        pinataContent: data,
        pinataMetadata,
        pinataOptions: {
          cidVersion: 1,
        },
      },
      { headers }
    );

    const result: PinataUploadResult = response.data;

    return {
      path: result.IpfsHash,
      cid: result.IpfsHash,
      size: result.PinSize,
      pinned: true,
      gateway: `${IPFS_GATEWAY}/ipfs/${result.IpfsHash}`,
    };
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw new Error(`Failed to upload to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Unpin content from Pinata (remove from persistent storage)
 */
export async function unpinFromIPFS(ipfsHash: string): Promise<boolean> {
  try {
    if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_SECRET_KEY)) {
      throw new Error('Pinata credentials not configured');
    }

    const headers: Record<string, string> = {};

    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
    }

    await axios.delete(`${PINATA_UNPIN_URL}/${ipfsHash}`, { headers });
    return true;
  } catch (error) {
    console.error('Error unpinning from IPFS:', error);
    return false;
  }
}

/**
 * Check if content is pinned on Pinata
 */
export async function isPinned(ipfsHash: string): Promise<boolean> {
  try {
    if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_SECRET_KEY)) {
      return false;
    }

    const headers: Record<string, string> = {};

    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
    }

    const response = await axios.get(PINATA_PIN_LIST_URL, {
      headers,
      params: {
        hashContains: ipfsHash,
        status: 'pinned',
      },
    });

    return response.data.count > 0;
  } catch (error) {
    console.error('Error checking pin status:', error);
    return false;
  }
}

/**
 * Get list of pinned content for an address
 */
export async function getPinnedContent(address: string): Promise<string[]> {
  try {
    if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_SECRET_KEY)) {
      return [];
    }

    const headers: Record<string, string> = {};

    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
    }

    const response = await axios.get(PINATA_PIN_LIST_URL, {
      headers,
      params: {
        status: 'pinned',
        metadata: {
          keyvalues: {
            address: {
              value: address,
              op: 'eq',
            },
          },
        },
      },
    });

    return response.data.rows.map((row: any) => row.ipfs_pin_hash);
  } catch (error) {
    console.error('Error fetching pinned content:', error);
    return [];
  }
}

/**
 * Validate resume data structure
 */
export function validateResumeData(data: any): data is ResumeData {
  return (
    typeof data === 'object' &&
    typeof data.address === 'string' &&
    typeof data.name === 'string' &&
    typeof data.bio === 'string' &&
    Array.isArray(data.skills) &&
    Array.isArray(data.experience) &&
    Array.isArray(data.education) &&
    Array.isArray(data.projects) &&
    typeof data.timestamp === 'number'
  );
}

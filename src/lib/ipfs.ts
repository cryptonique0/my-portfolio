import { create } from 'ipfs-http-client';

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

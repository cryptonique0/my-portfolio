import axios from 'axios';

const TALENT_PROTOCOL_API = 'https://api.talentprotocol.com';
const API_KEY = process.env.NEXT_PUBLIC_TALENT_PROTOCOL_API;

interface TalentProfile {
  id: string;
  handle: string;
  name: string;
  bio: string;
  avatar: string;
  achievements: Achievement[];
  credentials: Credential[];
  reputation: ReputationData;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  verified: boolean;
}

interface Credential {
  id: string;
  issuer: string;
  title: string;
  issuedDate: string;
  expiryDate?: string;
  proofUrl: string;
}

interface ReputationData {
  score: number;
  tier: string;
  endorsements: number;
}

/**
 * Fetch user profile from Talent Protocol
 */
export async function getTalentProfile(handle: string): Promise<TalentProfile | null> {
  try {
    const response = await axios.get(
      `${TALENT_PROTOCOL_API}/v1/users/${handle}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.user;
  } catch (error) {
    console.error('Error fetching Talent Protocol profile:', error);
    return null;
  }
}

/**
 * Fetch achievements for a user
 */
export async function getUserAchievements(handle: string): Promise<Achievement[]> {
  try {
    const response = await axios.get(
      `${TALENT_PROTOCOL_API}/v1/users/${handle}/achievements`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    return response.data.achievements || [];
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
}

/**
 * Fetch credentials for a user
 */
export async function getUserCredentials(handle: string): Promise<Credential[]> {
  try {
    const response = await axios.get(
      `${TALENT_PROTOCOL_API}/v1/users/${handle}/credentials`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    return response.data.credentials || [];
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return [];
  }
}

/**
 * Get reputation score for a user
 */
export async function getUserReputation(handle: string): Promise<ReputationData | null> {
  try {
    const response = await axios.get(
      `${TALENT_PROTOCOL_API}/v1/users/${handle}/reputation`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    return response.data.reputation;
  } catch (error) {
    console.error('Error fetching reputation:', error);
    return null;
  }
}

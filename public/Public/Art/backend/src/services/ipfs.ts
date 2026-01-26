import axios from 'axios';

interface PinataConfig {
  jwt: string;
  gateway: string;
}

class IpfsService {
  private jwt: string;
  private gateway: string;
  private apiUrl = 'https://api.pinata.cloud';

  constructor(config: PinataConfig) {
    this.jwt = config.jwt;
    this.gateway = config.gateway;
  }

  /**
   * Upload file to IPFS via Pinata
   * @param file - File buffer
   * @param filename - Original filename
   * @returns IPFS hash (CID)
   */
  async uploadFile(file: Buffer, filename: string): Promise<string> {
    try {
      const formData = new FormData();
      const blob = new Blob([file], { type: 'application/octet-stream' });
      formData.append('file', blob, filename);

      const response = await axios.post(
        `${this.apiUrl}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${this.jwt}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data.IpfsHash;
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  /**
   * Upload JSON metadata to IPFS
   * @param metadata - JSON object
   * @returns IPFS hash (CID)
   */
  async uploadMetadata(metadata: Record<string, any>): Promise<string> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/pinning/pinJSONToIPFS`,
        metadata,
        {
          headers: {
            Authorization: `Bearer ${this.jwt}`
          }
        }
      );

      return response.data.IpfsHash;
    } catch (error) {
      console.error('IPFS metadata upload error:', error);
      throw new Error('Failed to upload metadata to IPFS');
    }
  }

  /**
   * Get IPFS gateway URL for a hash
   * @param hash - IPFS hash
   * @returns Gateway URL
   */
  getGatewayUrl(hash: string): string {
    return `${this.gateway}/ipfs/${hash}`;
  }

  /**
   * Pin existing hash to ensure persistence
   * @param hash - IPFS hash to pin
   */
  async pinHash(hash: string): Promise<boolean> {
    try {
      await axios.post(
        `${this.apiUrl}/pinning/pinByHash`,
        { hashesToPin: [hash] },
        {
          headers: {
            Authorization: `Bearer ${this.jwt}`
          }
        }
      );
      return true;
    } catch (error) {
      console.error('IPFS pin error:', error);
      return false;
    }
  }

  /**
   * Calculate SHA-256 hash of file content
   * @param buffer - File buffer
   * @returns Hex string hash
   */
  async calculateFileHash(buffer: Buffer): Promise<string> {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
}

// Initialize IPFS service with typed config
import { getConfig } from '../config/env';

const config = getConfig();
const ipfsService = new IpfsService({
  jwt: config.ipfs.jwt,
  gateway: config.ipfs.gateway
});

export default ipfsService;

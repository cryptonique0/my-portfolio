import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/vaults/[address]/guardian-activity/route';
import { NextRequest } from 'next/server';

describe('Guardian Activity API', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    mockRequest = new NextRequest('http://localhost:3000/api/vaults/0x123/guardian-activity', {
      method: 'GET'
    });
  });

  describe('GET /api/vaults/[address]/guardian-activity', () => {
    it('should return success status', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(response.status).toBe(200);
    });

    it('should include vault address in response', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      expect(data.vault).toBe('0x123');
    });

    it('should include timestamp', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      expect(typeof data.timestamp).toBe('number');
      expect(data.timestamp).toBeGreaterThan(0);
    });

    it('should return metrics object with required fields', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      expect(data.metrics).toBeDefined();
      expect(data.metrics.participation).toBeDefined();
      expect(data.metrics.freezeVoting).toBeDefined();
      expect(data.metrics.reliability).toBeDefined();
      expect(data.metrics.recentActivity).toBeDefined();
    });

    it('should include participation metrics', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      const { participation } = data.metrics;
      expect(participation.approvalCount).toBeGreaterThanOrEqual(0);
      expect(participation.rejectionCount).toBeGreaterThanOrEqual(0);
      expect(participation.participationRate).toBeGreaterThanOrEqual(0);
      expect(participation.participationRate).toBeLessThanOrEqual(1);
      expect(participation.averageApprovalTime).toBeGreaterThanOrEqual(0);
    });

    it('should include freeze voting metrics', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      const { freezeVoting } = data.metrics;
      expect(freezeVoting.freezeVotesInMonth).toBeGreaterThanOrEqual(0);
      expect(freezeVoting.unfreezeVotesInMonth).toBeGreaterThanOrEqual(0);
    });

    it('should include reliability/trust score', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      const { reliability } = data.metrics;
      expect(typeof reliability.trustScore).toBe('number');
      expect(reliability.trustScore).toBeGreaterThanOrEqual(0);
      expect(reliability.trustScore).toBeLessThanOrEqual(100);
    });

    it('should include recent activity array', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      const { recentActivity } = data.metrics;
      expect(Array.isArray(recentActivity)).toBe(true);
    });

    it('should handle invalid vault address gracefully', async () => {
      const invalidRequest = new NextRequest('http://localhost:3000/api/vaults/invalid/guardian-activity', {
        method: 'GET'
      });

      const response = await GET(invalidRequest, { params: { address: 'invalid' } } as any);
      
      // Should either return error or graceful response
      expect([200, 400, 404]).toContain(response.status);
    });

    it('should support guardian-specific queries', async () => {
      const urlWithQuery = new NextRequest(
        'http://localhost:3000/api/vaults/0x123/guardian-activity?guardian=0x456',
        { method: 'GET' }
      );

      const response = await GET(urlWithQuery, { params: { address: '0x123' } } as any);
      expect(response.status).toBe(200);
    });
  });

  describe('Data validation', () => {
    it('should return realistic participation rates', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      const rate = data.metrics.participation.participationRate;
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(1);
    });

    it('should return reasonable trust scores', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      const score = data.metrics.reliability.trustScore;
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return activity objects with valid structure', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      const activities = data.metrics.recentActivity;
      activities.forEach((activity: any) => {
        expect(['approve', 'reject', 'freeze', 'unfreeze', 'badge_earned']).toContain(activity.type);
        expect(typeof activity.timestamp).toBe('number');
        expect(typeof activity.details).toBe('string');
      });
    });
  });
});

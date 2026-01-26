import { describe, it, expect, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/vaults/[address]/risk-score/route';
import { NextRequest } from 'next/server';

describe('Risk Score API', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    mockRequest = new NextRequest('http://localhost:3000/api/vaults/0x123/risk-score', {
      method: 'GET'
    });
  });

  describe('GET /api/vaults/[address]/risk-score', () => {
    it('should return success status', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(response.status).toBe(200);
    });

    it('should include vault address', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      expect(data.riskScore.vault).toBe('0x123');
    });

    it('should include overall score between 0-100', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      const score = data.riskScore.overallScore;
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should include valid risk level', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      const level = data.riskScore.riskLevel;
      expect(['safe', 'normal', 'caution', 'critical']).toContain(level);
    });

    it('should include all 6 risk factors', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      const { factors } = data.riskScore;
      expect(factors.withdrawalVelocity).toBeDefined();
      expect(factors.patternDeviation).toBeDefined();
      expect(factors.guardianConsensus).toBeDefined();
      expect(factors.spendingHeadroom).toBeDefined();
      expect(factors.timeLockUtilization).toBeDefined();
      expect(factors.approvalPatterns).toBeDefined();
    });

    it('should include alerts array', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      const { alerts } = data.riskScore;
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('should include recommendations array', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      const { recommendations } = data.riskScore;
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should validate withdrawal velocity factor', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      const factor = data.riskScore.factors.withdrawalVelocity;
      expect(typeof factor.score).toBe('number');
      expect(factor.score).toBeGreaterThanOrEqual(0);
      expect(factor.score).toBeLessThanOrEqual(100);
      expect(['safe', 'caution', 'warning']).toContain(factor.status);
    });

    it('should validate pattern deviation factor', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      const factor = data.riskScore.factors.patternDeviation;
      expect(typeof factor.score).toBe('number');
      expect(typeof factor.timeOfDayAnomaly).toBe('boolean');
      expect(typeof factor.frequencyAnomaly).toBe('boolean');
      expect(typeof factor.amountAnomaly).toBe('boolean');
    });

    it('should validate guardian consensus factor', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      const factor = data.riskScore.factors.guardianConsensus;
      expect(typeof factor.consensusRate).toBe('number');
      expect(factor.consensusRate).toBeGreaterThanOrEqual(0);
      expect(factor.consensusRate).toBeLessThanOrEqual(1);
      expect(typeof factor.dissenting).toBe('number');
    });

    it('should validate spending headroom factor', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      const factor = data.riskScore.factors.spendingHeadroom;
      expect(typeof factor.dailyUtilization).toBe('number');
      expect(typeof factor.weeklyUtilization).toBe('number');
      expect(typeof factor.monthlyUtilization).toBe('number');
      expect(Array.isArray(factor.tokensNearLimit)).toBe(true);
    });

    it('should validate time-lock utilization factor', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      const factor = data.riskScore.factors.timeLockUtilization;
      expect(typeof factor.queuedWithdrawals).toBe('number');
      expect(typeof factor.frozenWithdrawals).toBe('number');
      expect(typeof factor.emergencyFreezesInMonth).toBe('number');
    });

    it('should validate alert structure', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      data.riskScore.alerts.forEach((alert: any) => {
        expect(['info', 'warning', 'critical']).toContain(alert.severity);
        expect(typeof alert.message).toBe('string');
        expect(typeof alert.description).toBe('string');
        expect(typeof alert.recommendation).toBe('string');
        expect(typeof alert.id).toBe('string');
      });
    });
  });

  describe('POST /api/vaults/[address]/risk-score/acknowledge-alert', () => {
    it('should acknowledge alert successfully', async () => {
      const postRequest = new NextRequest('http://localhost:3000/api/vaults/0x123/risk-score', {
        method: 'POST',
        body: JSON.stringify({ alertId: 'test-alert-id' })
      });

      const response = await POST(postRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      expect([200, 201]).toContain(response.status);
      expect(typeof data).toBe('object');
    });

    it('should validate alert ID format', async () => {
      const postRequest = new NextRequest('http://localhost:3000/api/vaults/0x123/risk-score', {
        method: 'POST',
        body: JSON.stringify({ alertId: '' })
      });

      const response = await POST(postRequest, { params: { address: '0x123' } } as any);
      
      // Should either reject or handle gracefully
      expect([200, 201, 400]).toContain(response.status);
    });

    it('should handle missing alertId', async () => {
      const postRequest = new NextRequest('http://localhost:3000/api/vaults/0x123/risk-score', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await POST(postRequest, { params: { address: '0x123' } } as any);
      
      expect([200, 201, 400]).toContain(response.status);
    });
  });

  describe('Risk score logic', () => {
    it('safe risk level should have low scores', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      if (data.riskScore.riskLevel === 'safe') {
        expect(data.riskScore.overallScore).toBeLessThan(25);
      }
    });

    it('critical risk level should have high scores', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      if (data.riskScore.riskLevel === 'critical') {
        expect(data.riskScore.overallScore).toBeGreaterThan(75);
      }
    });

    it('overall score should reflect factor scores', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      const { factors, overallScore } = data.riskScore;
      const scores = [
        factors.withdrawalVelocity.score,
        factors.patternDeviation.score,
        factors.guardianConsensus.score,
        factors.spendingHeadroom.score,
        factors.timeLockUtilization.score,
        factors.approvalPatterns.score
      ];

      // Overall should be within reasonable range of average
      const average = scores.reduce((a, b) => a + b, 0) / scores.length;
      const maxDeviation = 20; // Allow 20 point deviation

      expect(Math.abs(overallScore - average)).toBeLessThan(maxDeviation);
    });

    it('should generate alerts for high risk factors', async () => {
      const response = await GET(mockRequest, { params: { address: '0x123' } } as any);
      const data = await response.json();

      const hasHighRiskFactor = Object.values(data.riskScore.factors).some(
        (factor: any) => factor.score > 70
      );

      if (hasHighRiskFactor) {
        expect(data.riskScore.alerts.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle vault with no activity', async () => {
      const response = await GET(mockRequest, { params: { address: '0x999' } } as any);
      expect([200, 404]).toContain(response.status);
    });

    it('should handle invalid vault address gracefully', async () => {
      const invalidRequest = new NextRequest('http://localhost:3000/api/vaults/invalid/risk-score', {
        method: 'GET'
      });

      const response = await GET(invalidRequest, { params: { address: 'invalid' } } as any);
      expect([200, 400, 404]).toContain(response.status);
    });
  });
});

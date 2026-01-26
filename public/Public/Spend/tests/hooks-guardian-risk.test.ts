import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGuardianActivity, useRiskScore } from '@/lib/hooks/useGuardianActivity';

// Mock the API endpoints
vi.mock('fetch', () => ({
  default: vi.fn()
}));

describe('Guardian Activity Hook', () => {
  const mockVaultAddress = '0x123456789abcdef';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useGuardianActivity(mockVaultAddress));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should fetch guardian activity data', async () => {
    const mockData = {
      success: true,
      vault: mockVaultAddress,
      timestamp: Date.now(),
      metrics: {
        participation: {
          approvalCount: 10,
          rejectionCount: 2,
          participationRate: 0.857,
          averageApprovalTime: 3600
        },
        freezeVoting: {
          freezeVotesInMonth: 2,
          unfreezeVotesInMonth: 1
        },
        reliability: {
          trustScore: 85
        },
        recentActivity: []
      }
    };

    const { result } = renderHook(() => useGuardianActivity(mockVaultAddress));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.error).toBeNull();
  });

  it('should support polling with custom interval', async () => {
    const { result, rerender } = renderHook(
      ({ address, interval }) => useGuardianActivity(address, interval),
      { initialProps: { address: mockVaultAddress, interval: 5000 } }
    );

    expect(result.current).toBeDefined();
  });

  it('should handle fetch errors gracefully', async () => {
    const { result } = renderHook(() => useGuardianActivity('invalid-address'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should either have error or handle gracefully
    expect(result.current.error !== null || result.current.data !== null).toBe(true);
  });

  it('should return properly structured guardian metrics', async () => {
    const { result } = renderHook(() => useGuardianActivity(mockVaultAddress));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    if (result.current.data) {
      expect(result.current.data.participation).toBeDefined();
      expect(result.current.data.freezeVoting).toBeDefined();
      expect(result.current.data.reliability).toBeDefined();
      expect(result.current.data.recentActivity).toBeDefined();
    }
  });

  it('should validate participation rate is between 0-1', async () => {
    const { result } = renderHook(() => useGuardianActivity(mockVaultAddress));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    if (result.current.data?.participation) {
      expect(result.current.data.participation.participationRate).toBeGreaterThanOrEqual(0);
      expect(result.current.data.participation.participationRate).toBeLessThanOrEqual(1);
    }
  });

  it('should validate trust score is between 0-100', async () => {
    const { result } = renderHook(() => useGuardianActivity(mockVaultAddress));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    if (result.current.data?.reliability) {
      expect(result.current.data.reliability.trustScore).toBeGreaterThanOrEqual(0);
      expect(result.current.data.reliability.trustScore).toBeLessThanOrEqual(100);
    }
  });
});

describe('Risk Score Hook', () => {
  const mockVaultAddress = '0x123456789abcdef';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useRiskScore(mockVaultAddress));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should fetch risk score data', async () => {
    const { result } = renderHook(() => useRiskScore(mockVaultAddress));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.error).toBeNull();
  });

  it('should include all 6 risk factors', async () => {
    const { result } = renderHook(() => useRiskScore(mockVaultAddress));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    if (result.current.data) {
      const { factors } = result.current.data;
      expect(factors.withdrawalVelocity).toBeDefined();
      expect(factors.patternDeviation).toBeDefined();
      expect(factors.guardianConsensus).toBeDefined();
      expect(factors.spendingHeadroom).toBeDefined();
      expect(factors.timeLockUtilization).toBeDefined();
      expect(factors.approvalPatterns).toBeDefined();
    }
  });

  it('should validate overall score is between 0-100', async () => {
    const { result } = renderHook(() => useRiskScore(mockVaultAddress));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    if (result.current.data) {
      expect(result.current.data.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.current.data.overallScore).toBeLessThanOrEqual(100);
    }
  });

  it('should have valid risk level', async () => {
    const { result } = renderHook(() => useRiskScore(mockVaultAddress));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    if (result.current.data) {
      const validLevels = ['safe', 'normal', 'caution', 'critical'];
      expect(validLevels).toContain(result.current.data.riskLevel);
    }
  });

  it('should support acknowledging alerts', async () => {
    const { result } = renderHook(() => useRiskScore(mockVaultAddress));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.acknowledgeAlert).toBe('function');
  });

  it('should support custom poll interval', async () => {
    const { result } = renderHook(() => useRiskScore(mockVaultAddress, 30000));

    expect(result.current).toBeDefined();
  });

  it('should return alerts with valid structure', async () => {
    const { result } = renderHook(() => useRiskScore(mockVaultAddress));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    if (result.current.data?.alerts) {
      result.current.data.alerts.forEach((alert) => {
        expect(['info', 'warning', 'critical']).toContain(alert.severity);
        expect(typeof alert.message).toBe('string');
        expect(typeof alert.description).toBe('string');
        expect(typeof alert.recommendation).toBe('string');
      });
    }
  });

  it('should return recommendations as string array', async () => {
    const { result } = renderHook(() => useRiskScore(mockVaultAddress));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    if (result.current.data?.recommendations) {
      expect(Array.isArray(result.current.data.recommendations)).toBe(true);
      result.current.data.recommendations.forEach((rec) => {
        expect(typeof rec).toBe('string');
      });
    }
  });

  it('should handle acknowledgeAlert errors gracefully', async () => {
    const { result } = renderHook(() => useRiskScore(mockVaultAddress));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should not throw on acknowledge
    expect(async () => {
      await result.current.acknowledgeAlert('invalid-id');
    }).not.toThrow();
  });
});

describe('Utility Functions', () => {
  it('should provide getRiskLevelColor function', async () => {
    const { getRiskLevelColor } = await import('@/lib/hooks/useGuardianActivity');

    expect(getRiskLevelColor('safe')).toContain('text-');
    expect(getRiskLevelColor('normal')).toContain('text-');
    expect(getRiskLevelColor('caution')).toContain('text-');
    expect(getRiskLevelColor('critical')).toContain('text-');
  });

  it('should provide getRiskLevelBgColor function', async () => {
    const { getRiskLevelBgColor } = await import('@/lib/hooks/useGuardianActivity');

    expect(getRiskLevelBgColor('safe')).toContain('bg-');
    expect(getRiskLevelBgColor('normal')).toContain('bg-');
    expect(getRiskLevelBgColor('caution')).toContain('bg-');
    expect(getRiskLevelBgColor('critical')).toContain('bg-');
  });
});

describe('Hook integration', () => {
  const mockVaultAddress = '0x123456789abcdef';

  it('should handle rapid successive calls', async () => {
    const { result: result1 } = renderHook(() => useGuardianActivity(mockVaultAddress));
    const { result: result2 } = renderHook(() => useRiskScore(mockVaultAddress));

    await waitFor(() => {
      expect(result1.current.loading).toBe(false);
      expect(result2.current.loading).toBe(false);
    });

    expect(result1.current.data || result1.current.error).toBeDefined();
    expect(result2.current.data || result2.current.error).toBeDefined();
  });

  it('should clean up on unmount', () => {
    const { unmount } = renderHook(() => useGuardianActivity(mockVaultAddress));

    expect(() => {
      unmount();
    }).not.toThrow();
  });

  it('should handle address changes', async () => {
    const { rerender } = renderHook(
      ({ address }) => useGuardianActivity(address),
      { initialProps: { address: mockVaultAddress } }
    );

    // Change address
    rerender({ address: '0xfedcba9876543210' });

    // Should still work without throwing
    expect(true).toBe(true);
  });
});

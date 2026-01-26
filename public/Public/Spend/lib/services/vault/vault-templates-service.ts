/**
 * Vault Templates Service
 * Pre-built vault configurations and templates for quick deployment
 */

export interface VaultTemplate {
  id: string;
  name: string;
  description: string;
  category: 'personal' | 'family' | 'business' | 'nonprofit' | 'dao' | 'custom';
  icon: string;
  color: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedSetupTime: number; // minutes
  guardians: {
    requiredCount: number;
    recommended: string[];
  };
  threshold: {
    approval: number;
    emergency: number;
  };
  features: string[];
  limits: {
    maxDaily?: number;
    maxTransaction?: number;
    maxGuardians?: number;
  };
  riskLevel: 'low' | 'medium' | 'high';
  useCase: string;
  exampleScenarios: string[];
  metadata: Record<string, any>;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface VaultTemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  templateCount: number;
}

export class VaultTemplatesService {
  /**
   * Get all available vault templates
   */
  static getAllTemplates(): VaultTemplate[] {
    return [
      {
        id: 'personal-safe',
        name: 'Personal Safe',
        description: 'Perfect for individuals managing their own digital assets',
        category: 'personal',
        icon: '👤',
        color: 'blue',
        difficulty: 'beginner',
        estimatedSetupTime: 10,
        guardians: {
          requiredCount: 1,
          recommended: ['spouse', 'trusted_friend', 'family_member'],
        },
        threshold: {
          approval: 1,
          emergency: 1,
        },
        features: [
          'Basic withdrawal limits',
          'Daily spending cap',
          'Emergency access',
          'Activity logging',
        ],
        limits: {
          maxDaily: 10000,
          maxTransaction: 5000,
        },
        riskLevel: 'low',
        useCase: 'Solo asset management with basic safeguards',
        exampleScenarios: [
          'Secure personal crypto savings',
          'Daily spending allowance management',
          'Emergency backup access',
        ],
        metadata: {
          tier: 'starter',
          complexity: 1,
        },
        tags: ['solo', 'beginner', 'daily-limits'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'family-vault',
        name: 'Family Vault',
        description: 'Shared vault for family members with multi-signature protection',
        category: 'family',
        icon: '👨‍👩‍👧‍👦',
        color: 'purple',
        difficulty: 'intermediate',
        estimatedSetupTime: 25,
        guardians: {
          requiredCount: 3,
          recommended: ['spouse', 'adult_child', 'trusted_advisor'],
        },
        threshold: {
          approval: 2,
          emergency: 1,
        },
        features: [
          'Multi-signature approval',
          'Role-based access',
          'Joint ownership',
          'Inheritance protection',
          'Activity audit trail',
          'Monthly reconciliation',
        ],
        limits: {
          maxDaily: 50000,
          maxTransaction: 25000,
          maxGuardians: 5,
        },
        riskLevel: 'low',
        useCase: 'Family asset management with shared responsibility',
        exampleScenarios: [
          'Joint family savings account',
          'Heritage asset preservation',
          'Education fund management',
        ],
        metadata: {
          tier: 'family',
          complexity: 2,
          minApprovers: 2,
        },
        tags: ['family', 'multi-sig', 'inheritance'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'business-standard',
        name: 'Business Standard',
        description: 'Standard business vault with expense controls and reporting',
        category: 'business',
        icon: '💼',
        color: 'green',
        difficulty: 'intermediate',
        estimatedSetupTime: 30,
        guardians: {
          requiredCount: 3,
          recommended: ['cfo', 'treasurer', 'cto', 'legal_counsel'],
        },
        threshold: {
          approval: 2,
          emergency: 1,
        },
        features: [
          'Multi-level approval workflow',
          'Expense categorization',
          'Budget tracking',
          'Comprehensive audit logs',
          'Tax report generation',
          'Team access controls',
        ],
        limits: {
          maxDaily: 100000,
          maxTransaction: 50000,
          maxGuardians: 10,
        },
        riskLevel: 'low',
        useCase: 'Corporate treasury and expense management',
        exampleScenarios: [
          'Company operating fund',
          'Vendor payment management',
          'Employee reimbursement',
          'Payroll processing',
        ],
        metadata: {
          tier: 'business',
          complexity: 3,
          complianceLevel: 'standard',
        },
        tags: ['business', 'compliance', 'multi-sig', 'reporting'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'business-enterprise',
        name: 'Business Enterprise',
        description: 'Enterprise-grade vault with advanced compliance and security',
        category: 'business',
        icon: '🏢',
        color: 'indigo',
        difficulty: 'advanced',
        estimatedSetupTime: 60,
        guardians: {
          requiredCount: 5,
          recommended: ['cfo', 'treasurer', 'cto', 'legal_counsel', 'compliance_officer'],
        },
        threshold: {
          approval: 3,
          emergency: 2,
        },
        features: [
          'Advanced multi-level approval',
          'Full audit trail with blockchain verification',
          'SOX/HIPAA compliance reporting',
          'Real-time monitoring',
          'Scheduled transaction automation',
          'Multi-currency support',
          'Advanced analytics',
          'Regulatory compliance dashboard',
        ],
        limits: {
          maxDaily: 1000000,
          maxTransaction: 500000,
          maxGuardians: 20,
        },
        riskLevel: 'low',
        useCase: 'Large-scale corporate treasury with strict compliance',
        exampleScenarios: [
          'Institutional treasury management',
          'Multi-subsidiary fund distribution',
          'Compliance-heavy operations',
          'Regulatory reporting',
        ],
        metadata: {
          tier: 'enterprise',
          complexity: 5,
          complianceLevel: 'enterprise',
          sla: '99.9%',
        },
        tags: ['enterprise', 'compliance', 'sox', 'hipaa', 'regulated'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'nonprofit-standard',
        name: 'Nonprofit Standard',
        description: 'Nonprofit vault with donation tracking and charitable giving controls',
        category: 'nonprofit',
        icon: '❤️',
        color: 'red',
        difficulty: 'intermediate',
        estimatedSetupTime: 25,
        guardians: {
          requiredCount: 3,
          recommended: ['executive_director', 'treasurer', 'board_member', 'legal_counsel'],
        },
        threshold: {
          approval: 2,
          emergency: 1,
        },
        features: [
          'Donation tracking',
          'Program funding allocation',
          'Grant management',
          'Donor reporting',
          '990-N compliance support',
          'Tax documentation',
          'Impact tracking',
        ],
        limits: {
          maxDaily: 250000,
          maxTransaction: 100000,
          maxGuardians: 8,
        },
        riskLevel: 'low',
        useCase: 'Nonprofit organization fund management',
        exampleScenarios: [
          'Charitable donation management',
          'Program funding allocation',
          'Grant fund disbursement',
          'Donor relations',
        ],
        metadata: {
          tier: 'nonprofit',
          complexity: 3,
          complianceLevel: 'nonprofit',
        },
        tags: ['nonprofit', 'charitable', 'tax-exempt', 'grants'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'dao-governance',
        name: 'DAO Governance',
        description: 'Decentralized autonomous organization with community voting',
        category: 'dao',
        icon: '🏛️',
        color: 'yellow',
        difficulty: 'advanced',
        estimatedSetupTime: 45,
        guardians: {
          requiredCount: 7,
          recommended: [
            'founding_member',
            'treasury_lead',
            'technical_lead',
            'community_manager',
            'operations',
          ],
        },
        threshold: {
          approval: 5,
          emergency: 3,
        },
        features: [
          'Community voting integration',
          'Treasury management',
          'Proposal tracking',
          'Token holder governance',
          'Timelock functionality',
          'Multi-chain support',
          'Delegation system',
        ],
        limits: {
          maxDaily: 5000000,
          maxTransaction: 1000000,
          maxGuardians: 50,
        },
        riskLevel: 'medium',
        useCase: 'Decentralized community fund management',
        exampleScenarios: [
          'Community treasury',
          'Governance fund',
          'Development grants',
          'Community grants DAO',
        ],
        metadata: {
          tier: 'dao',
          complexity: 5,
          decentralized: true,
        },
        tags: ['dao', 'governance', 'voting', 'community', 'defi'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'high-security',
        name: 'High Security',
        description: 'Maximum security vault for large-value holdings',
        category: 'custom',
        icon: '🔐',
        color: 'gray',
        difficulty: 'advanced',
        estimatedSetupTime: 90,
        guardians: {
          requiredCount: 7,
          recommended: [
            'primary_owner',
            'legal_advisor',
            'security_expert',
            'family_member',
            'trusted_friend',
          ],
        },
        threshold: {
          approval: 5,
          emergency: 3,
        },
        features: [
          'Maximum approval requirements',
          'Geographic guardian distribution',
          'Biometric verification',
          'Advanced encryption',
          'Cold storage integration',
          'Insurance coordination',
          'Privacy protection',
          'Legal document storage',
        ],
        limits: {
          maxDaily: 0, // Require manual approval
          maxTransaction: 0, // Require manual approval
          maxGuardians: 15,
        },
        riskLevel: 'low',
        useCase: 'Ultra-secure management of large wealth',
        exampleScenarios: [
          'Billionaire asset management',
          'Family office operations',
          'Estate planning',
          'Legacy protection',
        ],
        metadata: {
          tier: 'premium',
          complexity: 5,
          insurance: 'recommended',
        },
        tags: ['security', 'high-net-worth', 'enterprise', 'wealth-management'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'startup-treasury',
        name: 'Startup Treasury',
        description: 'Treasury management vault for early-stage companies and startups',
        category: 'business',
        icon: '🚀',
        color: 'cyan',
        difficulty: 'intermediate',
        estimatedSetupTime: 20,
        guardians: {
          requiredCount: 2,
          recommended: ['founder', 'cfo', 'investor'],
        },
        threshold: {
          approval: 1,
          emergency: 1,
        },
        features: [
          'Fundraising tracking',
          'Runway monitoring',
          'Burn rate analysis',
          'Investor reporting',
          'Budget management',
          'Team expense control',
        ],
        limits: {
          maxDaily: 100000,
          maxTransaction: 50000,
          maxGuardians: 5,
        },
        riskLevel: 'medium',
        useCase: 'Startup funding and treasury management',
        exampleScenarios: [
          'Seed funding management',
          'Series A round fund distribution',
          'Team payroll',
          'Operating expenses',
        ],
        metadata: {
          tier: 'growth',
          complexity: 2,
        },
        tags: ['startup', 'fundraising', 'treasury', 'growth'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'escrow-basic',
        name: 'Escrow Service',
        description: 'Neutral third-party escrow for transactions and agreements',
        category: 'custom',
        icon: '⚖️',
        color: 'slate',
        difficulty: 'intermediate',
        estimatedSetupTime: 35,
        guardians: {
          requiredCount: 3,
          recommended: ['escrow_agent', 'buyer_representative', 'seller_representative'],
        },
        threshold: {
          approval: 2,
          emergency: 1,
        },
        features: [
          'Transaction escrow',
          'Agreement management',
          'Condition verification',
          'Release authorization',
          'Dispute resolution',
          'Documentation storage',
        ],
        limits: {
          maxTransaction: 1000000,
          maxGuardians: 5,
        },
        riskLevel: 'low',
        useCase: 'Neutral party escrow services',
        exampleScenarios: [
          'Real estate transaction escrow',
          'Business acquisition escrow',
          'Licensing deal escrow',
        ],
        metadata: {
          tier: 'service',
          complexity: 3,
          regulated: true,
        },
        tags: ['escrow', 'neutral', 'transaction', 'legal'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];
  }

  /**
   * Get template by ID
   */
  static getTemplate(id: string): VaultTemplate | null {
    return this.getAllTemplates().find((t) => t.id === id) || null;
  }

  /**
   * Get templates by category
   */
  static getTemplatesByCategory(category: VaultTemplate['category']): VaultTemplate[] {
    return this.getAllTemplates().filter((t) => t.category === category);
  }

  /**
   * Get templates by difficulty
   */
  static getTemplatesByDifficulty(difficulty: VaultTemplate['difficulty']): VaultTemplate[] {
    return this.getAllTemplates().filter((t) => t.difficulty === difficulty);
  }

  /**
   * Get template categories
   */
  static getCategories(): VaultTemplateCategory[] {
    const templates = this.getAllTemplates();
    const categories = new Map<string, VaultTemplateCategory>();

    const categoryInfo: Record<string, { name: string; icon: string; color: string }> = {
      personal: { name: 'Personal', icon: '👤', color: 'blue' },
      family: { name: 'Family', icon: '👨‍👩‍👧‍👦', color: 'purple' },
      business: { name: 'Business', icon: '💼', color: 'green' },
      nonprofit: { name: 'Nonprofit', icon: '❤️', color: 'red' },
      dao: { name: 'DAO', icon: '🏛️', color: 'yellow' },
      custom: { name: 'Custom', icon: '⚙️', color: 'gray' },
    };

    Object.entries(categoryInfo).forEach(([catId, info]) => {
      const count = templates.filter((t) => t.category === catId).length;
      if (count > 0) {
        categories.set(catId, {
          id: catId,
          name: info.name,
          description: `${count} template${count > 1 ? 's' : ''}`,
          icon: info.icon,
          color: info.color,
          templateCount: count,
        });
      }
    });

    return Array.from(categories.values());
  }

  /**
   * Search templates by keyword
   */
  static searchTemplates(query: string): VaultTemplate[] {
    const q = query.toLowerCase();
    return this.getAllTemplates().filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.useCase.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        t.features.some((f) => f.toLowerCase().includes(q))
    );
  }

  /**
   * Get recommended templates based on criteria
   */
  static getRecommendations(
    guardianCount: number,
    riskProfile: 'low' | 'medium' | 'high',
    usageType: 'personal' | 'business' | 'community'
  ): VaultTemplate[] {
    const filtered = this.getAllTemplates()
      .filter((t) => {
        // Match risk profile
        if (riskProfile === 'low' && t.riskLevel !== 'low') return false;

        // Match guardian count
        if (guardianCount > 0 && t.guardians.requiredCount > guardianCount + 2) return false;

        // Match usage type
        if (usageType === 'personal' && !['personal', 'family'].includes(t.category)) return false;
        if (usageType === 'business' && !['business'].includes(t.category)) return false;
        if (usageType === 'community' && !['dao', 'nonprofit'].includes(t.category)) return false;

        return true;
      })
      .slice(0, 3);

    return filtered;
  }

  /**
   * Get template setup configuration
   */
  static getTemplateConfig(template: VaultTemplate) {
    return {
      approvers: {
        required: template.threshold.approval,
        total: template.guardians.requiredCount,
      },
      emergencyAccess: {
        required: template.threshold.emergency,
      },
      limits: template.limits,
      features: template.features,
      estimatedSetupMinutes: template.estimatedSetupTime,
    };
  }

  /**
   * Customize template
   */
  static customizeTemplate(
    template: VaultTemplate,
    customizations: Partial<VaultTemplate>
  ): VaultTemplate {
    return {
      ...template,
      ...customizations,
      id: `custom_${Date.now()}`,
      category: 'custom',
      updatedAt: Date.now(),
    };
  }

  /**
   * Validate template configuration
   */
  static validateTemplate(template: VaultTemplate): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (template.guardians.requiredCount < 1) {
      errors.push('At least 1 guardian is required');
    }

    if (template.threshold.approval > template.guardians.requiredCount) {
      errors.push('Approval threshold cannot exceed guardian count');
    }

    if (template.threshold.emergency > template.guardians.requiredCount) {
      errors.push('Emergency threshold cannot exceed guardian count');
    }

    if (!template.name || template.name.trim().length === 0) {
      errors.push('Template name is required');
    }

    if (!template.description || template.description.trim().length === 0) {
      errors.push('Template description is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Export template as JSON
   */
  static exportTemplate(template: VaultTemplate): string {
    return JSON.stringify(template, null, 2);
  }

  /**
   * Import template from JSON
   */
  static importTemplate(json: string): { template: VaultTemplate | null; error: string | null } {
    try {
      const template = JSON.parse(json) as VaultTemplate;
      const validation = this.validateTemplate(template);

      if (!validation.valid) {
        return { template: null, error: validation.errors.join(', ') };
      }

      return { template, error: null };
    } catch (error) {
      return { template: null, error: `Invalid JSON: ${error}` };
    }
  }

  /**
   * Get setup wizard steps for a template
   */
  static getSetupWizardSteps(template: VaultTemplate) {
    const steps = [
      {
        title: 'Review Template',
        description: `${template.name} - ${template.difficulty}`,
        estimatedTime: 5,
      },
      {
        title: 'Configure Guardians',
        description: `Add ${template.guardians.requiredCount} guardians (${template.guardians.recommended.join(', ')})`,
        estimatedTime: 10,
      },
      {
        title: 'Set Thresholds',
        description: `${template.threshold.approval} of ${template.guardians.requiredCount} approval required`,
        estimatedTime: 5,
      },
      {
        title: 'Configure Limits',
        description: template.limits.maxDaily
          ? `Daily limit: ${template.limits.maxDaily}`
          : 'No automatic limits',
        estimatedTime: 5,
      },
      {
        title: 'Review & Deploy',
        description: 'Review configuration and deploy vault',
        estimatedTime: template.estimatedSetupTime - 25,
      },
    ];

    return steps;
  }
}

'use client';

import { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

interface RecoveryPhase {
  id: string;
  phase: number;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  estimatedTime: string;
  actions: string[];
  details: string[];
  expandable: boolean;
}

interface RecoveryStep {
  id: string;
  step: number;
  title: string;
  description: string;
  completed: boolean;
  substeps: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

const RECOVERY_PHASES: RecoveryPhase[] = [
  {
    id: 'phase-1',
    phase: 1,
    title: 'Initiate Recovery',
    description: 'Begin the vault recovery process with initial verification',
    status: 'completed',
    estimatedTime: '5 minutes',
    actions: [
      'Verify email address',
      'Confirm recovery request',
      'Set recovery timeline'
    ],
    details: [
      'Your recovery request has been logged in our system',
      'A confirmation email has been sent to your registered email',
      'Recovery timeline: 7-10 business days for security verification'
    ],
    expandable: true
  },
  {
    id: 'phase-2',
    phase: 2,
    title: 'Identity Verification',
    description: 'Verify your identity through multiple authentication methods',
    status: 'in-progress',
    estimatedTime: '10-15 minutes',
    actions: [
      'Complete 2FA challenge',
      'Answer security questions',
      'Biometric verification'
    ],
    details: [
      'Enter the 6-digit code from your authenticator app',
      'Answer 3 security questions you set up previously',
      'Optional: Use facial recognition or fingerprint'
    ],
    expandable: true
  },
  {
    id: 'phase-3',
    phase: 3,
    title: 'Guardian Approval',
    description: 'Request approval from your designated guardians',
    status: 'pending',
    estimatedTime: '24-48 hours',
    actions: [
      'Send guardian requests',
      'Wait for approvals',
      'Escalate if needed'
    ],
    details: [
      'Notifications sent to 3 guardians (2 approvals required)',
      'Guardians have 48 hours to respond',
      'You can send reminder notifications after 24 hours'
    ],
    expandable: true
  },
  {
    id: 'phase-4',
    phase: 4,
    title: 'Emergency Contact Verification',
    description: 'Verify your emergency contact information',
    status: 'pending',
    estimatedTime: '5-10 minutes',
    actions: [
      'Verify phone number via OTP',
      'Verify backup email',
      'Confirm recovery address'
    ],
    details: [
      'A 6-digit OTP will be sent to your verified phone number',
      'Backup email must be accessible and verified',
      'Confirm your recovery vault address on blockchain'
    ],
    expandable: true
  },
  {
    id: 'phase-5',
    phase: 5,
    title: 'Security Key Recovery',
    description: 'Recover and reset your security keys',
    status: 'pending',
    estimatedTime: '15 minutes',
    actions: [
      'Generate new recovery codes',
      'Set up new security keys',
      'Test vault access'
    ],
    details: [
      'You will receive new recovery codes (store safely offline)',
      'Set up new device-based security keys',
      'Perform test transaction to verify access'
    ],
    expandable: true
  },
  {
    id: 'phase-6',
    phase: 6,
    title: 'Completion',
    description: 'Finalize recovery and restore full access',
    status: 'pending',
    estimatedTime: '2 minutes',
    actions: [
      'Confirm completion',
      'Review recovery summary',
      'Set up new guardian rotation'
    ],
    details: [
      'Your vault access has been fully restored',
      'Download recovery report for your records',
      'Set up future guardian rotations to prevent this'
    ],
    expandable: true
  }
];

const RECOVERY_STEPS: RecoveryStep[] = [
  {
    id: '1',
    step: 1,
    title: 'Submit Recovery Request',
    description: 'Start the vault recovery process',
    completed: true,
    substeps: [
      { id: '1-1', title: 'Create account recovery request', completed: true },
      { id: '1-2', title: 'Receive confirmation email', completed: true },
      { id: '1-3', title: 'Agree to terms and timeline', completed: true }
    ]
  },
  {
    id: '2',
    step: 2,
    title: 'Verify Your Identity',
    description: 'Authenticate with your registered credentials',
    completed: true,
    substeps: [
      { id: '2-1', title: 'Enter 2FA code from authenticator', completed: true },
      { id: '2-2', title: 'Answer security questions', completed: true },
      { id: '2-3', title: 'Complete biometric scan', completed: true }
    ]
  },
  {
    id: '3',
    step: 3,
    title: 'Gather Guardian Approvals',
    description: 'Get approval from your vault guardians',
    completed: false,
    substeps: [
      { id: '3-1', title: 'Send recovery requests to 3 guardians', completed: true },
      { id: '3-2', title: 'Receive approval from Guardian #1', completed: true },
      { id: '3-3', title: 'Waiting for approval from Guardian #2', completed: false },
      { id: '3-4', title: 'Approval from Guardian #3 (pending)', completed: false }
    ]
  },
  {
    id: '4',
    step: 4,
    title: 'Verify Emergency Contact',
    description: 'Confirm your emergency contact details',
    completed: false,
    substeps: [
      { id: '4-1', title: 'Verify phone via OTP', completed: false },
      { id: '4-2', title: 'Verify backup email', completed: false },
      { id: '4-3', title: 'Confirm recovery address', completed: false }
    ]
  },
  {
    id: '5',
    step: 5,
    title: 'Reset Security Keys',
    description: 'Generate new security credentials',
    completed: false,
    substeps: [
      { id: '5-1', title: 'Generate recovery codes', completed: false },
      { id: '5-2', title: 'Set up security keys', completed: false },
      { id: '5-3', title: 'Test vault access', completed: false }
    ]
  },
  {
    id: '6',
    step: 6,
    title: 'Complete Recovery',
    description: 'Finalize and secure your restored vault',
    completed: false,
    substeps: [
      { id: '6-1', title: 'Confirm recovery completion', completed: false },
      { id: '6-2', title: 'Download recovery report', completed: false },
      { id: '6-3', title: 'Set up new guardian rotation', completed: false }
    ]
  }
];

export function StepByStepRecovery() {
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({
    'phase-1': false,
    'phase-2': true,
    'phase-3': false,
    'phase-4': false,
    'phase-5': false,
    'phase-6': false
  });

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  const completedPhases = RECOVERY_PHASES.filter(p => p.status === 'completed').length;
  const totalPhases = RECOVERY_PHASES.length;
  const progressPercent = (completedPhases / totalPhases) * 100;

  const getPhaseIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-primary animate-pulse" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Step-by-Step Recovery Process
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Follow each phase carefully to restore your vault access securely
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-surface-dark border border-surface-border dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Overall Progress
          </h3>
          <span className="text-sm font-bold text-primary">
            {completedPhases} of {totalPhases} phases complete
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary to-primary-dark h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Completed: Phase 1
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              In Progress: Phase 2
            </span>
          </div>
        </div>
      </div>

      {/* Recovery Phases */}
      <div className="space-y-3">
        {RECOVERY_PHASES.map((phase) => (
          <div
            key={phase.id}
            className={`border rounded-lg transition-all ${
              phase.status === 'completed'
                ? 'bg-success/5 dark:bg-success/10 border-success/30 dark:border-success/40'
                : phase.status === 'in-progress'
                ? 'bg-primary/5 dark:bg-primary/10 border-primary/30 dark:border-primary/40'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
            }`}
          >
            {/* Phase Header */}
            <button
              onClick={() => togglePhase(phase.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:opacity-75 transition-opacity"
            >
              <div className="flex items-center gap-4 flex-1 text-left">
                <div className="flex-shrink-0">
                  {getPhaseIcon(phase.status)}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-sm font-bold text-slate-900 dark:text-white">
                      {phase.phase}
                    </span>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {phase.title}
                    </h4>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${
                      phase.status === 'completed'
                        ? 'bg-success/20 text-success dark:bg-success/30'
                        : phase.status === 'in-progress'
                        ? 'bg-primary/20 text-primary dark:bg-primary/30'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      {phase.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {phase.description}
                  </p>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                {expandedPhases[phase.id] ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </button>

            {/* Phase Details */}
            {expandedPhases[phase.id] && (
              <div className="border-t border-current border-opacity-10 px-6 py-4 space-y-4">
                {/* Estimated Time */}
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Estimated Time: {phase.estimatedTime}
                  </p>
                </div>

                {/* Actions */}
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Actions Required:
                  </p>
                  <ul className="space-y-2">
                    {phase.actions.map((action, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Details */}
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Details:
                  </p>
                  <ul className="space-y-2">
                    {phase.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Phase Actions */}
                {phase.status !== 'completed' && (
                  <div className="pt-2">
                    {phase.status === 'in-progress' && (
                      <button className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors w-full">
                        Continue to Phase {phase.phase}
                      </button>
                    )}
                    {phase.status === 'pending' && (
                      <button className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg transition-colors w-full cursor-not-allowed opacity-50">
                        Locked - Complete Previous Phases
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Timeline View */}
      <div className="bg-white dark:bg-surface-dark border border-surface-border dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
          Recovery Timeline
        </h3>
        <div className="space-y-4">
          {RECOVERY_STEPS.map((step, idx) => (
            <div key={step.id} className="flex gap-4">
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  step.completed
                    ? 'bg-success text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                }`}>
                  {step.step}
                </div>
                {idx < RECOVERY_STEPS.length - 1 && (
                  <div className={`w-0.5 h-12 mt-2 ${
                    step.completed ? 'bg-success' : 'bg-slate-300 dark:bg-slate-700'
                  }`} />
                )}
              </div>

              {/* Timeline Content */}
              <div className="pb-4 pt-1 flex-1">
                <h4 className={`font-semibold ${
                  step.completed
                    ? 'text-success'
                    : 'text-slate-900 dark:text-white'
                }`}>
                  {step.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {step.description}
                </p>
                {step.substeps.some(s => !s.completed) && (
                  <div className="mt-2 space-y-1">
                    {step.substeps.map((substep) => (
                      <div key={substep.id} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <div className={`w-2 h-2 rounded-full ${
                          substep.completed ? 'bg-success' : 'bg-slate-400'
                        }`} />
                        <span className={substep.completed ? 'line-through opacity-60' : ''}>
                          {substep.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900 dark:text-amber-100 text-sm mb-1">
              Important Reminders
            </h4>
            <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
              <li>• Do not share your recovery codes with anyone</li>
              <li>• Recovery process typically takes 7-10 days</li>
              <li>• You can request guardian reminders after 24 hours</li>
              <li>• Emergency contact must be verified before proceeding</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

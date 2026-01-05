'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useIPFSResume } from '@/hooks/useIPFSResume';
import { useAccount } from 'wagmi';

interface ResumeSection {
  title: string;
  company?: string;
  institution?: string;
  startDate: string;
  endDate?: string;
  graduationDate?: string;
  description: string;
  field?: string;
  degree?: string;
  technologies?: string[];
  url?: string;
}

interface ResumeUploadComponentProps {
  onUploadSuccess?: (ipfsHash: string) => void;
  onUploadError?: (error: string) => void;
}

/**
 * Resume Upload Component
 * Handles structured resume JSON upload to IPFS with Pinata pinning
 * Features:
 * - Multiple sections (experience, education, projects)
 * - Direct IPFS storage with permanent pinning
 * - Real-time validation
 * - Progress feedback
 */
export function ResumeUploadComponent({
  onUploadSuccess,
  onUploadError,
}: ResumeUploadComponentProps) {
  const { address, isConnected } = useAccount();
  const { uploadResume, isLoading, error, success, ipfsHash } = useIPFSResume();

  const [resumeData, setResumeData] = useState({
    name: '',
    bio: '',
    skills: [] as string[],
    experience: [] as ResumeSection[],
    education: [] as ResumeSection[],
    projects: [] as ResumeSection[],
  });

  const [skillInput, setSkillInput] = useState('');
  const [activeTab, setActiveTab] = useState<'experience' | 'education' | 'projects' | 'skills'>('experience');

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter((_, i) => i !== index),
    });
  };

  const handleAddExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        {
          title: '',
          company: '',
          startDate: '',
          endDate: '',
          description: '',
        },
      ],
    });
  };

  const handleAddEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        {
          title: '',
          degree: '',
          institution: '',
          graduationDate: '',
          description: '',
          field: '',
        },
      ],
    });
  };

  const handleAddProject = () => {
    setResumeData({
      ...resumeData,
      projects: [
        ...resumeData.projects,
        {
          title: '',
          description: '',
          startDate: '',
          url: '',
          technologies: [],
        },
      ],
    });
  };

  const handleUpload = async () => {
    if (!isConnected || !address) {
      onUploadError?.('Please connect your wallet first');
      return;
    }

    if (!resumeData.name.trim()) {
      onUploadError?.('Please enter your name');
      return;
    }

    const hash = await uploadResume(resumeData);

    if (hash) {
      onUploadSuccess?.(hash);
    } else if (error) {
      onUploadError?.(error);
    }
  };

  if (!isConnected) {
    return (
      <motion.div
        className="p-8 rounded-lg bg-yellow-50 dark:bg-yellow-900 border-2 border-yellow-200 dark:border-yellow-700 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
          Please connect your wallet to upload your resume
        </p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Upload Your Resume to IPFS
        </h2>

        {/* Personal Info */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={resumeData.name}
              onChange={(e) =>
                setResumeData({ ...resumeData, name: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              placeholder="A brief description about yourself"
              value={resumeData.bio}
              onChange={(e) =>
                setResumeData({ ...resumeData, bio: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {['experience', 'education', 'projects', 'skills'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Based on Active Tab */}
        <div className="space-y-4 mb-8">
          {activeTab === 'skills' && (
            <div>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Enter a skill (e.g., React, Solidity)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddSkill();
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => handleRemoveSkill(index)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-4">
              {resumeData.experience.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No experience added yet</p>
              ) : (
                resumeData.experience.map((exp, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={exp.title}
                      onChange={(e) => {
                        const newExp = [...resumeData.experience];
                        newExp[index].title = e.target.value;
                        setResumeData({ ...resumeData, experience: newExp });
                      }}
                      className="w-full px-3 py-2 mb-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => {
                        const newExp = [...resumeData.experience];
                        newExp[index].company = e.target.value;
                        setResumeData({ ...resumeData, experience: newExp });
                      }}
                      className="w-full px-3 py-2 mb-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                ))
              )}
              <button
                onClick={handleAddExperience}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                + Add Experience
              </button>
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-4">
              {resumeData.education.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No education added yet</p>
              ) : (
                resumeData.education.map((edu, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <input
                      type="text"
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => {
                        const newEdu = [...resumeData.education];
                        newEdu[index].degree = e.target.value;
                        setResumeData({ ...resumeData, education: newEdu });
                      }}
                      className="w-full px-3 py-2 mb-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Institution"
                      value={edu.institution}
                      onChange={(e) => {
                        const newEdu = [...resumeData.education];
                        newEdu[index].institution = e.target.value;
                        setResumeData({ ...resumeData, education: newEdu });
                      }}
                      className="w-full px-3 py-2 mb-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                ))
              )}
              <button
                onClick={handleAddEducation}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                + Add Education
              </button>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-4">
              {resumeData.projects.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No projects added yet</p>
              ) : (
                resumeData.projects.map((proj, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <input
                      type="text"
                      placeholder="Project Title"
                      value={proj.title}
                      onChange={(e) => {
                        const newProj = [...resumeData.projects];
                        newProj[index].title = e.target.value;
                        setResumeData({ ...resumeData, projects: newProj });
                      }}
                      className="w-full px-3 py-2 mb-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <textarea
                      placeholder="Description"
                      value={proj.description}
                      onChange={(e) => {
                        const newProj = [...resumeData.projects];
                        newProj[index].description = e.target.value;
                        setResumeData({ ...resumeData, projects: newProj });
                      }}
                      rows={2}
                      className="w-full px-3 py-2 mb-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                ))
              )}
              <button
                onClick={handleAddProject}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                + Add Project
              </button>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <motion.div
            className="p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-100 rounded-lg mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Error: {error}
          </motion.div>
        )}

        {success && ipfsHash && (
          <motion.div
            className="p-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-100 rounded-lg mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="font-semibold">✓ Resume uploaded successfully!</p>
            <p className="text-sm mt-2 break-all">IPFS Hash: {ipfsHash}</p>
          </motion.div>
        )}

        {/* Upload Button */}
        <motion.button
          onClick={handleUpload}
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-all ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
          }`}
        >
          {isLoading ? '⏳ Uploading to IPFS...' : '📤 Upload Resume to IPFS'}
        </motion.button>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>ℹ️ About IPFS Storage:</strong> Your resume will be stored on IPFS and pinned via Pinata
            for permanent, decentralized storage. The IPFS hash can be stored on-chain for verification.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

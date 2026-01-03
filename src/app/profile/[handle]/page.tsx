"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { AchievementGallery } from "@/components/AchievementBadges";
import { AnimatedTimeline } from "@/components/AnimatedTimeline";

export default function ProfilePage() {
  const params = useParams();
  const handle = params.handle as string;
  const { address } = useAccount();

  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // TODO: Fetch profile from smart contract using handle
        // For now, mock data
        setProfileData({
          handle,
          owner: "0x...",
          createdAt: new Date(),
          updatedAt: new Date(),
          reputationScore: 250,
          verified: true,
          credentials: [],
          achievements: [],
          bio: "Professional looking to showcase verified credentials on-chain.",
        });
      } catch (err) {
        setError(`Failed to load profile: ${handle}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (handle) {
      fetchProfile();
    }
  }, [handle]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-indigo-500 animate-spin mx-auto" />
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <div className="text-4xl">❌</div>
        <h1 className="text-3xl font-bold">{error || "Profile Not Found"}</h1>
        <p className="text-slate-400 max-w-md">
          The profile you're looking for doesn't exist or hasn't been created yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl font-bold">
                {handle.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{handle}</h1>
                <p className="text-slate-400 text-sm">@{handle.toLowerCase()}</p>
              </div>
            </div>

            {profileData.verified && (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <span>✓</span>
                <span>Verified Profile</span>
              </div>
            )}
          </div>

          <div className="text-right space-y-2">
            <div className="text-3xl font-bold text-indigo-400">{profileData.reputationScore}</div>
            <div className="text-sm text-slate-400">Reputation Score</div>
          </div>
        </div>

        {profileData.bio && (
          <p className="text-slate-300 leading-relaxed">{profileData.bio}</p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
          <span>📅 Created {new Date(profileData.createdAt).toLocaleDateString()}</span>
          <span>✏️ Updated {new Date(profileData.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Achievements */}
      {profileData.achievements && profileData.achievements.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-2xl font-bold">Achievements</h2>
          <AchievementGallery
            unlockedAchievements={profileData.achievements}
            columns={4}
          />
        </div>
      )}

      {/* Credentials */}
      {profileData.credentials && profileData.credentials.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-2xl font-bold">Credentials</h2>
          <div className="space-y-3">
            {profileData.credentials.map((cred: any, idx: number) => (
              <div key={idx} className="p-4 rounded-lg bg-white/5 border border-white/20 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{cred.type}</h3>
                  {cred.verified && <span className="text-green-400 text-sm">✓ Verified</span>}
                </div>
                <p className="text-sm text-slate-400">Issued by {cred.issuer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {profileData.timeline && profileData.timeline.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-2xl font-bold">Professional History</h2>
          <AnimatedTimeline />
        </div>
      )}

      {/* Empty State */}
      {!profileData.achievements?.length && !profileData.credentials?.length && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center space-y-4">
          <div className="text-4xl">📋</div>
          <h3 className="text-xl font-semibold">Profile is empty</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            This profile hasn't added any credentials or achievements yet.
          </p>
        </div>
      )}
    </div>
  );
}

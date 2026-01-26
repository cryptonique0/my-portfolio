import React, { useState, useRef } from 'react';
import { useProfile, UserProfile, SocialLinks } from '../../hooks/useProfileEnhancements';

interface ProfileEditorProps {
  userId: string;
  onSuccess?: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ userId, onSuccess }) => {
  const { profile, loading, updateProfile, updateAvatar, updateBanner, updateSocialLinks } = useProfile(userId);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [socialData, setSocialData] = useState<SocialLinks>({});
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (profile && !editing) {
      setFormData({
        username: profile.username,
        bio: profile.bio || '',
      });
      setSocialData({
        website: profile.website || '',
        twitter: profile.twitter || '',
        instagram: profile.instagram || '',
        discord: profile.discord || '',
        telegram: profile.telegram || '',
      });
    }
  }, [profile, editing]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const url = await updateAvatar(file);
    setUploading(false);

    if (url) {
      setMessage({ type: 'success', text: 'Avatar updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: 'Failed to upload avatar' });
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const url = await updateBanner(file);
    setUploading(false);

    if (url) {
      setMessage({ type: 'success', text: 'Banner updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: 'Failed to upload banner' });
    }
  };

  const handleSaveProfile = async () => {
    const success = await updateProfile(formData);
    if (success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
      onSuccess?.();
    } else {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
  };

  const handleSaveSocialLinks = async () => {
    const success = await updateSocialLinks(socialData);
    if (success) {
      setMessage({ type: 'success', text: 'Social links updated successfully!' });
      onSuccess?.();
    } else {
      setMessage({ type: 'error', text: 'Failed to update social links' });
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-red-500">Profile not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
        }`}>
          {message.text}
        </div>
      )}

      {/* Banner Section */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg overflow-hidden">
          {profile.banner_url && (
            <img
              src={profile.banner_url.replace('ipfs://', 'https://ipfs.io/ipfs/')}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <button
          onClick={() => bannerInputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
        >
          {uploading ? '⏳ Uploading...' : '📷 Change Banner'}
        </button>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          onChange={handleBannerUpload}
          className="hidden"
        />
      </div>

      {/* Avatar Section */}
      <div className="flex items-center gap-6 -mt-20 ml-6">
        <div className="relative">
          <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                {profile.username[0].toUpperCase()}
              </div>
            )}
          </div>
          <button
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition disabled:opacity-50"
          >
            📷
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {profile.username}
            {profile.is_verified && <span className="text-blue-500">✓</span>}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {profile.nfts_created || 0} NFTs Created • {profile.nfts_owned || 0} NFTs Owned
          </p>
        </div>
      </div>

      {/* Basic Info Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Basic Information</h3>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              ✏️ Edit
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.username || ''}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{profile.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bio
            </label>
            {editing ? (
              <textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{profile.bio || 'No bio yet'}</p>
            )}
          </div>
        </div>

        {editing && (
          <div className="flex gap-4">
            <button
              onClick={handleSaveProfile}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              💾 Save Changes
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              ✖️ Cancel
            </button>
          </div>
        )}
      </div>

      {/* Social Links Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Social Links</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🌐 Website
            </label>
            <input
              type="url"
              value={socialData.website || ''}
              onChange={(e) => setSocialData({ ...socialData, website: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🐦 Twitter
            </label>
            <input
              type="text"
              value={socialData.twitter || ''}
              onChange={(e) => setSocialData({ ...socialData, twitter: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="@username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📷 Instagram
            </label>
            <input
              type="text"
              value={socialData.instagram || ''}
              onChange={(e) => setSocialData({ ...socialData, instagram: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="@username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              💬 Discord
            </label>
            <input
              type="text"
              value={socialData.discord || ''}
              onChange={(e) => setSocialData({ ...socialData, discord: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="username#1234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ✈️ Telegram
            </label>
            <input
              type="text"
              value={socialData.telegram || ''}
              onChange={(e) => setSocialData({ ...socialData, telegram: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="@username"
            />
          </div>
        </div>

        <button
          onClick={handleSaveSocialLinks}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          💾 Save Social Links
        </button>
      </div>
    </div>
  );
};

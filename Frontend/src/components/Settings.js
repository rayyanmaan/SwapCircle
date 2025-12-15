'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/services/api';
import { getImageUrl } from '@/utils/itemParser';

export default function Settings() {
  const router = useRouter();
  const { user: authUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    username: '',
    bio: '',
    location: '',
    instagram_handle: '',
    whatsapp_number: '',
    facebook_url: '',
    twitter_handle: '',
    linkedin_url: '',
  });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated || !authUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const userData = await userAPI.getUser(authUser.id);

        setUser({
          id: userData.id,
          name: userData.full_name || userData.username || 'User',
          username: userData.username,
          email: userData.email || '',
          avatar: (userData.full_name || userData.username || 'U')[0].toUpperCase(),
          profile_pic: userData.profile_pic || null,
          bio: userData.bio || '',
          location: userData.location || '',
          instagram_handle: userData.instagram_handle || '',
          whatsapp_number: userData.whatsapp_number || '',
          facebook_url: userData.facebook_url || '',
          twitter_handle: userData.twitter_handle || '',
          linkedin_url: userData.linkedin_url || '',
        });

        // Initialize edit form
        setEditForm({
          full_name: userData.full_name || '',
          username: userData.username || '',
          bio: userData.bio || '',
          location: userData.location || '',
          instagram_handle: userData.instagram_handle || '',
          whatsapp_number: userData.whatsapp_number || '',
          facebook_url: userData.facebook_url || '',
          twitter_handle: userData.twitter_handle || '',
          linkedin_url: userData.linkedin_url || '',
        });

        // Set profile picture preview if available
        if (userData.profile_pic) {
          setProfilePicPreview(getImageUrl({ url: userData.profile_pic }));
        } else {
          setProfilePicPreview(null);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, authUser]);

  const handleProfilePicChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
      setSuccessMessage(null);
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB.');
      setSuccessMessage(null);
      return;
    }

    if (file.size === 0) {
      setError('File is empty.');
      setSuccessMessage(null);
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setProfilePicFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleProfilePicUpload = async () => {
    if (!profilePicFile || !authUser) return;

    setUploadingPic(true);
    setError(null);
    try {
      const updatedUser = await userAPI.uploadProfilePicture(authUser.id, profilePicFile);
      
      // Update local state
      setUser(prev => prev ? {
        ...prev,
        profile_pic: updatedUser.profile_pic,
      } : null);

      setProfilePicFile(null);
      // Keep preview as the uploaded image URL
      if (updatedUser.profile_pic) {
        setProfilePicPreview(getImageUrl({ url: updatedUser.profile_pic }));
      }
      
      setError(null);
      setSuccessMessage('Profile picture uploaded successfully!');
      
      // Clear success message after 4 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setError(err.message || 'Failed to upload profile picture');
      setSuccessMessage(null);
    } finally {
      setUploadingPic(false);
    }
  };

  const handleSave = async () => {
    if (!authUser) return;

    setSaving(true);
    setError(null);
    try {
      const updates = {
        full_name: editForm.full_name || null,
        username: editForm.username,
        bio: editForm.bio || null,
        location: editForm.location || null,
        instagram_handle: editForm.instagram_handle || null,
        whatsapp_number: editForm.whatsapp_number || null,
        facebook_url: editForm.facebook_url || null,
        twitter_handle: editForm.twitter_handle || null,
        linkedin_url: editForm.linkedin_url || null,
      };

      const updatedUser = await userAPI.updateUser(authUser.id, updates);
      
      // Update local state
      setUser(prev => prev ? {
        ...prev,
        name: updatedUser.full_name || updatedUser.username || 'User',
        username: updatedUser.username,
        bio: updatedUser.bio || '',
        location: updatedUser.location || '',
        instagram_handle: updatedUser.instagram_handle || '',
        whatsapp_number: updatedUser.whatsapp_number || '',
        facebook_url: updatedUser.facebook_url || '',
        twitter_handle: updatedUser.twitter_handle || '',
        linkedin_url: updatedUser.linkedin_url || '',
      } : null);

      setError(null);
      setSuccessMessage('Profile updated successfully!');
      
      // Redirect to profile page after 1.5 seconds to show updated profile
      setTimeout(() => {
        window.location.href = '/profile';
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err.message || err.detail || 'Failed to update profile';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-swapcircle-secondary">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-swapcircle-secondary mb-4">Please log in to view settings</p>
          <Link href="/" className="btn-primary">Go to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="heading-primary text-3xl font-bold mb-8">Settings</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2 animate-fade-in">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      <div className="bg-swapcircle-alt rounded-lg p-6 md:p-8 space-y-8">
        {/* Profile Picture Section */}
        <div>
          <h2 className="heading-primary text-xl font-semibold mb-4">Profile Picture</h2>
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-swapcircle-primary flex items-center justify-center overflow-hidden">
                {profilePicPreview || (user.profile_pic && getImageUrl({ url: user.profile_pic })) ? (
                  <img
                    src={profilePicPreview || getImageUrl({ url: user.profile_pic })}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <span className={`text-white text-4xl font-bold ${profilePicPreview || (user.profile_pic && getImageUrl({ url: user.profile_pic })) ? 'hidden' : ''}`}>
                  {user.avatar}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Choose Photo
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleProfilePicChange}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-swapcircle-secondary mt-2">
                JPEG, PNG, GIF, or WebP. Max 5MB.
              </p>
              
              {profilePicFile && (
                <div className="mt-4 p-4 border border-swapcircle rounded-lg bg-white">
                  <div className="flex items-center gap-4">
                    <img
                      src={profilePicPreview}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-swapcircle-primary font-medium">{profilePicFile.name}</p>
                      <p className="text-xs text-swapcircle-secondary">
                        {(profilePicFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={handleProfilePicUpload}
                      disabled={uploadingPic}
                      className="btn-primary bg-swapcircle-primary text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                    >
                      {uploadingPic ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information Section */}
        <div>
          <h2 className="heading-primary text-xl font-semibold mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-swapcircle-secondary mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-swapcircle rounded-lg focus:outline-none focus:ring-2 focus:ring-swapcircle-primary text-swapcircle-primary bg-white"
                placeholder="Full Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-swapcircle-secondary mb-1">
                Username *
              </label>
              <input
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="w-full px-3 py-2 border border-swapcircle rounded-lg focus:outline-none focus:ring-2 focus:ring-swapcircle-primary text-swapcircle-primary bg-white"
                placeholder="Username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-swapcircle-secondary mb-1">
                Bio
              </label>
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full px-3 py-2 border border-swapcircle rounded-lg focus:outline-none focus:ring-2 focus:ring-swapcircle-primary text-swapcircle-primary bg-white resize-none"
                placeholder="Tell us about yourself..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-swapcircle-secondary mt-1">
                {editForm.bio.length}/500 characters
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-swapcircle-secondary mb-1">
                Location
              </label>
              <select
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="w-full px-3 py-2 border border-swapcircle rounded-lg focus:outline-none focus:ring-2 focus:ring-swapcircle-primary text-swapcircle-primary bg-white"
              >
                <option value="">Select a location</option>
                <option>San Francisco</option>
                <option>Berlin</option>
                <option>Buenos Aires</option>
                <option>Hyderabad</option>
                <option>Seoul</option>
                <option>Taipei</option>
                <option>Tokyo</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-swapcircle-secondary mb-1">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3 py-2 border border-swapcircle rounded-lg bg-swapcircle-alt text-swapcircle-secondary cursor-not-allowed"
              />
              <p className="text-xs text-swapcircle-secondary mt-1">Email cannot be changed</p>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div>
          <h2 className="heading-primary text-xl font-semibold mb-4">Social Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-swapcircle-secondary mb-1">
                Instagram Handle
              </label>
              <input
                type="text"
                value={editForm.instagram_handle}
                onChange={(e) => setEditForm({ ...editForm, instagram_handle: e.target.value })}
                className="w-full px-3 py-2 border border-swapcircle rounded-lg focus:outline-none focus:ring-2 focus:ring-swapcircle-primary text-swapcircle-primary bg-white"
                placeholder="@username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-swapcircle-secondary mb-1">
                WhatsApp Number
              </label>
              <input
                type="text"
                value={editForm.whatsapp_number}
                onChange={(e) => setEditForm({ ...editForm, whatsapp_number: e.target.value })}
                className="w-full px-3 py-2 border border-swapcircle rounded-lg focus:outline-none focus:ring-2 focus:ring-swapcircle-primary text-swapcircle-primary bg-white"
                placeholder="+1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-swapcircle-secondary mb-1">
                Facebook URL
              </label>
              <input
                type="url"
                value={editForm.facebook_url}
                onChange={(e) => setEditForm({ ...editForm, facebook_url: e.target.value })}
                className="w-full px-3 py-2 border border-swapcircle rounded-lg focus:outline-none focus:ring-2 focus:ring-swapcircle-primary text-swapcircle-primary bg-white"
                placeholder="https://facebook.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-swapcircle-secondary mb-1">
                Twitter/X Handle
              </label>
              <input
                type="text"
                value={editForm.twitter_handle}
                onChange={(e) => setEditForm({ ...editForm, twitter_handle: e.target.value })}
                className="w-full px-3 py-2 border border-swapcircle rounded-lg focus:outline-none focus:ring-2 focus:ring-swapcircle-primary text-swapcircle-primary bg-white"
                placeholder="@username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-swapcircle-secondary mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={editForm.linkedin_url}
                onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })}
                className="w-full px-3 py-2 border border-swapcircle rounded-lg focus:outline-none focus:ring-2 focus:ring-swapcircle-primary text-swapcircle-primary bg-white"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-4 border-t border-swapcircle">
          <button
            onClick={handleSave}
            disabled={saving || uploadingPic}
            className="btn-primary bg-swapcircle-primary text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/profile"
            className="px-6 py-2 border border-swapcircle rounded-lg text-swapcircle-secondary hover:bg-swapcircle-alt"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}


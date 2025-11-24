import React, { useRef } from 'react';
import type { User } from '../../types';
import { toast } from 'sonner';
import cloudinaryService from '../../services/cloudinary.service';
import userService from '../../services/user.service';

interface ProfileDetailsProps {
  user: User;
  avatarPreview: string | null;
  onAvatarUpdate: (avatarUrl: string) => void;
}

export const ProfileDetails: React.FC<ProfileDetailsProps> = ({ user, avatarPreview, onAvatarUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    try {
      setIsUploading(true);
      
      // Upload to Cloudinary
      const imageUrl = await cloudinaryService.uploadImage(file);
      debugger;
      
      // Update user profile with new avatar URL
      await userService.update(user._id, { avatarUrl: imageUrl });
      
      // Update local state
      onAvatarUpdate(imageUrl);
      
      toast.success('Avatar updated successfully!');
    } catch {
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="lg:col-span-1 h-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-3xl font-light">
              {avatarPreview || user.avatarUrl ? (
                <img
                  src={avatarPreview || user.avatarUrl}
                  alt={user.fullName || 'User'}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <span>{user.fullName?.charAt(0)?.toUpperCase() || 'U'}</span>
              )}
            </div>
            {user.authProvider !== 'google' && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleCameraClick}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed "
                  title="Upload avatar image"
                >
                  {isUploading ? (
                    <svg className="w-3 h-3 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg
                      className="w-3 h-3 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>

          <h2 className="text-xl font-medium text-gray-900 text-center">{user.fullName || 'User'}</h2>
          <p className="text-sm text-gray-500 mt-1">{user.email || ''}</p>

          <div className="mt-4 w-full space-y-3">
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">Role</span>
              <span className="text-sm font-medium text-gray-900 capitalize">{user.role}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">Status</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">Auth Provider</span>
              <span className="text-sm font-medium text-gray-900 capitalize">{user.authProvider}</span>
            </div>

            {user.lastLogin && (
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <span className="text-sm text-gray-600">Last Login</span>
                <span className="text-sm text-gray-900">
                  {new Date(user.lastLogin).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

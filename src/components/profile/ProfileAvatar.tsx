import React from 'react';
import type { ProfileAvatarProps } from '../../types/profile.types';

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  avatarUrl,
  userName,
  authProvider,
  isActive,
}) => {
  return (
    <div className="text-center">
      <div className="relative inline-block">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={userName}
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg">
            <span className="text-4xl font-bold text-white">
              {userName?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <div
          className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white ${
            isActive ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      </div>
      <h2 className="mt-4 text-2xl font-semibold text-gray-900">{userName}</h2>
      <p className="text-sm text-gray-500 capitalize">{authProvider} Account</p>
    </div>
  );
};

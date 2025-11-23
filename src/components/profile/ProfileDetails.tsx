import React from 'react';
import type { User } from '../../types';

interface ProfileDetailsProps {
  user: User;
  avatarPreview: string | null;
}

export const ProfileDetails: React.FC<ProfileDetailsProps> = ({ user, avatarPreview }) => {
  return (
    <div className="lg:col-span-1">
      <div className="lg:sticky lg:top-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border border-gray-200">
                <svg
                  className="w-4 h-4 text-gray-600"
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
              </div>
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
    </div>
  );
};

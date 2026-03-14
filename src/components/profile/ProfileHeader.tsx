import React, { Activity } from 'react';
import type { ProfileHeaderProps } from '../../types/profile.types';

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ isEditing, onEdit, onCancel }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account information</p>
      </div>
      <Activity mode={!isEditing ? "visible" : "hidden"}>
        <button
          onClick={onEdit}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Edit Profile
        </button>
      </Activity>
      <Activity mode={isEditing ? "visible" : "hidden"}>
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </Activity>
    </div>
  );
};

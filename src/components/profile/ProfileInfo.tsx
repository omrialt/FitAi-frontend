import React from 'react';
import type { User } from '../../types';
import type { ProfileInfoProps, InfoItemProps } from '../../types/profile.types';

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
  return (
    <div className="mt-6 space-y-4">
      <InfoItem label="Email" value={user.email} />
      <InfoItem label="Full Name" value={user.fullName} />
      <InfoItem label="Date of Birth" value={user.birthDate} />
      <InfoItem label="Gender" value={user.gender} />
      <InfoItem label="Role" value={user.role} />
      <InfoItem
        label="Member Since"
        value={new Date(user.createdAt).toLocaleDateString()}
      />
      {user.lastLogin && (
        <InfoItem
          label="Last Login"
          value={new Date(user.lastLogin).toLocaleString()}
        />
      )}
    </div>
  );
};

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="text-gray-900">{value || 'Not provided'}</span>
    </div>
  );
};

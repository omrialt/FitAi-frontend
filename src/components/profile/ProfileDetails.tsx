import React, { useRef } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import cloudinaryService from '../../services/cloudinary.service';
import userService from '../../services/user.service';
import { StitchIcon } from '../common/StitchIcon';
import type { ProfileDetailsProps } from '../../types/profile.types';

/**
 * Profile summary card — "Performance Lab" design.
 */
export const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  user,
  avatarPreview,
  onAvatarUpdate,
}) => {
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.selectImageFile'));
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(t('profile.imageTooLarge'));
      return;
    }

    try {
      setIsUploading(true);
      const imageUrl = await cloudinaryService.uploadImage(file);
      await userService.update(user._id, { avatarUrl: imageUrl });
      onAvatarUpdate(imageUrl);
      toast.success(t('profile.avatarUpdated'));
    } catch {
      toast.error(t('profile.avatarUploadFailed'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const avatarSrc = avatarPreview || user.avatarUrl;

  const rows: { label: string; value: React.ReactNode }[] = [
    {
      label: t('profile.role'),
      value: <span className="capitalize">{user.role}</span>,
    },
    {
      label: t('profile.status'),
      value: (
        <span
          className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${
            user.isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-surface-container-high text-on-surface-variant'
          }`}
        >
          {user.isActive ? t('common.active') : t('common.inactive')}
        </span>
      ),
    },
    {
      label: t('profile.authProvider'),
      value: <span className="capitalize">{user.authProvider}</span>,
    },
  ];

  if (user.lastLogin) {
    rows.push({
      label: t('profile.lastLogin'),
      value: new Date(user.lastLogin).toLocaleDateString(i18n.language, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    });
  }

  return (
    <div className="lg:col-span-1">
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 h-full">
        <div className="flex flex-col items-center">
          {/* Avatar with upload control */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-primary-gradient flex items-center justify-center text-white text-3xl font-light overflow-hidden">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={user.fullName || t('profile.user')}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <span>{user.fullName?.charAt(0)?.toUpperCase() || 'U'}</span>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              title={t('profile.uploadAvatar')}
              aria-label={t('profile.uploadAvatar')}
              className="absolute bottom-0 end-0 w-8 h-8 bg-surface-container-lowest rounded-full shadow-md border border-outline-variant/15 hover:bg-surface-container-low transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <StitchIcon
                name={isUploading ? 'sync' : 'edit'}
                size={14}
                className={isUploading ? 'animate-spin' : undefined}
              />
            </button>
          </div>

          <h2 className="text-xl font-bold text-on-surface text-center">
            {user.fullName || t('profile.user')}
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">{user.email || ''}</p>

          <dl className="mt-6 w-full space-y-1">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-3 border-t border-outline-variant/10"
              >
                <dt className="text-sm text-on-surface-variant">{row.label}</dt>
                <dd className="text-sm font-medium text-on-surface">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

/**
 * Prop types for profile section components
 */

import type { User } from './auth.types';
import type { ProfileFormData } from '../schemas/profile.schemas';
import type { Control, FieldErrors } from 'react-hook-form';
import type { FormEvent } from 'react';

export interface ProfileAvatarProps {
  avatarUrl?: string;
  userName: string;
  authProvider: string;
  isActive: boolean;
}

export interface ProfileDetailsProps {
  user: User;
  avatarPreview: string | null;
  onAvatarUpdate: (avatarUrl: string) => void;
}

export interface ProfileFormProps {
  errors: FieldErrors<ProfileFormData>;
  control: Control<ProfileFormData>;
  isGoogleAuth: boolean;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export interface ProfileHeaderProps {
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
}

export interface ProfileInfoProps {
  user: User;
}

export interface InfoItemProps {
  label: string;
  value?: string;
}

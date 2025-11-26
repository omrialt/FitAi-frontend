import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useFormHandler } from '../hooks/useFormHandler';
import { profileSchema, type ProfileFormData } from '../schemas/profile.schemas';
import type { UpdateProfileDto } from '../types/user.types';
import { ProfileDetails, ProfileForm } from '../components/profile';
import { AppLayout } from '../components/AppLayout';
import userService from '../services/user.service';
import { toast } from 'sonner';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isGoogleAuth = user?.authProvider === 'google';

  // Setup form handler with Zod validation
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset: resetForm,
    setValue,
  } = useFormHandler<ProfileFormData>({
    schema: profileSchema,
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      birthDate: user?.birthDate ? user.birthDate.split('T')[0] : '',
      gender: user?.gender || 'male',
      height: user?.height || '',
      isActive: user?.isActive ?? true,
      password: '',
      avatarUrl: user?.avatarUrl || '',
    },
    onSubmit: async (formData) => {
      if (!user?._id) return;

      const submitData: UpdateProfileDto = {};
      const formFullName = formData.fullName?.trim() || '';
      const userFullName = user.fullName?.trim() || '';
  
      
      if (formFullName !== userFullName) {
        submitData.fullName = formData.fullName;
      }
      
      const formEmail = formData.email?.trim() || '';
      const userEmail = user.email?.trim() || '';
      if (formEmail !== userEmail) {
        submitData.email = formData.email;
      }
      
      const formBirthDate = formData.birthDate || '';
      const userBirthDate = user.birthDate ? user.birthDate.split('T')[0] : '';
      if (formBirthDate !== userBirthDate) {
        submitData.birthDate = formData.birthDate;
      }
      
      if (formData.gender !== user.gender) {
        submitData.gender = formData.gender;
      }
      
      if (formData.isActive !== user.isActive) {
        submitData.isActive = formData.isActive;
      }
      
      // Add height if changed (handle both number and empty string)
      const currentHeight = user.height || '';
      const newHeight = formData.height;
      if (newHeight !== currentHeight) {
        if (typeof newHeight === 'number') {
          submitData.height = newHeight;
        }
      }

      // Add avatarUrl if changed
      const currentAvatarUrl = user.avatarUrl || '';
      if (formData.avatarUrl !== currentAvatarUrl) {
        submitData.avatarUrl = formData.avatarUrl || '';
      }

      // Add password if provided and not Google auth
      if (formData.password && formData.password.trim() !== '' && !isGoogleAuth) {
        submitData.password = formData.password;
      }

      // Check if there are any changes
      if (Object.keys(submitData).length === 0) {
        toast.info('No changes to save');
        return;
      }


      try {
        setIsLoading(true);
        
        const updatedUser = await userService.update(user._id, submitData);


        updateUser({
          ...user,
          fullName: updatedUser.fullName ?? user.fullName,
          email: updatedUser.email ?? user.email,
          birthDate: updatedUser.birthDate ?? user.birthDate,
          gender: updatedUser.gender ?? user.gender,
          height: updatedUser.height ?? user.height,
          isActive: updatedUser.isActive ?? user.isActive,
          avatarUrl: updatedUser.avatarUrl ?? user.avatarUrl,
        });

        toast.success('Profile updated successfully!');
        
        // Clear password field after success
        setValue('password', '');
      } catch (err: unknown) {
        console.error('Update error:', err);
        const errorMessage = err instanceof Error 
          ? err.message 
          : typeof err === 'object' && err !== null && 'response' in err
            ? (err as { response?: { data?: { message?: string } } })?.response?.data?.message
            : undefined;
        
        toast.error(errorMessage || 'Failed to update profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Update form only on initial load, not when user changes
  useEffect(() => {
    if (user && !isLoading) {
      resetForm({
        fullName: user.fullName || '',
        email: user.email || '',
        birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
        gender: user.gender || 'male',
        height: user.height || '',
        isActive: user.isActive ?? true,
        password: '',
        avatarUrl: user.avatarUrl || '',
      });
      setAvatarPreview(user.avatarUrl || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]); // Only reset when user ID changes (different user), not on every user update

  const handleCancel = () => {
    if (user) {
      resetForm({
        fullName: user.fullName || '',
        email: user.email || '',
        birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
        gender: user.gender || 'male',
        height: user.height || '',
        isActive: user.isActive ?? true,
        password: '',
        avatarUrl: user.avatarUrl || '',
      });
      setAvatarPreview(user.avatarUrl || null);
    }
  };

  const handleAvatarUpdate = (avatarUrl: string) => {
    // Update the user in the auth store
    updateUser({ ...user, avatarUrl });
    // Update the preview
    setAvatarPreview(avatarUrl);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading user data...</p>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-light text-gray-900">Profile</h1>
            <p className="mt-2 text-sm text-gray-600">Manage your account information and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Overview - Left Column */}
            <ProfileDetails user={user} avatarPreview={avatarPreview} onAvatarUpdate={handleAvatarUpdate} />

            {/* Editable Form Section - Right Column */}
            <div className="lg:col-span-2">
              <ProfileForm
                control={control}
                errors={errors}
                isGoogleAuth={isGoogleAuth}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isSubmitting || isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;

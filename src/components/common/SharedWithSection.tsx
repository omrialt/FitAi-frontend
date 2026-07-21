/**
 * SharedWithSection - Common component for displaying and managing shared access to plans
 * Can be used in both view-only mode (training details) and with share/revoke capabilities (nutrition details)
 */

import { Stack, Title, Card, Text, Avatar, Group, Box, Button, Modal, Select } from '@mantine/core';
import { useState, Activity } from 'react';
import { IconUser } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import type { SharedWithSectionProps } from '../../types/common.types';

export function SharedWithSection({
  sharedAccess,
  allUsers,
  title,
  emptyMessage,
  showActions = false,
  onShare,
  onRevoke,
  loading = false,
}: SharedWithSectionProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('common.sharedWith');
  const resolvedEmptyMessage = emptyMessage ?? t('common.notShared');
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [accessLevel, setAccessLevel] = useState<string>('view');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleShare = async () => {
    if (!selectedUserId || !onShare) return;

    setIsSubmitting(true);
    try {
      await onShare(selectedUserId, accessLevel);
      setModalOpened(false);
      setSelectedUserId('');
      setAccessLevel('view');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserDetails = (userId: string) => {
    return allUsers.find((u) => u._id === userId);
  };

  const availableUsers = showActions
    ? allUsers.filter((user) => !sharedAccess.some((sa) => sa.userId === user._id))
    : [];

  // Don't render anything if there's no shared access and no actions available
  if (sharedAccess.length === 0 && !showActions) {
    return null;
  }

  return (
    <>
      <Stack gap="lg" mb="xl">
        <Group justify="space-between" align="center">
          <Title order={2}>{resolvedTitle}</Title>
          {showActions && (
            <Button size="sm" onClick={() => setModalOpened(true)} disabled={loading} my="sm">
              {t('common.sharePlan')}
            </Button>
          )}
        </Group>

        <Activity mode={sharedAccess.length === 0 ? "visible" : "hidden"}>
          <Text c="dimmed" size="sm" ta="center">
            {resolvedEmptyMessage}
          </Text>
        </Activity>

        <Activity mode={sharedAccess.length > 0 ? "visible" : "hidden"}>
          <Stack gap="sm">
            {sharedAccess.map((entry, index) => {
              const user = getUserDetails(entry.userId);
              if (!user) return null;

              return (
                <Card key={index} shadow="sm" p="md" withBorder>
                  <Group gap="md" justify="space-between" wrap="nowrap">
                    <Group gap="md">
                      <Avatar color="blue" radius="xl">
                        <IconUser size={24} />
                      </Avatar>
                      <Box style={{ flex: 1 }}>
                        <Text fw={600} size="md">
                          {user.fullName}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {user.email}
                        </Text>
                      </Box>
                    </Group>
                    {showActions && onRevoke && (
                      <Button
                        size="xs"
                        variant="subtle"
                        color="red"
                        onClick={() => onRevoke(entry.userId)}
                        disabled={loading}
                      >
                        {t('common.revoke')}
                      </Button>
                    )}
                  </Group>
                </Card>
              );
            })}
          </Stack>
        </Activity>
      </Stack>

      <Activity mode={showActions ? "visible" : "hidden"}>
        <Modal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          title={t('common.sharePlan')}
          size="md"
        >
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              {t('common.shareModalDescription')}
            </Text>

            <Select
              label={t('common.selectUser')}
              placeholder={t('common.chooseUser')}
              data={availableUsers.map((user) => ({
                value: user._id,
                label: user.fullName,
              }))}
              value={selectedUserId}
              onChange={(value) => setSelectedUserId(value || '')}
              searchable
              required
            />

            <Select
              label={t('common.accessLevel')}
              placeholder={t('common.chooseAccessLevel')}
              data={[{ value: 'view', label: t('common.viewOnly') }]}
              value={accessLevel}
              onChange={(value) => setAccessLevel(value || 'view')}
              required
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={() => setModalOpened(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleShare}
                disabled={!selectedUserId || isSubmitting}
                loading={isSubmitting}
              >
                {t('common.share')}
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Activity>
    </>
  );
}

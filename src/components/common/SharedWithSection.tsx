/**
 * SharedWithSection - Common component for displaying and managing shared access to plans
 * Can be used in both view-only mode (training details) and with share/revoke capabilities (nutrition details)
 */

import { Stack, Title, Card, Text, Avatar, Group, Box, Button, Modal, Select } from '@mantine/core';
import { useState, Activity } from 'react';
import { IconUser } from '@tabler/icons-react';
import type { User } from '../../types/auth.types';

interface SharedAccessEntry {
  userId: string;
  accessLevel?: string;
  objectType?: string;
}

interface SharedWithSectionProps {
  sharedAccess: SharedAccessEntry[];
  allUsers: User[];
  title?: string;
  emptyMessage?: string;
  showActions?: boolean;
  onShare?: (userId: string, accessLevel: string) => Promise<void>;
  onRevoke?: (userId: string) => Promise<void>;
  loading?: boolean;
}

export function SharedWithSection({
  sharedAccess,
  allUsers,
  title = 'Shared With',
  emptyMessage = 'This plan is not shared with anyone yet',
  showActions = false,
  onShare,
  onRevoke,
  loading = false,
}: SharedWithSectionProps) {
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
          <Title order={2}>{title}</Title>
          {showActions && (
            <Button size="sm" onClick={() => setModalOpened(true)} disabled={loading} my="sm">
              Share Plan
            </Button>
          )}
        </Group>

        <Activity mode={sharedAccess.length === 0 ? "visible" : "hidden"}>
          <Text c="dimmed" size="sm" ta="center">
            {emptyMessage}
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
                        Revoke
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
          title="Share Plan"
          size="md"
        >
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Select a user to share this plan with. They will have view-only access.
            </Text>

            <Select
              label="Select User"
              placeholder="Choose a user"
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
              label="Access Level"
              placeholder="Choose access level"
              data={[{ value: 'view', label: 'View Only' }]}
              value={accessLevel}
              onChange={(value) => setAccessLevel(value || 'view')}
              required
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={() => setModalOpened(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleShare}
                disabled={!selectedUserId || isSubmitting}
                loading={isSubmitting}
              >
                Share
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Activity>
    </>
  );
}

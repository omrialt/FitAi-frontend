/**
 * ShareSection - Owner-only section for sharing nutrition plan with users
 */

import { Stack, Title, Card, Text, Group,  Button, Modal, Select } from '@mantine/core';
import { useState } from 'react';
import type { SharedAccessEntry } from '../../../types/nutrition.types';
import type { User } from '../../../types/auth.types';

interface ShareSectionProps {
  sharedAccess: SharedAccessEntry[];
  allUsers: User[];
  onShare: (userId: string, accessLevel: string) => Promise<void>;
  onRevoke: (userId: string) => Promise<void>;
  loading?: boolean;
}

export function ShareSection({
  sharedAccess,
  allUsers,
  onShare,
}: ShareSectionProps) {
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [accessLevel, setAccessLevel] = useState<string>('view');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleShare = async () => {
    if (!selectedUserId) return;

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


  const getUserName = (userId: string) => {
    const user = allUsers.find((u) => u._id === userId);
    return user?.fullName || 'Unknown User';
  };

  const availableUsers = allUsers.filter(
    (user) => !sharedAccess.some((sa) => sa.userId === user._id)
  );

  return (
    <>
      <Stack gap="lg" mb="xl">
        <Title order={2}>Shared With</Title>

        {sharedAccess.length === 0 ? (
          <Text c="dimmed" size="sm" ta="center">
            This plan is not shared with anyone yet
          </Text>
        ) : (
          <Stack gap="sm">
            {sharedAccess.map((entry, index) => (
              <Card key={index} shadow="sm" p="md" withBorder>
                <Text fw={500}>{getUserName(entry.userId)}</Text>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Share Nutrition Plan"
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
            data={[
              { value: 'view', label: 'View Only' },
            ]}
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
    </>
  );
}

/**
 * RatingsSection - Display ratings list and add rating form
 */

import { Stack, Title, Card, Text, Group, Box, Divider, Avatar } from '@mantine/core';
import { StarRating } from '../../common/StarRating';
import type { Rating } from '../../../types/nutrition.types';
import type { User } from '../../../types/auth.types';
import type { RatingsSectionProps } from '../../../types/nutrition-components.types';

export function RatingsSection({ ratings }: RatingsSectionProps) {
  // Format date as dd/mm/yyyy
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Stack gap="lg" mb="xl">
      <Title order={2}>Ratings & Reviews</Title>

      {ratings.length === 0 ? (
        <Text c="dimmed" size="sm" ta="center">
          No ratings yet. Be the first to rate this plan!
        </Text>
      ) : (
        <Stack gap="md">
          {ratings.map((rating, index) => {
            const user = typeof rating.userId === 'string' ? null : (rating.userId as User);
            const userName = user?.fullName || 'Anonymous';

            return (
              <Card key={index} shadow="sm" p="md" withBorder>
                <Group align="flex-start" gap="md">
                  <Avatar color="blue" radius="xl">
                    {userName.charAt(0).toUpperCase()}
                  </Avatar>
                  
                  <Box style={{ flex: 1 }}>
                    <Group justify="space-between" mb="xs">
                      <Group gap="xs">
                        <Text fw={500}>{userName}</Text>
                        <Text size="xs" c="dimmed">
                          {formatDate(rating.createdAt)}
                        </Text>
                      </Group>
                      <StarRating rating={rating.rating} readonly size={16} />
                    </Group>

                    {rating.comment && (
                      <Text size="sm" c="dimmed">
                        {rating.comment}
                      </Text>
                    )}
                  </Box>
                </Group>
              </Card>
            );
          })}
        </Stack>
      )}

      <Divider my="md" />
    </Stack>
  );
}
